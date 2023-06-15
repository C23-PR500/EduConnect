package com.kenze.myapplication.viewModel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.kenze.myapplication.network.ApiInterface
import com.kenze.myapplication.network.RetrofitClient

open class BaseViewModel(
    private val application: Application
) : AndroidViewModel(application) {
    var isLoading = MutableLiveData(false)
    var onError = MutableLiveData("")
    var onSuccess = MutableLiveData<Boolean>()

    private val retrofit = RetrofitClient.getClient()
    val api: ApiInterface = retrofit.create(ApiInterface::class.java)
}