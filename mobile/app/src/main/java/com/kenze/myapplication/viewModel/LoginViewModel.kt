package com.kenze.myapplication.viewModel

import android.app.Application
import android.util.Log
import androidx.lifecycle.MutableLiveData
import com.kenze.myapplication.model.LoginRequest
import com.kenze.myapplication.model.LoginResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginViewModel(private val application: Application): BaseViewModel(application) {
    val loggedInUser = MutableLiveData<LoginResponse?>()

    fun login(loginRequest: LoginRequest) {
        isLoading.postValue(true)

        api.login(loginRequest).enqueue(object: Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    loggedInUser.postValue(data)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }
        })
    }
}