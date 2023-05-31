import { config } from 'dotenv';
import express, { json } from 'express';
import UserRoutes from './routes/users.js';
import logRequestMiddleware from './middleware/log.js';
import db from './models/db.js';

const init = (async () => {
  config();

  const PORT = process.env.PORT || 5000; 
  const app = express();
  const router = express.Router();

  app.use(json());

  const apiRouter = express.Router();

  apiRouter.use(logRequestMiddleware); 
  apiRouter.use('/users', UserRoutes);
  
  router.use('/api/v1', apiRouter);

  app.use(router);

  app.listen(PORT, () => {console.log(`Example app listening on port ${PORT}!`)});

  await db.sequelize.sync({ force: false });
})();