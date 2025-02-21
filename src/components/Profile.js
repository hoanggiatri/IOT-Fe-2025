import React from 'react';

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src="https://via.placeholder.com/150"
            alt="Profile"
            className="profile-avatar"
          />
          <h2>IoT System Profile</h2>
        </div>
        <div className="profile-info">
          <div className="info-group">
            <h3>System Information</h3>
            <p><strong>Location:</strong> Room 101</p>
            <p><strong>Installation Date:</strong> 2024-02-21</p>
            <p><strong>Last Maintenance:</strong> 2024-02-20</p>
          </div>
          <div className="info-group">
            <h3>System Status</h3>
            <p><strong>Status:</strong> <span className="status-active">Active</span></p>
            <p><strong>Uptime:</strong> 120 hours</p>
            <p><strong>Connected Sensors:</strong> 4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;