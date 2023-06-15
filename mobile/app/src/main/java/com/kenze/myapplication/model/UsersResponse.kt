package com.kenze.myapplication.model

data class UsersResponse(
    val users: List<User>
)

data class User(
    val id: Int,
    val email: String,
    val password: String,
    val name: String,
    val profession: String,
    val latitude: Double,
    val longitude: Double,
    val city: String,
    val area: String,
    val country: String,
    val createdAt: String,
    val updatedAt: String,
    val skills: List<Skill>
)
