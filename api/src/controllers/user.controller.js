import db from "../models/db.js";
import log from '../middleware/logger.js';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import * as fs from 'fs';
import crypto from 'crypto';
import { spawnSync } from 'child_process';

const Op = Sequelize.Op;
const User = db.users;
const Job = db.jobs;
const sequelize = db.sequelize;
const Skill = db.skills;

config();

export async function create(req, res) {
  if (!(req.body && req.body.email && req.body.password && req.body.name )) {
    return res.status(400).send({
      message: "Email, password, or name can not be empty!"
    });
  }

  const { email, password, name} = req.body;

  const user = {
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 8),
    name: name
  };

  
  try {
    const createdUser = await User.create(user);
    return res.status(200).send({
      message: "Success",
      user: createdUser
    });
  } catch(e) {
    log(e);
    return res.status(500).send({
      message: "Internal server error"
    });
  }
};

export async function authenticate(req, res) {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).send({
      message: "Invalid credentials supplied!"
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.status(200).json({
          token: jwt.sign(
            { id: user.id, email: user.email },
            process.env.TOKEN_KEY, 
            { expiresIn: "8h" }
          ),
          user: user
      });
    }

    return res.status(401).send({
      message: "Unauthorized"
    });
  } catch(e) {
    log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};

export async function retrieveAll(req, res) {
  try {
    return res.status(200).json({
        users: await User.findAll()
    });
  } catch(e) {
    log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};

export async function retrieveById(req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, { 
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }, 
        },
      ]
    });

    if(!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    return res.status(200).json({
      user
    })

  } catch(e) {
    log(e);

    return res.status(500).send({
      message:'Internal server error'
    });
  }
}

export async function updateById(req, res) {
  try {
    const userId = req.params.id;

    if (userId != req.user.id)
      return res.status(401).send({
        message: 'Unauthorized'
      });

    const userData = req.body;

    const user = await User.findByPk(userId, { 
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }, 
        },
      ]
    });

    if (!user)
      return res.status(404).json({
        message: 'User not found'
      })

     // Validate the user data
     if (!userData.name || !userData.email || !userData.profession || !userData.city || !userData.area || !userData.country) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    user.name = userData.name;
    user.email = userData.email;
    user.profession = userData.profession;
    user.city = userData.city;
    user.area = userData.area;
    user.country = userData.country;

     // Update user skills
    if (userData.skills && Array.isArray(userData.skills)) {
      // Remove existing user skills
      await user.setSkills([]);
      
      // Title case each skill
      userData.skills = userData.skills.map((skill) => {
        return skill.split(' ')
          .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
          .join(' ');
      });

      let uncreatedSkills = [];

      for (const skill of userData.skills) {
        const skillInstance = await Skill.findOne({ where: { name: skill } });

        if (!skillInstance)
          uncreatedSkills.push({ name: skill });
      }

      if (uncreatedSkills)
        await Skill.bulkCreate(uncreatedSkills);
      
      const skillInstances = await Skill.findAll({ where: { name: userData.skills } });

      await user.setSkills(skillInstances);
    }

    await user.save();

    const savedUser = await User.findByPk(userId, { 
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }, 
        },
      ]
    });

    return res.status(200).json({
      message: "User updated successfully",
      savedUser
    });

  } catch(e) {
    log(e)

    return res.status(500).send({
      message: "Internal server error"
    });
  }
}

export async function deleteById(req, res) {
  try {
    const userId = req.params.id;

    if (userId != req.user.id)
      return res.status(401).send({
        message: 'Unauthorized'
      });

    const user = await User.findOne({where: {id:userId}});

    if(!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    // Delete the user
    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });


  } catch(e) {
    log(e)

    return res.status(500).send({
      message: "Internal server error"
    });
  }
}

export async function followById(req, res) {
  try {
    const userId = req.params.id; // Assuming the current user's ID is passed as a URL parameter

    if (userId != req.user.id)
      return res.status(401).send({
        message: 'Unauthorized'
      });
    
    const targetUserId = req.params.targetUserId; // Assuming the target user's ID is passed as a URL parameter

    const currentUser = await User.findByPk(userId); // Assuming there is a model or function to retrieve a user by ID
    const targetUser = await User.findByPk(targetUserId); // Assuming there is a model or function to retrieve a user by ID
   
    if (!currentUser || !targetUser || userId === targetUserId) {
      return res.status(404).json({
        message: "Invalid user ID provided"
      });
    }

    const isAlreadyFollowing = await currentUser.hasFollowingLinks(targetUser);

    if (isAlreadyFollowing) {
      return res.status(400).json({
        message: "User is already following the target user"
      });
    }

    await currentUser.addFollowingLinks(targetUser);

    return res.status(200).json({
      message: "User successfully followed",
      user: currentUser,
    });

  } catch (e) {
    log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};

export async function getFollowedUsersById(req, res) {
  try {
    const userId = req.params.id; // Assuming the user's ID is passed as a URL parameter

    const user = await User.findByPk(userId, { 
      include: [
        {
          model: User,
          as: 'followingLinks',
          through: { attributes: [] }, 
        },
      ]
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const followedUsers = user.followingLinks.map(follow => ({
      id: follow.id,
      name: follow.name,
      // Include other desired fields
    }));

    return res.status(200).json({
      followedUsers
    });
  } catch (e) {
    log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};

export async function applyToJobById(req, res) {
  try {
    const userId = req.params.id; // Assuming the current user's ID is passed as a URL parameter

    if (userId != req.user.id)
      return res.status(401).send({
        message: 'Unauthorized'
      });
    
    const jobId = req.params.jobId; // Assuming the target user's ID is passed as a URL parameter

    const user = await User.findByPk(userId); // Assuming there is a model or function to retrieve a user by ID
    const job = await Job.findByPk(jobId); // Assuming there is a model or function to retrieve a user by ID
   
    if (!user || !job) {
      return res.status(404).json({
        message: "Invalid user or job ID provided"
      });
    }

    const isAlreadyApplied = await user.hasJobApplications(job);

    if (isAlreadyApplied) {
      return res.status(400).json({
        message: "User has already applied to the provided job."
      });
    }

    await user.addJobApplications(job);

    return res.status(200).json({
      message: "Successfully applied user successfully followed to job",
      user: user,
    });

  } catch (e) {
    log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};

export async function unfollowById(req, res) {
  try {
    const userId = req.params.id; // Assuming the current user's ID is passed as a URL parameter

    if (userId != req.user.id)  
      return res.status(401).send({
        message: 'Unauthorized'
      });

    const targetUserId = req.params.targetUserId; // Assuming the target user's ID is passed as a URL parameter

    const currentUser = await User.findByPk(userId); // Assuming there is a model or function to retrieve a user by ID
    const targetUser = await User.findByPk(targetUserId); // Assuming there is a model or function to retrieve a user by ID
   
    if (!currentUser || !targetUser || userId === targetUserId) {
      return res.status(404).json({
        message: "Invalid user ID provided"
      });
    }

    const isFollowing = await currentUser.hasFollowingLinks(targetUser);

    if (!isFollowing) {
      return res.status(400).json({
        message: "User is not following the target user"
      });
    }

    await currentUser.removeFollowingLinks(targetUser);

    return res.status(200).json({
      message: "User successfully unfollowed",
      user: currentUser,
    });

  } catch (e) {
    log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};

export async function predictJobsByUserId(req, res) {
  try {
    const userId = req.params.id;

    if (userId != req.user.id)
      return res.status(401).send({
        message: 'Unauthorized'
      });

    const user = await User.findByPk(userId, { 
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }, 
        },
      ]
    });

    if (!user.name || !user.city || !user.area || !user.country)
      return res.status(406).send({
        message: 'All required fields cannot be empty!'
      });

    const allJobs = await Job.findAll({
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }, 
        },
      ],
    });

    const transactionUuid = crypto.randomUUID();

    const processedUser = {
      name: user.name,
      city: user.city,
      area: user.area,
      country: user.country,
      skills: user.skills.map((skill) => skill.name),
    };

    const processedAllJobs = allJobs.map((job) => {
      return {
        name: job.name,
        companyName: job.companyName,
        level: job.level,
        city: job.city,
        area: job.area,
        country: job.country,
        skills: job.skills.map((skill) => skill.name),
      };
    });

    fs.writeFileSync(`recommender/data/user-${transactionUuid}.json`, JSON.stringify(processedUser));
    fs.writeFileSync(`recommender/data/jobs-${transactionUuid}.json`, JSON.stringify(processedAllJobs));
    
    const args = [transactionUuid]; // Command-line arguments for the Python script
    const pythonScript = 'recommender/main.py'; // Path to the Python script
  
    const pythonSubprocess = spawnSync("python3", [pythonScript, ...args], { encoding : 'utf8' });

    if (pythonSubprocess.error) {
        throw new Error(pythonSubprocess.stderr);
    }

    const rawPrediction = pythonSubprocess.stdout;
    const rawPredictionList = rawPrediction.split('+++');

    let finalPredictions = [];

    for (const singularRawPrediction of rawPredictionList) {
      const singularRawPredictionTokens = singularRawPrediction.split(';;;');
      const predictionJobName = singularRawPredictionTokens[0];
      const predictionJobCompanyName = singularRawPredictionTokens[1];

      const predictionJob = await Job.findOne({ where: { 
        name: predictionJobName,
        companyName: predictionJobCompanyName,
      } });

      if (predictionJob)
        finalPredictions.push(predictionJob);
    }

    return res.status(200).json({ prediction: finalPredictions });

    // return res.status(200).json({
    //   applicants
    // });

  } catch(e) {
    log(e);

    return res.status(500).send({
      message:'Internal server error'
    });
  }
};
