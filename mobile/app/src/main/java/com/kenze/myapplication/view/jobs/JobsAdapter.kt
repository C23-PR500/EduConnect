package com.kenze.myapplication.view.jobs

import android.content.Context
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView.Adapter
import androidx.recyclerview.widget.RecyclerView.ViewHolder
import com.kenze.myapplication.R
import com.kenze.myapplication.databinding.ListItemJobsBinding
import com.kenze.myapplication.model.Job

class JobsAdapter(
    private val context: Context,
    private val onClick: (Job) -> Unit
): Adapter<JobsAdapter.JobHolder>() {
    private val jobs = arrayListOf<Job>()

    inner class JobHolder(
        private val binding: ListItemJobsBinding
    ): ViewHolder(binding.root) {
        fun bind(job: Job) {
            binding.apply {
                jobPlace.text = job.companyName
                jobName.text = context.getString(R.string.job_guru_fisika, job.name)
                jobLocation.text = context.getString(R.string.city_depok, job.city)
            }

            itemView.setOnClickListener { onClick(job) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JobHolder {
        val inflater = LayoutInflater.from(parent.context)
        val binding = ListItemJobsBinding.inflate(inflater, parent, false)

        return JobHolder(binding)
    }

    override fun getItemCount(): Int = jobs.size

    override fun onBindViewHolder(holder: JobHolder, position: Int) {
        holder.bind(jobs[position])
    }

    fun setJobs(jobs: List<Job>) {
        this.jobs.clear()
        this.jobs.addAll(jobs)
        notifyDataSetChanged()
    }
}