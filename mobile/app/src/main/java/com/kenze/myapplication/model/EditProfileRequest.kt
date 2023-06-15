package com.kenze.myapplication.model

data class EditProfileRequest(
    val profession: String,
    val city: String,
    val area: String,
    val country: String,
    val skills: List<String>,
    var name: String = "",
    var email: String = "",
    var password: String = "",
)
