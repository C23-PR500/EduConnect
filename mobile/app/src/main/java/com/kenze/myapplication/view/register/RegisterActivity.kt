package com.kenze.myapplication.view.register

import android.app.Activity
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.inputmethod.InputMethodManager
import android.widget.Toast
import androidx.activity.viewModels
import com.google.gson.Gson
import com.kenze.myapplication.Utils.setStringToPref
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityRegisterBinding
import com.kenze.myapplication.model.RegisterRequest
import com.kenze.myapplication.view.dashboard.DashboardActivity
import com.kenze.myapplication.viewModel.RegisterViewModel

class RegisterActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegisterBinding
    private val viewModel by viewModels<RegisterViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listenLiveData()

        binding.btnRegister.setOnClickListener { register() }
        binding.tvLogin.setOnClickListener { finish() }
    }

    private fun register() {
        val inputMethodManager = getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
        inputMethodManager.hideSoftInputFromWindow(binding.root.windowToken, 0)

        binding.apply {
            val name = etName.text.toString()
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()

            if(name.isEmpty() && email.isEmpty() && password.isEmpty()) {
                root.showSnackBar("Please fill all fields!")
            } else if(password.length < 8) {
                root.showSnackBar("Password too short, min: 8 character")
            } else {
                val request = RegisterRequest(name, email, password)
                viewModel.register(request)
            }
        }
    }

    private fun listenLiveData() {
        viewModel.isLoading.observe(this) { isLoading: Boolean? ->
            binding.btnRegister.isEnabled = !isLoading!!
            binding.tvLogin.isEnabled = !isLoading
        }

        viewModel.onError.observe(
            this
        ) { error: String ->
            if (error.isNotEmpty()) binding.root.showSnackBar(error)
        }
        viewModel.msg.observe(this) {
            Toast.makeText(this, "User created!", Toast.LENGTH_SHORT).show()
        }
        viewModel.onSuccess.observe(
            this
        ) {
            finish()
        }
    }
}