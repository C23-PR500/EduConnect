package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.model.JobApplyResponse
import com.kenze.myapplication.model.JobResponse
import com.kenze.myapplication.model.User
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class JobDetailViewModel(private val application: Application): BaseViewModel(application) {
    val job = MutableLiveData<JobResponse?>()
    val applyJobMsg = MutableLiveData<String>()

    fun getJob(id: Int) {
        isLoading.postValue(true)

        val token = "Bearer ${application.getStringFromPref("token")}"
        api.getJob(token, id).enqueue(object: Callback<JobResponse> {
            override fun onResponse(call: Call<JobResponse>, response: Response<JobResponse>) {
                isLoading.postValue(false)

                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    job.postValue(data)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<JobResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }

        })
    }

    fun apply(jobId: Int) {
        isLoading.postValue(true)

        val gson = Gson()
        val token = "Bearer ${application.getStringFromPref("token")}"
        val savedUserData = application.getStringFromPref("userData")
        val userId = gson.fromJson(savedUserData, User::class.java).id

        api.applyJob(token, userId, jobId).enqueue(object: Callback<JobApplyResponse> {
            override fun onResponse(
                call: Call<JobApplyResponse>,
                response: Response<JobApplyResponse>
            ) {
                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()
                    applyJobMsg.postValue(data?.message)
                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<JobApplyResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }
        })
    }
}