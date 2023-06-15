package com.kenze.myapplication.view.friends

import android.content.Context
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView.Adapter
import androidx.recyclerview.widget.RecyclerView.ViewHolder
import com.kenze.myapplication.R
import com.kenze.myapplication.databinding.ListItemFriendBinding
import com.kenze.myapplication.model.User

class FriendsAdapter(
    private val context: Context,
    private val onClick: (Map<String, Any>) -> Unit
): Adapter<FriendsAdapter.JobHolder>() {
    private val users = arrayListOf<User>()

    inner class JobHolder(
        private val binding: ListItemFriendBinding
    ): ViewHolder(binding.root) {
        fun bind(user: User) {
            binding.apply {
                tvName.text = user.name
                tvProfession.text = context.getString(R.string.profession_dosen_akuntansi, user.profession ?: "-")
                btnUnfollow.setOnClickListener { onClick(mapOf<String, Any>(
                    "type" to "unfollow",
                    "user" to user
                )) }
            }

            itemView.setOnClickListener { onClick(mapOf<String, Any>(
                "type" to "detail",
                "user" to user
            )) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JobHolder {
        val inflater = LayoutInflater.from(parent.context)
        val binding = ListItemFriendBinding.inflate(inflater, parent, false)

        return JobHolder(binding)
    }

    override fun getItemCount(): Int = users.size

    override fun onBindViewHolder(holder: JobHolder, position: Int) {
        holder.bind(users[position])
    }

    fun setUsers(users: List<User>) {
        this.users.clear()
        this.users.addAll(users)
        notifyDataSetChanged()
    }
}