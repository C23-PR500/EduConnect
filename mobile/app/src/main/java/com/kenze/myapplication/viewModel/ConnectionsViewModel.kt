package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.MutableLiveData
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.model.JobsResponse
import com.kenze.myapplication.model.UsersResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ConnectionsViewModel(
    private val application: Application
): BaseViewModel(application) {
    val connections = MutableLiveData<UsersResponse?>()

    fun getAllConnections() {
        isLoading.postValue(true)

        val token = "Bearer ${application.getStringFromPref("token")}"
        api.getAllUsers(token).enqueue(object: Callback<UsersResponse> {
            override fun onResponse(call: Call<UsersResponse>, response: Response<UsersResponse>) {
                isLoading.postValue(false)

                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    connections.postValue(data)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<UsersResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }

        })
    }
}