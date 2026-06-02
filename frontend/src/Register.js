import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Register() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '', role: 'USER' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/auth/register', credentials);
      setMessage({ text: 'Registration successful! You can now login.', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data || 'Registration failed', type: 'error' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="input-label">System Role</label>
            <select
              value={credentials.role}
              onChange={(e) => setCredentials({ ...credentials, role: e.target.value })}
              className="role-select"
              required
            >
              <option value="USER">User (View Only)</option>
              <option value="MANAGER">Manager (View + Stock Operations)</option>
              <option value="ADMIN">Admin (Full Control + Product Management)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100" style={{ marginTop: '15px' }}>Register</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
