package com.kenze.myapplication.view.editProfile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.kenze.myapplication.MultiSpinner
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityEditProfileBinding
import com.kenze.myapplication.model.EditProfileRequest
import com.kenze.myapplication.model.User
import com.kenze.myapplication.viewModel.EditProfileViewModel


class EditProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityEditProfileBinding
    private val viewModel by viewModels<EditProfileViewModel>()

    private val skills = arrayListOf<String>()
    private var userData: User? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityEditProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listenLiveData()
        viewModel.getSkills()

        binding.apply {
            btnSave.setOnClickListener {
                val profession = etProfession.text.toString()
                val city = etCity.text.toString()
                val area = etArea.text.toString()
                val country = etCountry.text.toString()

                if(profession.isNotEmpty() && city.isNotEmpty() && area.isNotEmpty() && country.isNotEmpty()) {
                    val request = EditProfileRequest(profession, city, area, country,
                        multiSpinner.selectedItem.toString().split(", ")
                    )

                    viewModel.updateProfile(request)
                } else {
                    binding.root.showSnackBar("Please fill all fields!")
                }
            }
        }
    }

    private fun listenLiveData() {
        viewModel.isLoading.observe(this) { isLoading: Boolean? ->
            if(isLoading != null && isLoading) {
                binding.pb.visibility = View.VISIBLE
                binding.ll.visibility = View.GONE
            } else {
                binding.pb.visibility = View.GONE
                binding.ll.visibility = View.VISIBLE
            }
        }

        viewModel.onError.observe(
            this
        ) { error: String ->
            if (error.isNotEmpty()) binding.root.showSnackBar(error)
        }
        viewModel.onSuccess.observe(
            this
        ) {}
        viewModel.skills.observe(this) {
            if(it != null) {
                skills.clear()
                it.skills.forEach { skill ->
                    skills.add(skill.name)
                }

                viewModel.getUserDetail()
            }
        }
        viewModel.user.observe(this) {
            if(it != null) {
                userData = it.user
                binding.apply {
                    etProfession.setText(userData?.profession)
                    etArea.setText(userData?.area)
                    etCountry.setText(userData?.country)
                    etCity.setText(userData?.city)

                    val userSkills = arrayListOf<String>()
                    userData?.skills?.forEach { skill ->
                        userSkills.add(skill.name)
                    }

                    multiSpinner.setItems(skills, userSkills.joinToString(", "), userSkills, object: MultiSpinner.MultiSpinnerListener {
                        override fun onItemsSelected(selected: BooleanArray?) {}
                    })
                }
            }
        }
        viewModel.msg.observe(this) {
            if(it.isNotEmpty()) {
                binding.root.showSnackBar(it)

                setResult(RESULT_OK)
                finish()
            }
        }
    }
}