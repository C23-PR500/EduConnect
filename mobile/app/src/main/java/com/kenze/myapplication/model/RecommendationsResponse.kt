package com.kenze.myapplication.model

data class RecommendationsResponse (
    val prediction: List<Prediction>
)

data class Prediction(
    val id: Int,
    val name: String,
    val companyName: String,
    val salary: Int,
    val level: String,
    val city: String,
    val area: String,
    val country: String,
    val latitude: Double,
    val longitude: Double,
    val createdAt: String,
    val updatedAt: String
)