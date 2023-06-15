package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.Utils.setStringToPref
import com.kenze.myapplication.model.*
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class EditProfileViewModel(
    private val application: Application
): BaseViewModel(application) {
    val skills = MutableLiveData<SkillResponse?>()
    val user = MutableLiveData<UserResponse?>()
    val msg = MutableLiveData<String>()

    fun getSkills() {
        isLoading.postValue(true)

        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val userId = gson.fromJson(savedUserData, User::class.java).id
        val token = "Bearer ${application.getStringFromPref("token")}"

        api.getAllSkills(token).enqueue(object: Callback<SkillResponse> {
            override fun onResponse(call: Call<SkillResponse>, response: Response<SkillResponse>) {
                isLoading.postValue(false)

                val data = response.body()
                skills.postValue(data)

                if(data == null) {
                    onError.postValue("Something happened!")
                }
            }

            override fun onFailure(call: Call<SkillResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }

        })
    }

    fun getUserDetail() {
        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val userId = gson.fromJson(savedUserData, User::class.java).id
        val token = "Bearer ${application.getStringFromPref("token")}"

        api.getUserDetail(token, userId).enqueue(object: Callback<UserResponse> {
            override fun onResponse(call: Call<UserResponse>, response: Response<UserResponse>) {
                isLoading.postValue(false)

                val data = response.body()
                user.postValue(data)

                if(data == null) {
                    onError.postValue("Something happened!")
                }
            }

            override fun onFailure(call: Call<UserResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }

        })
    }

    fun updateProfile(request: EditProfileRequest) {
        isLoading.postValue(true)

        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val user = gson.fromJson(savedUserData, User::class.java)
        val token = "Bearer ${application.getStringFromPref("token")}"

        request.name = user.name
        request.password = user.password
        request.email = user.email

        api.updateUserDetail(token, user.id, request).enqueue(object: Callback<EditProfileResponse> {
            override fun onResponse(call: Call<EditProfileResponse>, response: Response<EditProfileResponse>) {
                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    onSuccess.postValue(true)
                    msg.postValue(data?.message)

                    val json = gson.toJson(data?.savedUser)
                    application.setStringToPref("userData", json)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<EditProfileResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }

        })
    }
}