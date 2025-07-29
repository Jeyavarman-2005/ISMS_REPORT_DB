import React from 'react';
import './dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Welcome to Admin Portal</h3>
          <p>Use the navigation menu to access different sections of the application.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;