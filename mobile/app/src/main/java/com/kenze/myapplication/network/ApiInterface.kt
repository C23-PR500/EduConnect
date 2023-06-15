package com.kenze.myapplication.network

import com.kenze.myapplication.model.*
import retrofit2.Call
import retrofit2.http.*


interface ApiInterface {

    @POST("users/register")
    fun register(@Body requestBody: RegisterRequest): Call<RegisterResponse>

    @POST("users/login")
    fun login(@Body requestBody: LoginRequest): Call<LoginResponse>

    @GET("skills")
    fun getAllSkills(
        @Header("Authorization") token: String,
    ): Call<SkillResponse>

    @GET("users")
    fun getAllUsers(
        @Header("Authorization") token: String,
    ): Call<UsersResponse>

    @GET("users/{id}/following")
    fun getFollowingUsers(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<FollowingResponse>

    @GET("users/{id}")
    fun getUserDetail(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<UserResponse>

    @PATCH("users/{id}")
    fun updateUserDetail(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Body request: EditProfileRequest
    ): Call<EditProfileResponse>

    @GET("users/{id}")
    fun getProfile(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): UserResponse

    @POST("users/{id}/following/{friendId}/follow")
    fun followUser(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Path("friendId") friendId: String
    ): Call<FollowResponse>

    @POST("users/{id}/following/{friendId}/unfollow")
    fun unfollowUser(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Path("friendId") friendId: String
    ): Call<FollowResponse>

    @GET("jobs")
    fun getAllJobs(
        @Header("Authorization") token: String,
    ): Call<JobsResponse>

    @GET("jobs/{id}")
    fun getJob(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<JobResponse>

    @POST("users/{id}/jobs/{jobId}/apply")
    fun applyJob(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Path("jobId") jobId: Int
    ): Call<JobApplyResponse>

    @GET("users/{id}/jobs/predict")
    fun getAllRecommendations(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Call<RecommendationsResponse>
}