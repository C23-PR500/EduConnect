package com.kenze.myapplication.view.recommender

import android.content.Context
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.kenze.myapplication.R
import com.kenze.myapplication.databinding.ListItemRecommendationBinding
import com.kenze.myapplication.model.Job
import com.kenze.myapplication.model.Prediction
import com.kenze.myapplication.view.recommender.RecommendationAdapter

class RecommendationAdapter(
    private val context: Context,
    private val onClick: (Prediction) -> Unit
): RecyclerView.Adapter<RecommendationAdapter.RecommendationHolder>() {
    private val recommendations = arrayListOf<Prediction>()

    inner class RecommendationHolder(
        private val binding: ListItemRecommendationBinding
    ): RecyclerView.ViewHolder(binding.root) {
        fun bind(recommendation: Prediction) {
            binding.apply {
                recommendationPlace.text = recommendation.companyName
                recommendationName.text = context.getString(R.string.job_guru_fisika, recommendation.name)
                recommendationLocation.text = context.getString(R.string.city_depok, recommendation.city)
            }

            itemView.setOnClickListener { onClick(recommendation) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecommendationHolder {
        val inflater = LayoutInflater.from(parent.context)
        val binding = ListItemRecommendationBinding.inflate(inflater, parent, false)

        return RecommendationHolder(binding)
    }

    override fun getItemCount(): Int = recommendations.size

    override fun onBindViewHolder(holder: RecommendationHolder, position: Int) {
        holder.bind(recommendations[position])
    }

    fun setRecommendations(recommendations: List<Prediction>) {
        this.recommendations.clear()
        this.recommendations.addAll(recommendations)
        notifyDataSetChanged()
    }
}