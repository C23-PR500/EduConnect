package com.kenze.myapplication.view.friends

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.snackbar.Snackbar
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityFriendsBinding
import com.kenze.myapplication.model.User
import com.kenze.myapplication.view.friendDetail.FriendDetailActivity
import com.kenze.myapplication.viewModel.FriendViewModel

class FriendsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFriendsBinding
    private lateinit var friendsAdapter: FriendsAdapter

    private val viewModel by viewModels<FriendViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityFriendsBinding.inflate(layoutInflater)
        setContentView(binding.root)


        listenLiveData()
        friendsAdapter = FriendsAdapter(this) { user ->
            val userModel = user["user"] as User

            if(user["type"] == "detail") {
                Intent(this, FriendDetailActivity::class.java).also {
                    it.putExtra("userId", userModel.id)
                    startActivity(it)
                }
            } else {
                viewModel.unfollow(userModel.id)
            }
        }
        binding.rvFriends.apply {
            this.adapter = friendsAdapter
            layoutManager = LinearLayoutManager(this@FriendsActivity)
        }

        viewModel.getFriends()
    }

    private fun listenLiveData() {
        viewModel.isLoading.observe(this) { isLoading: Boolean? ->
            if(isLoading != null && isLoading) {
                binding.pb.visibility = View.VISIBLE
                binding.rvFriends.visibility = View.GONE
            } else {
                binding.pb.visibility = View.GONE
                binding.rvFriends.visibility = View.VISIBLE
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
        viewModel.friends.observe(this) {
            if(it != null) {
                friendsAdapter.setUsers(it.followedUsers)
            }
        }
        viewModel.msg.observe(this) {
            if(it.isNotEmpty()) {
                viewModel.getFriends()
                Snackbar.make(binding.root, it, Snackbar.LENGTH_SHORT).show()
            }
        }
    }
}