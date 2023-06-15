package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.model.Job
import com.kenze.myapplication.model.JobsResponse
import com.kenze.myapplication.model.User
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class JobViewModel(private val application: Application): BaseViewModel(application) {
    val _jobs = MutableLiveData<List<Job>?>()
    val jobs : LiveData<List<Job>?> = _jobs

    fun getAllJobs() {
        _jobs.postValue(null)
        isLoading.postValue(true)

        val token = "Bearer ${application.getStringFromPref("token")}"
        api.getAllJobs(token).enqueue(object: Callback<JobsResponse> {
            override fun onResponse(call: Call<JobsResponse>, response: Response<JobsResponse>) {
                isLoading.postValue(false)

                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()

                    val gson = Gson()
                    val savedUserData = application.getStringFromPref("userData")
                    val user = gson.fromJson(savedUserData, User::class.java)

                    var jobsResponse = data?.jobs
                    if(user.area != null) {
                        jobsResponse = data?.jobs?.filter {
                            it.area.lowercase() == user.area.lowercase()
                        }
                    }
                    _jobs.postValue(jobsResponse)

                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<JobsResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }

        })
    }
}