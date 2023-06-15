package com.kenze.myapplication.view.friendDetail

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import com.google.android.material.snackbar.Snackbar
import com.kenze.myapplication.R
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityFriendDetailBinding
import com.kenze.myapplication.viewModel.FriendDetailViewModel

class FriendDetailActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFriendDetailBinding
    private val viewModel by viewModels<FriendDetailViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityFriendDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listenLiveData()

        val id = intent.getIntExtra("userId", -1)
        if(id != -1) viewModel.getUserDetail(id)

        binding.btnFollow.setOnClickListener { viewModel.follow(id) }
        binding.btnBack.setOnClickListener { finish() }
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
            if (error.isNotEmpty()) {
                binding.root.showSnackBar(error)
            }
        }
        viewModel.onSuccess.observe(
            this
        ) {}
        viewModel.user.observe(this) {
            val user = it?.user

            if(user != null) {
                binding.apply {
                    tvName.text = user.name
                    tvProfession.text = getString(R.string.profession_dosen_akuntansi, user.profession ?: "-")
                    tvCity.text = getString(R.string.city_depok, user.city ?: "-")
                    tvArea.text = getString(R.string.area_jawa_barat, user.area ?: "")
                    tvCountry.text = getString(R.string.country_indonesia, user.country ?: "-")

                    val skills = arrayListOf<String>()
                    user.skills.forEach { skill ->
                        skills.add(skill.name)
                    }
                    tvSkill.text = getString(R.string.skill_mathematics, skills.joinToString(", "))
                }
            }
        }
        viewModel.followMsg.observe(this) {
            if(it.isNotEmpty()) {
                Snackbar.make(binding.root, it, Snackbar.LENGTH_SHORT).show()
            }
        }
    }
}