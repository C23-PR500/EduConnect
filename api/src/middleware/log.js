import log from './logger.js';

const logRequest = (req, res, next) => {
  log(`Request logged at ${req.originalUrl}`);
  next();
}

export default logRequest;