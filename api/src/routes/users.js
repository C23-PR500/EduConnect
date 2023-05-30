const express = require('express');

const UserController = require('../controller/users.js')

const router = express.Router();

// CREATE - POST
router.get('/', UserController.getAllUsers);

// READ - GET
router.post('/', UserController.createNewUser);

// UPDATE - PATCH
router.patch('/:id', UserController.updateUser);

// DELETE - DELETE
router.delete('/:id', UserController.deleteUser);

module.exports = router;
