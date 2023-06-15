package com.kenze.myapplication.view.connections

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.core.widget.addTextChangedListener
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.gson.Gson
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.Utils.showSnackBar
import com.kenze.myapplication.databinding.ActivityConnectionsBinding
import com.kenze.myapplication.model.User
import com.kenze.myapplication.view.friendDetail.FriendDetailActivity
import com.kenze.myapplication.viewModel.ConnectionsViewModel

class ConnectionsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityConnectionsBinding
    private lateinit var connectionsAdapter: ConnectionsAdapter

    private val viewModel by viewModels<ConnectionsViewModel>()
    private var currentConnections = arrayListOf<User>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityConnectionsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.getAllConnections()
        connectionsAdapter = ConnectionsAdapter(this) {user ->
            Intent(this, FriendDetailActivity::class.java).also {
                it.putExtra("userId", user.id)
                startActivity(it)
            }
        }
        binding.rvPeoples.apply {
            adapter = connectionsAdapter
            layoutManager = LinearLayoutManager(this@ConnectionsActivity)
            addItemDecoration(DividerItemDecoration(this@ConnectionsActivity, LinearLayoutManager.VERTICAL))
        }
        binding.etSearch.addTextChangedListener {
            if(it != null) {
                val query = it.toString()
                connectionsAdapter.setJobs(currentConnections.filter { user ->
                    user.name.lowercase().contains(query.lowercase())
                })
            }
        }

        listenLiveData()
    }

    private fun listenLiveData() {
        viewModel.isLoading.observe(this) { isLoading: Boolean? ->
            if(isLoading != null && isLoading) {
                binding.pb.visibility = View.VISIBLE
                binding.rvPeoples.visibility = View.GONE
            } else {
                binding.pb.visibility = View.GONE
                binding.rvPeoples.visibility = View.VISIBLE
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
        viewModel.connections.observe(this) {
            if(it != null) {
                currentConnections = it.users as ArrayList<User>
                currentConnections.removeIf { user ->
                    val gson = Gson()
                    val savedUserData = application.getStringFromPref("userData")
                    val userId = gson.fromJson(savedUserData, User::class.java).id

                    user.id == userId
                }
                connectionsAdapter.setJobs(it.users)
            }
        }
    }
}