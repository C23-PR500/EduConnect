import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import db from "../models/db.js";

const User = db.users;

config();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || token.split(' ').length !== 2 || token.split(' ')[0] !== `Bearer`) {
    return res.status(403).send(`A token is required for authentication`);
  }

  const jwtToken = token.split(' ')[1];

  console.log(`A`);

  try {
    const decoded = jwt.verify(jwtToken, process.env.TOKEN_KEY);
    console.log(`DEC ${decoded.id} ${decoded.email}`);

    const user = await User.findOne({ where: { id: decoded.id, email: decoded.email } });
    console.log(`USER ${user}`);

    if (!user)
      return res.status(401).send("Invalid Token");

    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  return next();
};

export default verifyToken;