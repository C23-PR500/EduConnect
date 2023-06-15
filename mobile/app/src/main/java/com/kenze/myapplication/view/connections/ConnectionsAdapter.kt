package com.kenze.myapplication.view.connections

import android.content.Context
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView.Adapter
import androidx.recyclerview.widget.RecyclerView.ViewHolder
import com.kenze.myapplication.R
import com.kenze.myapplication.databinding.ListItemConnectionsBinding
import com.kenze.myapplication.databinding.ListItemJobsBinding
import com.kenze.myapplication.model.Job
import com.kenze.myapplication.model.User

class ConnectionsAdapter(
    private val context: Context,
    private val onClick: (User) -> Unit
): Adapter<ConnectionsAdapter.ConnectionHolder>() {
    private val users = arrayListOf<User>()

    inner class ConnectionHolder(
        private val binding: ListItemConnectionsBinding
    ): ViewHolder(binding.root) {
        fun bind(connection: User) {
            binding.apply {
                connectionName.text = connection.name
                connectionProfession.text = context.getString(R.string.profession_dosen_akuntansi, connection.profession ?: "-")
            }

            itemView.setOnClickListener { onClick(connection) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ConnectionHolder {
        val inflater = LayoutInflater.from(parent.context)
        val binding = ListItemConnectionsBinding.inflate(inflater, parent, false)

        return ConnectionHolder(binding)
    }

    override fun getItemCount(): Int = users.size

    override fun onBindViewHolder(holder: ConnectionHolder, position: Int) {
        holder.bind(users[position])
    }

    fun setJobs(connections: List<User>) {
        this.users.clear()
        this.users.addAll(connections)
        notifyDataSetChanged()
    }
}