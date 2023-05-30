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
