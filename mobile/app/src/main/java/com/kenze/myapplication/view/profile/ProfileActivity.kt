package com.kenze.myapplication.view.profile

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import com.kenze.myapplication.R
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityProfileBinding
import com.kenze.myapplication.model.Skill
import com.kenze.myapplication.model.User
import com.kenze.myapplication.view.editProfile.EditProfileActivity
import com.kenze.myapplication.viewModel.ProfileViewModel

class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding
    private val viewModel by viewModels<ProfileViewModel>()

    private val result = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        if(it.resultCode == RESULT_OK) viewModel.getUserById()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.getUserById()
        listenLiveData()

        binding.btnBack.setOnClickListener { finish() }
        binding.btnEdit.setOnClickListener {
            Intent(this, EditProfileActivity::class.java).also {
                result.launch(it)
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
        viewModel.user.observe(this) {
            val userData = it.user

            binding.apply {
                tvName.text = getString(R.string.name_heri_susanto, userData.name ?: "-")
                tvProfession.text = getString(R.string.profession_dosen_akuntansi, userData.profession ?: "-")
                tvArea.text = getString(R.string.area_jawa_barat, userData.area ?: "-")
                tvCountry.text = getString(R.string.country_indonesia, userData.country ?: "-")
                tvEmail.text = getString(R.string.email_herisusanto_gmail_com, userData.email ?: "-")
                tvCity.text = getString(R.string.city_depok, userData.city ?: "-")

                val skills = arrayListOf<String>()
                userData.skills.forEachIndexed { _, it ->
                    skills.add(it.name)
                }

                tvSkill.text = getString(R.string.skill_mathematics, skills.joinToString(", "))
            }
        }
    }
}