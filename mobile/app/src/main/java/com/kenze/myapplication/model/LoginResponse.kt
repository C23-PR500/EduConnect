package com.kenze.myapplication.model

import com.google.gson.annotations.Expose
import com.google.gson.annotations.SerializedName

data class LoginResponse (
    val token: String,
    val user: User,
    @Expose
    @SerializedName("message")
    val message: String?
)
