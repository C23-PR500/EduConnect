package com.kenze.myapplication.view.login

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.inputmethod.InputMethodManager
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.Utils.setStringToPref
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityMainBinding
import com.kenze.myapplication.model.LoginRequest
import com.kenze.myapplication.view.dashboard.DashboardActivity
import com.kenze.myapplication.view.register.RegisterActivity
import com.kenze.myapplication.viewModel.LoginViewModel


class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val viewModel by viewModels<LoginViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val token = getStringFromPref("token")
        if(token.isNotEmpty()) moveToDashboard()

        listenLiveData()

        binding.apply {
            btnLogin.setOnClickListener {
                val inputMethodManager = getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
                inputMethodManager.hideSoftInputFromWindow(binding.root.windowToken, 0)
                
                val email = etEmail.text.toString()
                val password = etPassword.text.toString()

                if(email.isEmpty() && password.isEmpty())
                    root.showSnackBar("Please fill all fields!")
                else {
                    val request = LoginRequest(email, password)
                    viewModel.login(request)
                }
            }
            tvRegister.setOnClickListener {
                Intent(this@MainActivity, RegisterActivity::class.java).also {
                    startActivity(it)
                }
            }
        }
    }

    private fun listenLiveData() {
        viewModel.isLoading.observe(this) { isLoading: Boolean? ->
            binding.btnLogin.isEnabled = !isLoading!!
            binding.tvRegister.isEnabled = !isLoading
        }

        viewModel.onError.observe(
            this
        ) { error: String ->
            if (error.isNotEmpty()) binding.root.showSnackBar(error)
        }
        viewModel.onSuccess.observe(
            this
        ) {}
        viewModel.loggedInUser.observe(this) {
            if(it != null) {
                val gson = Gson()
                val json = gson.toJson(it.user)
                setStringToPref("userData", json)
                setStringToPref("token", it.token)

                moveToDashboard()
            }
        }
    }

    private fun moveToDashboard() {
        Intent(this, DashboardActivity::class.java).also {
            startActivity(it)
        }

        finish()
    }
}