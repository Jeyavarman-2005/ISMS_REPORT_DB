import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './userrole.css';

const UserRole = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    password: '',
    email: '',
    department: '',
    role: 'user'
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    } finally {
      setIsLoading(false);
    }
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
      await api.createUser(formData);
      await loadUsers();
      setFormData({
        companyName: '',
        username: '',
        password: '',
        email: '',
        department: '',
        role: 'user'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="user-role-container">
      <h2>User Role Management</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="user-role-content">
        <div className="user-form">
          <h3>Add New User</h3>
          <form onSubmit={handleSubmit}>
            {['companyName', 'username', 'password', 'email', 'department'].map((field) => (
              <div key={field} className="form-group">
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))}
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>
        
        <div className="user-list">
          <h3>Existing Users</h3>
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {['ID', 'Company', 'Username', 'Email', 'Department', 'Role'].map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    {['id', 'CompanyName', 'Username', 'Email', 'Department', 'Role'].map((field) => (
                      <td key={field}>{user[field]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRole;