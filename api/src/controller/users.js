require('dotenv').config()
const UsersModel = require('../models/users.js')

const getAllUsers = async (req,res) => {
    try {
        const [data] = await UsersModel.getAllUsers();

        res.json({
            message: "Get All users success",
            data: data
        })
    } catch (error) {
        res.status(500).json({
            message: 'server Error',
            serverMessage: error,
        })
    }
}

const createNewUser = async (req,res) => {
    const {body} = req;
    try {
        await UsersModel.createNewUser(body); 
        res.json({
            message: 'Create new user success',
            data: body
        })
    } catch (error) {
        res.status(500).json({
            message: 'server Error',
            serverMessage: error,
        })
    }
}

const updateUser = async (req,res) => {
    const {id} = req.params;
    const {body} = req

    try {
        await UsersModel.updateUser(body,id);
        res.json({
            message:'update user success',
            data: {
                id:id,
                ...body
            }
        })
    } catch (error) {
        res.status(500).json({
            message: 'server Error',
            serverMessage: error,
        })
    }
}

const deleteUser = (req,res) => {
    const {id} = req.params;
    console.log('id user', id)
    res.json({
        message:'delete user success',
        data: {
            'id': id,
            'nama':'ammar'
        },
    })
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}