import { config } from 'dotenv';
import express, { json } from 'express';
import UserRoutes from './routes/users.js';
import JobRoutes from './routes/jobs.js';
import SkillRoutes from './routes/skills.js';
import logRequestMiddleware from './middleware/log.js';
import db from './models/db.js';
import generateJobData from './data/job.data.js';
import generateSkillData from './data/skill.data.js';

const init = (async () => {
  console.log('Starting . . .');
  config();

  const PORT = process.env.PORT || 5000; 
  const app = express();
  const router = express.Router();

  app.use(json());

  const apiRouter = express.Router();

  apiRouter.use(logRequestMiddleware); 
  apiRouter.use('/users', UserRoutes);
  apiRouter.use('/jobs', JobRoutes);
  apiRouter.use('/skills', SkillRoutes);
  
  router.use('/api/v1', apiRouter);

  app.use(router);

  app.listen(PORT, () => { console.log(`App listening on port ${PORT}!`) });

  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.sequelize.sync({ force: false });
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Database synchronised.');

  await generateSkillData(db.skills);
  await generateJobData(db.jobs, db.skills);

})();