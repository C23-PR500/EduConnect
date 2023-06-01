import db from "../models/db.js";
import log from '../middleware/logger.js';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

const Op = Sequelize.Op;
const User = db.users;
const sequelize = db.sequelize;

config();

export async function create(req, res) {
  if (!(req.body && req.body.email && req.body.password && req.body.name)) {
    return res.status(400).send({
      message: "Email, password, or name can not be empty!"
    });
  }

  const { email, password, name } = req.body;

  const user = {
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 8),
    name: name
  };

  try {
    await User.create(user);
    return res.status(200).send({
      message: "Success"
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
            { email: email },
            process.env.TOKEN_KEY, 
            { expiresIn: "8h" }
          )
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
    console.log(req.user);
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

export async function retreiveById(req, res) {
  try {
    const userId = req.params.id;

    const user = await User.findOne({where: {id:userId}});

    if(!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    return res.status(200).json({
      user
    })

  } catch(e) {
    console.log(e);

    return res.status(500).send({
      message:'Internal server error'
    })
  }
}

export async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const userData = req.body;

    const user = await User.findOne({where: {id:userId}});

    if(!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

     // Validate the user data
     if (!userData.name || !userData.email || !userData.profession || !userData.city || !userData.area || !userData.country) {
      return res.status(400).json({
        message: "Name, email are required"
      });
    }

    user.name = userData.name;
    user.email = userData.email;
    // user.password = userData.password;
    user.profession = userData.profession;
    // user.latitude = userData.latitude;
    // user.longitude = userData.longitude;
    user.city = userData.city;
    user.area = userData.area;
    user.country = userData.country;

    //validasi if(!userData.name) { return error}

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user
    });


  } catch(e) {
    console.log(e)

    return res.status(500).send({
      message: "Internal server error"
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

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
    console.log(e)

    return res.status(500).send({
      message: "Internal server error"
    });
  }
}

export async function followUser(req, res) {
  try {
    const following = [];
    const userId = req.params.id; // Assuming the current user's ID is passed as a URL parameter
    const targetUserId = req.params.targetUserId; // Assuming the target user's ID is passed as a URL parameter

    const currentUser = await User.findOne({where: {id:userId}}); // Assuming there is a model or function to retrieve a user by ID
    const targetUser = await User.findOne({where: {id:targetUserId}}); // Assuming there is a model or function to retrieve a user by ID
   
    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Check if the current user is already following the target user
    const isAlreadyFollowing = currentUser.following && currentUser.following.includes(targetUserId);
    if (isAlreadyFollowing) {
      return res.status(400).json({
        message: "User is already following the target user"
      });
    }

    // Add the target user to the current user's following list
    currentUser.following = currentUser.following || []; // Initialize following as an empty array if it's undefined
    currentUser.following.push(targetUserId);
    await currentUser.save();

    console.log('following',currentUser.following.includes(targetUserId))
    

    return res.status(200).json({
      message: "User successfully followed",
      user: currentUser,
    });
  } catch (e) {
    console.log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};


export async function getFollowedUsers(req, res) {
  try {
    const userId = req.params.id; // Assuming the user's ID is passed as a URL parameter

    const user = await User.findByPk(userId, { include: 'following' });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const followedUsers = user.following.map(follow => ({
      id: follow.id,
      name: follow.name,
      // Include other desired fields
    }));
    

    return res.status(200).json({
      followedUsers
    });
  } catch (e) {
    console.log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};
