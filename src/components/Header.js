import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <h1>Admin Portal</h1>
      <nav>
        <ul className="nav-links">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/audits">Audits</a></li>
          <li><a href="/userrole">User Management</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;