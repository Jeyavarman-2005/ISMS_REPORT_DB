import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { 
  FiUserPlus, 
  FiUsers, 
  FiFileText, 
  FiFile, 
  FiUser, 
  FiChevronDown 
} from 'react-icons/fi';

const Header = ({ userRole, userData }) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const getMainHeaderStyle = () => {
    return { backgroundColor: '#1e40af' }; 
  };
  const getNavHeaderStyle = () => {
    return { 
      background: 'linear-gradient(to right, #1058d3ff, #1a202c)'
    };
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className={styles.headerContainer}>
      {/* First Header - Title, User Profile and Logout */}
      <header className={styles.mainHeader} style={getMainHeaderStyle()}>
        <h1 className={styles.headerTitle}><strong>ISMS AUDIT REPORTS</strong></h1>
        <div className={styles.rightNav}>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </div>
      </header>
      
      <header className={styles.navHeader} style={getNavHeaderStyle()}>
        <nav className={styles.leftNav}>
          <ul className={styles.navLinks}>
            <li><a href="/dashboard">Dashboard</a></li>
            <li className={styles.auditDropdown}>
              <a href="/audits">Audits</a>
              <div className={styles.dropdownContent}>
                <a href="/audits?type=internal">
                  <FiFileText className={styles.dropdownIcon} /> Internal Audits
                </a>
                <a href="/audits?type=external">
                  <FiFile className={styles.dropdownIcon} /> External Audits
                </a>
              </div>
            </li>
            <li>
            <a href="/userrole">User Management</a>
          </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;