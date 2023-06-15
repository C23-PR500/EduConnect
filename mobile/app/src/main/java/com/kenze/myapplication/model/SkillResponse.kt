package com.kenze.myapplication.model

data class SkillResponse(
    val skills: List<Skill>
)

data class Skill(
    val id: Int,
    val name: String,
    val createdAt: String,
    val updatedAt: String
)
