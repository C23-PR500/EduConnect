package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.model.FollowResponse
import com.kenze.myapplication.model.FollowingResponse
import com.kenze.myapplication.model.User
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class FriendViewModel(private val application: Application): BaseViewModel(application) {
    val friends = MutableLiveData<FollowingResponse?>()
    val msg = MutableLiveData<String>()

    fun getFriends() {
        isLoading.postValue(true)

        val token = "Bearer ${application.getStringFromPref("token")}"

        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val userId = gson.fromJson(savedUserData, User::class.java).id

        api.getFollowingUsers(token, userId).enqueue(object: Callback<FollowingResponse> {
            override fun onResponse(
                call: Call<FollowingResponse>,
                response: Response<FollowingResponse>
            ) {
                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    friends.postValue(data)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<FollowingResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }
        })
    }

    fun unfollow(friendId: Int) {
        isLoading.postValue(true)

        val token = "Bearer ${application.getStringFromPref("token")}"

        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val userId = gson.fromJson(savedUserData, User::class.java).id

        api.unfollowUser(token, userId, friendId.toString()).enqueue(object: Callback<FollowResponse> {
            override fun onResponse(
                call: Call<FollowResponse>,
                response: Response<FollowResponse>
            ) {
                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    msg.postValue(data?.message)
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