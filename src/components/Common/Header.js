import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { 
  FiUserPlus, 
  FiUsers, 
  FiFileText, 
  FiFile, 
  FiUser, 
  FiChevronDown,
  FiX
} from 'react-icons/fi';

const Header = () => {  // Remove props
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUnauthorizedPopup, setShowUnauthorizedPopup] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Get user data directly from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUserRole(userData.role);
      console.log('User role from localStorage:', userData.role); // Debug log
    }
  }, []);

  const getMainHeaderStyle = () => {
    return { backgroundColor: '#1e40af' }; 
  };
  
  const getNavHeaderStyle = () => {
    return { 
      background: 'linear-gradient(to right, #1058d3ff, #1a202c)'
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUserManagementClick = (e) => {
    if (userRole !== 'admin') {
      e.preventDefault();
      setShowUnauthorizedPopup(true);
    }
    // Admin users will proceed normally
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
              <a 
                href="/userrole" 
                onClick={handleUserManagementClick}
              >
                User Management
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Unauthorized Access Popup */}
      {showUnauthorizedPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContainer}>
            <button className={styles.closeButton} onClick={() => setShowUnauthorizedPopup(false)}>
              <FiX />
            </button>
            <div className={styles.popupContent}>
              <h3>Unauthorized Access</h3>
              <p>Only administrators can access User Management.</p>
              <button 
                className={styles.popupButton} 
                onClick={() => setShowUnauthorizedPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;