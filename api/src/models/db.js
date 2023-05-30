import * as dbConfig from '../config/database.config.js';
import { Sequelize } from 'sequelize';

import User from './user.model.js';
import Job from './job.model.js';
import Skill from './skill.model.js';

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = User(sequelize, Sequelize);
db.jobs = Job(sequelize, Sequelize);
db.skills = Skill(sequelize, Sequelize);

// Connections relationship
db.users.belongsToMany(db.users, {
  through: "connections",
  as: "followerLinks",
  foreignKey: "follower_id",
});

db.users.belongsToMany(db.users, {
  through: "connections",
  as: "followingLinks",
  foreignKey: "following_id",
});

// Job application relationship
db.users.belongsToMany(db.jobs, {
  through: "job_application",
  as: "jobApplications",
  foreignKey: "user_id",
});

db.jobs.belongsToMany(db.users, {
  through: "job_application",
  as: "applicants",
  foreignKey: "job_id",
});

// User skill relationship
db.users.belongsToMany(db.skills, {
  through: "user_skill",
  as: "skills",
  foreignKey: "user_id",
});

db.skills.belongsToMany(db.users, {
  through: "user_skill",
  as: "users",
  foreignKey: "skill_id",
});

// Job skill relationship
db.jobs.belongsToMany(db.skills, {
  through: "job_skill",
  as: "skills",
  foreignKey: "job_id",
});

db.skills.belongsToMany(db.jobs, {
  through: "job_skill",
  as: "jobs",
  foreignKey: "skill_id",
});

export default db;