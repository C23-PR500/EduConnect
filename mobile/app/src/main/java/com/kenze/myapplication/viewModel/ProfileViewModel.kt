package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.model.JobApplyResponse
import com.kenze.myapplication.model.User
import com.kenze.myapplication.model.UserResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileViewModel(
    private val application: Application
): BaseViewModel(application) {
    val user = MutableLiveData<UserResponse>()

    fun getUserById() {
        isLoading.postValue(true)

        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val userId = gson.fromJson(savedUserData, User::class.java).id
        val token = "Bearer ${application.getStringFromPref("token")}"

        api.getUserDetail(token, userId).enqueue(object: Callback<UserResponse> {
            override fun onResponse(
                call: Call<UserResponse>,
                response: Response<UserResponse>
            ) {
                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    user.postValue(data)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<UserResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }
        })
    }
}