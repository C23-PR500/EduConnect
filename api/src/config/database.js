const mysql = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const dbPool = mysql.createPool({
  // host: process.env.DB_HOST,
  // user: process.env.DB_USERNAME,
  // database: process.DB_NAME,
  // password: process.env.DB_PASSWORD,
  host: 'localhost',
  user: 'root',
  database: 'express-basic',
  password: '',
});

module.exports = dbPool.promise();