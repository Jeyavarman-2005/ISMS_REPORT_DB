import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Services/api';
import styles from './Login.module.css';
import backgroundImage from '../../assets/images/bg2.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add(styles.noScroll);
    return () => document.body.classList.remove(styles.noScroll);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await api.login(username, password);
      
      if (!userData?.id) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div 
        className={styles.loginContainer}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className={styles.loginBox}>
          <h2>ISMS LOGIN</h2>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter your username"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={styles.loginBtn}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;