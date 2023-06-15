package com.kenze.myapplication.viewModel

import android.app.Application
import android.util.Log
import androidx.lifecycle.MutableLiveData
import com.kenze.myapplication.model.RegisterRequest
import com.kenze.myapplication.model.RegisterResponse
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterViewModel(private val application: Application): BaseViewModel(application) {
    val msg = MutableLiveData<String>()

    fun register(registerRequest: RegisterRequest) {
        isLoading.postValue(true)

        api.register(registerRequest).enqueue(object: Callback<RegisterResponse> {
            override fun onResponse(
                call: Call<RegisterResponse>,
                response: Response<RegisterResponse>
            ) {
                isLoading.postValue(false)
                if(response.isSuccessful) {
                    val data = response.body()
                    msg.postValue(data?.message)
                    onSuccess.postValue(true)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<RegisterResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }
        })
    }
}