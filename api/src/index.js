require('dotenv').config()
const express = require('express')
const PORT = process.env.PORT || 5000; 
const app = express()
const UserRoutes = require('./routes/users.js')
const middlewareLogRequest = require('./middleware/log.js')
// get the client

app.use(middlewareLogRequest) 
app.use(express.json());

app.use('/users',UserRoutes);

app.listen(PORT, () => {console.log(`Example app listening on port ${PORT}!`)} )