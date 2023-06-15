package com.kenze.myapplication.view.jobs

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View.GONE
import android.view.View.VISIBLE
import androidx.activity.viewModels
import androidx.core.widget.addTextChangedListener
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityJobsBinding
import com.kenze.myapplication.model.Job
import com.kenze.myapplication.view.jobDetail.JobDetailActivity
import com.kenze.myapplication.view.recommender.RecommendationActivity
import com.kenze.myapplication.viewModel.JobViewModel

class JobsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityJobsBinding
    private lateinit var jobsAdapter: JobsAdapter

    private val viewModel by viewModels<JobViewModel>()
    private var currentJobs = arrayListOf<Job>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityJobsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listenLiveData()

        jobsAdapter = JobsAdapter(this) { job ->
            Intent(this, JobDetailActivity::class.java).also {
                it.putExtra("jobId", job.id)
                startActivity(it)
            }
        }
        binding.rvJobs.apply {
            this.adapter = jobsAdapter
            addItemDecoration(DividerItemDecoration(this@JobsActivity, LinearLayoutManager.VERTICAL))
            layoutManager = LinearLayoutManager(this@JobsActivity)
        }
        binding.etSearch.addTextChangedListener {
            if(it != null) {
                val query = it.toString()
                jobsAdapter.setJobs(currentJobs.filter { job ->
                    job.name.lowercase().contains(query.lowercase())
                })
            }
        }
        viewModel.getAllJobs()
        binding.btnMyJobRecommendation.setOnClickListener {
            Intent(this, RecommendationActivity::class.java).also {
                startActivity(it)
            }
        }
    }

    private fun listenLiveData() {
        viewModel.isLoading.observe(this) { isLoading: Boolean? ->
            if(isLoading != null && isLoading) {
                binding.pb.visibility = VISIBLE
                binding.rvJobs.visibility = GONE
            } else {
                binding.pb.visibility = GONE
                binding.rvJobs.visibility = VISIBLE
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
        viewModel.jobs.observe(this) {
            Log.d("JobsActivity", it.toString())
            if(it != null && it.isNotEmpty()) {
                currentJobs = it as ArrayList<Job>
                jobsAdapter.setJobs(it)
                jobsAdapter.notifyDataSetChanged()
            }
        }
    }
}