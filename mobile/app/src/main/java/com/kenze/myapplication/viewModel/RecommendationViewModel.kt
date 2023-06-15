package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.model.*
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RecommendationViewModel(private val application: Application): BaseViewModel(application) {
    val recommendations = MutableLiveData<List<Prediction>?>()

    fun getAllRecommendations() {
        isLoading.postValue(true)

        val gson = Gson()
        val savedUserData = application.getStringFromPref("userData")
        val token = "Bearer ${application.getStringFromPref("token")}"
        val userId = gson.fromJson(savedUserData, User::class.java).id
        api.getAllRecommendations(token, userId).enqueue(object: Callback<RecommendationsResponse> {
            override fun onResponse(call: Call<RecommendationsResponse>, response: Response<RecommendationsResponse>) {
                isLoading.postValue(false)

                isLoading.postValue(false)

                if(response.isSuccessful) {
                    val data = response.body()

                    val gson = Gson()
                    val savedUserData = application.getStringFromPref("userData")
                    val user = gson.fromJson(savedUserData, User::class.java)

                    var recommendationsResponse = data?.prediction
                    recommendations.postValue(recommendationsResponse)

                } else {
                    if(response.errorBody() != null) {
                        val json = JSONObject(response.errorBody()!!.string())
                        onError.postValue(json["message"] as String)
                    } else {
                        onError.postValue("Something happened!")
                    }
                }
            }

            override fun onFailure(call: Call<RecommendationsResponse>, t: Throwable) {
                isLoading.postValue(false)
                onError.postValue(t.message)
            }

        })
    }
}