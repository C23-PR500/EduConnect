import db from "../models/db.js";
import log from '../middleware/logger.js';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

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
     if (!userData.name || !userData.email || !userData.profession || !userData.city || !userData.area || !userData.country || !userData.password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    user.name = userData.name;
    user.email = userData.email;
    user.password = await bcrypt.hash(userData.password, 8);
    user.profession = userData.profession;
    user.city = userData.city;
    user.area = userData.area;
    user.country = userData.country;

    //validasi if(!userData.name) { return error}

     // Update user skills
    if (userData.skills && Array.isArray(userData.skills)) {
      // Remove existing user skills
      await user.setSkills([]);

      let skillInstanceList = [];

      for (const skill of userData.skills) {
        const skillInstance = await Skill.findOne({ where: { name: skill } });

        if (skillInstance)
          skillInstanceList.push(skillInstance);
      }

      await user.setSkills(skillInstanceList);
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