const log = (message) => {
  console.log(`[${(new Date()).toUTCString()}] ${message}`);
};

export default log;