package com.kenze.myapplication.network

import android.content.Context
import android.util.Log
import com.kenze.myapplication.Utils.getStringFromPref
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "https://educonnect-api-yllzfk7p4q-et.a.run.app/api/v1/"

    private val loggingInterceptor = HttpLoggingInterceptor().also {
        it.level = HttpLoggingInterceptor.Level.BODY
    }

    fun getClient(): Retrofit {
        val okHttpClient = OkHttpClient()
            .newBuilder()
            .addInterceptor(loggingInterceptor)

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient.build())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}