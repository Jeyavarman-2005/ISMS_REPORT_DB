import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Services/api';
import styles from './Userrole.module.css';
import Header from '../../components/Common/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUserPlus, FiUsers, FiEdit2, FiTrash2, FiKey, FiMail, FiBriefcase, FiHome, FiX, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

const UserRole = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    plantName: '',
    username: '',
    genId: '',
    password: '',
    email: '',
    department: '',
    role: 'user'
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }

        const user = JSON.parse(userStr);
        if (user?.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        setUser(user);
        setIsAdmin(true);
        await loadUsers();
      } catch (err) {
        console.error('Error:', err);
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await api.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      companyName: user.CompanyName,
      plantName: user.PlantName || '',
      username: user.Username,
      genId: user.GenId || '',
      password: '',
      email: user.Email,
      department: user.Department,
      role: user.Role
    });
    setEditingUserId(user.id);
    setShowCreateUserModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (editingUserId) {
        await api.updateUser(editingUserId, formData);
        toast.success('User updated successfully!');
      } else {
        await api.createUser(formData);
        toast.success('User created successfully!');
      }
      
      await loadUsers();
      resetForm();
      setShowCreateUserModal(false);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      plantName: '',
      username: '',
      genId: '',
      password: '',
      email: '',
      department: '',
      role: 'user'
    });
    setEditingUserId(null);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        await loadUsers();
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    Object.values(user).some(
      val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!isAdmin) return null;

  return (
    <div className={styles.adminDashboard}>
      <Header 
        userRole={user.role} 
        userName={user.username} 
        userDepartment={user.department} 
        userID={user.UserID}
      />
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className={styles.adminContainer}>
        <div className={styles.adminContent}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.adminHeader}
          >
            <div className={styles.headerRow}>
              <div>
                <h2>User Management</h2>
                <p>Admin dashboard for managing system users and permissions</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.createUserButton}
                onClick={() => {
                  resetForm();
                  setShowCreateUserModal(true);
                }}
              >
                <FiPlus className={styles.buttonIcon} />
                Create User
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.userListContainer}
          >
            <div className={styles.listControls}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>
              <div className={styles.userCount}>
                Total Users: {filteredUsers.length}
              </div>
            </div>
            
            <div className={styles.tableResponsive}>
              {isLoading ? (
                <div className={styles.loadingSpinner}>
                  <div className={styles.spinner}></div>
                  <p>Loading users...</p>
                </div>
              ) : (
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Company</th>
                      <th>Plant</th>
                      <th>Username</th>
                      <th>GEN ID</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.CompanyName}</td>
                        <td>{user.PlantName}</td>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.userAvatar}>
                              {user.Username?.charAt(0).toUpperCase()}
                            </div>
                            {user.Username}
                          </div>
                        </td>
                        <td>{user.GenId}</td>
                        <td>{user.Email}</td>
                        <td>{user.Department}</td>
                        <td>
                          <span className={`${styles.roleBadge} ${styles[user.Role.toLowerCase()]}`}>
                            {user.Role}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              className={styles.editButton}
                              onClick={() => handleEdit(user)}
                            >
                              <FiEdit2 />
                            </button>
                            <button 
                              className={styles.deleteButton}
                              onClick={() => handleDelete(user.id)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles.modalOverlay}
          onClick={() => {
            setShowCreateUserModal(false);
            resetForm();
          }}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <FiUserPlus className={styles.modalIcon} />
                <h3>{editingUserId ? 'Edit User' : 'Create New User'}</h3>
              </div>
              <button 
                className={styles.closeButton}
                onClick={() => {
                  setShowCreateUserModal(false);
                  resetForm();
                }}
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.elegantForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>
                    <FiHome className={styles.inputIcon} />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <FiHome className={styles.inputIcon} />
                    Plant Name
                  </label>
                  <input
                    type="text"
                    name="plantName"
                    value={formData.plantName}
                    onChange={handleInputChange}
                    placeholder="Enter plant name"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <FiUserPlus className={styles.inputIcon} />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter username"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <FiUserPlus className={styles.inputIcon} />
                    GEN ID
                  </label>
                  <input
                    type="text"
                    name="genId"
                    value={formData.genId}
                    onChange={handleInputChange}
                    placeholder="Enter GEN ID"
                  />
                </div>
                                    
                <div className={styles.formGroup}>
                  <label>
                    <FiKey className={styles.inputIcon} />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUserId}
                    placeholder={editingUserId ? "Leave blank to keep current" : "Enter password"}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <FiMail className={styles.inputIcon} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <FiBriefcase className={styles.inputIcon} />
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter department"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    <FiKey className={styles.inputIcon} />
                    Role
                  </label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleInputChange}
                    className={styles.roleSelect}
                  >
                    <option value="user">Standard User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.buttonLoader}></span>
                  ) : (
                    editingUserId ? 'Update User' : 'Create User'
                  )}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowCreateUserModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserRole;