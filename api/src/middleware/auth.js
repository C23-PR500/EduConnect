import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || token.split(' ').length !== 2 || token.split(' ')[0] !== `Bearer`) {
    return res.status(403).send(`A token is required for authentication`);
  }

  const jwtToken = token.split(' ')[1];

  try {
    const decoded = jwt.verify(jwtToken, process.env.TOKEN_KEY);
    console.log(`Decoded ${decoded}`);

    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  return next();
};

export default verifyToken;