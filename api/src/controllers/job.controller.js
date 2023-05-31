import db from "../models/db.js";
import log from '../middleware/logger.js';
import { Sequelize } from 'sequelize';

const Op = Sequelize.Op;
const Job = db.jobs;
const Skill = db.skills;
const sequelize = db.sequelize;

export async function retrieveAll(req, res) {
  try {
    return res.status(200).json({
        jobs: await Job.findAll({
          include: [
            {
              model: Skill,
              as: 'skills',
              through: { attributes: [] }, 
            },
          ],
        })
    });
  } catch(e) {
    log(e);

    return res.status(500).send({
      message: "Internal server error"
    });
  }
};


