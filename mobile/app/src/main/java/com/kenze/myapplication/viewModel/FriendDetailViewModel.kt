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

class FriendDetailViewModel(private val application: Application): BaseViewModel(application) {
    val user = MutableLiveData<UserResponse?>()
    val followMsg = MutableLiveData<String>()

    fun getUserDetail(id: Int) {
        isLoading.postValue(true)

        val token = "Bearer ${application.getStringFromPref("token")}"
        api.getUserDetail(token, id).enqueue(object: Callback<UserResponse> {
            override fun onResponse(call: Call<UserResponse>, response: Response<UserResponse>) {
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

    fun follow(friendId: Int) {
        isLoading.postValue(true)

        val token = "Bearer ${application.getStringFromPref("token")}"

        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val userId = gson.fromJson(savedUserData, User::class.java).id

        api.followUser(token, userId, friendId.toString()).enqueue(object: Callback<FollowResponse> {
            override fun onResponse(
                call: Call<FollowResponse>,
                response: Response<FollowResponse>
            ) {
                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    followMsg.postValue(data?.message)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<FollowResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }
        })
    }
}