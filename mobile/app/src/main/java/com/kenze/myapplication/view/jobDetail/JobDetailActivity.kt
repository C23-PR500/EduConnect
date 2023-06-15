package com.kenze.myapplication.view.jobDetail

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import com.google.android.material.snackbar.Snackbar
import com.kenze.myapplication.R
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityJobDetailBinding
import com.kenze.myapplication.viewModel.JobDetailViewModel

class JobDetailActivity : AppCompatActivity() {
    private lateinit var binding: ActivityJobDetailBinding
    private val viewModel by viewModels<JobDetailViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityJobDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listenLiveData()

        val jobId = intent.getIntExtra("jobId", -1)
        if(jobId != -1) viewModel.getJob(jobId)

        binding.btnApply.setOnClickListener { viewModel.apply(jobId) }
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
        viewModel.job.observe(this) {
            val job = it?.job

            if(job != null) {
                binding.apply {
                    tvPlace.text = job.name
                    tvProfession.text = getString(R.string.job_guru_fisika, job.level)
                    tvCity.text = getString(R.string.city_depok, job.city)
                    tvArea.text = getString(R.string.area_jawa_barat, job.area)
                    tvCountry.text = getString(R.string.country_indonesia, job.country)
                    if (!R.string.salary_rp3_000_000.equals(null)) {
                        tvSalary.text =
                            getString(R.string.salary_rp3_000_000, job.salary.toString())
                    } else {
                        tvSalary.text = getString(0)
                    }
                    val skills = arrayListOf<String>()
                    job.skills.forEach { skill ->
                        skills.add(skill.name)
                    }
                    tvSkill.text = getString(R.string.skill_mathematics, skills.joinToString(", "))
                }
            }
        }
        viewModel.applyJobMsg.observe(this) {
            if(it.isNotEmpty()) {
                Snackbar.make(binding.root, it, Snackbar.LENGTH_SHORT).show()
            }
        }
    }
}