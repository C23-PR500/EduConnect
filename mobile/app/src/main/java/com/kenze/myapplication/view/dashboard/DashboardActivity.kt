package com.kenze.myapplication.view.dashboard

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.kenze.myapplication.Utils.clearPref
import com.kenze.myapplication.Utils.getStringFromPref
import com.kenze.myapplication.databinding.ActivityDashboardBinding
import com.kenze.myapplication.view.connections.ConnectionsActivity
import com.kenze.myapplication.view.friends.FriendsActivity
import com.kenze.myapplication.view.jobs.JobsActivity
import com.kenze.myapplication.view.login.MainActivity
import com.kenze.myapplication.view.profile.ProfileActivity

class DashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDashboardBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnLogout.setOnClickListener {
            clearPref()

            Intent(this, MainActivity::class.java).also {
                startActivity(it)
            }

            finish()
        }
        binding.btnFriends.setOnClickListener {
            Intent(this, FriendsActivity::class.java).also {
                startActivity(it)
            }
        }
        binding.btnProfile.setOnClickListener {
            Intent(this, ProfileActivity::class.java).also {
                startActivity(it)
            }
        }
        binding.llJobs.setOnClickListener {
            Intent(this, JobsActivity::class.java).also {
                startActivity(it)
            }
        }
        binding.llConnections.setOnClickListener {
            Intent(this, ConnectionsActivity::class.java).also {
                startActivity(it)
            }
        }
    }
}