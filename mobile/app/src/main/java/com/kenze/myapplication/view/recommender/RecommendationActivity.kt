package com.kenze.myapplication.view.recommender

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityRecommendationBinding
import com.kenze.myapplication.model.Job
import com.kenze.myapplication.model.Prediction
import com.kenze.myapplication.view.jobDetail.JobDetailActivity
import com.kenze.myapplication.viewModel.RecommendationViewModel

class RecommendationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRecommendationBinding
    private lateinit var recommendationAdapter: RecommendationAdapter

    private val viewModel by viewModels<RecommendationViewModel>()
    private var currentRecommendations = arrayListOf<Prediction>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityRecommendationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listenLiveData()

        recommendationAdapter = RecommendationAdapter(this) { prediction ->
            Intent(this, JobDetailActivity::class.java).also {
                it.putExtra("jobId", prediction.id)
                startActivity(it)
            }
        }
        binding.rvRecommendation.apply {
            this.adapter = recommendationAdapter
            addItemDecoration(DividerItemDecoration(this@RecommendationActivity, LinearLayoutManager.VERTICAL))
            layoutManager = LinearLayoutManager(this@RecommendationActivity)
        }
        viewModel.getAllRecommendations()
    }

    private fun listenLiveData() {
        viewModel.isLoading.observe(this) { isLoading: Boolean? ->
            if(isLoading != null && isLoading) {
                binding.pb.visibility = View.VISIBLE
                binding.rvRecommendation.visibility = View.GONE
            } else {
                binding.pb.visibility = View.GONE
                binding.rvRecommendation.visibility = View.VISIBLE
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
        viewModel.recommendations.observe(this) {
            if(it != null && it.isNotEmpty()) {
                currentRecommendations = it as ArrayList<Prediction>
                recommendationAdapter.setRecommendations(it)
            }
        }
    }
}