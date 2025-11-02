import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersAPI } from '../services/api';
import './CreateUserScreen.css';

const CreateUserScreen = () => {
  const navigate = useNavigate();
  const { role } = useParams(); // 'branch_admin' or 'inspector'
  
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    employee_id: '',
    branch_name: '',
    role: role || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUserBranch, setCurrentUserBranch] = useState('');

  useEffect(() => {
    // Get current user's branch if inspector
    if (role === 'inspector') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const branchName = localStorage.getItem('branch_name') || user.branch_name || '';
      setCurrentUserBranch(branchName);
      
      if (!branchName) {
        setErrors(prev => ({
          ...prev,
          general: 'Branch name not found. Login as branch admin first.'
        }));
      }
    }
  }, [role]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    }

    if (role === 'branch_admin' && !formData.branch_name.trim()) {
      newErrors.branch_name = 'Branch name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUser = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare data for API
      const userData = {
        user_name: formData.user_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        employee_id: formData.employee_id.trim(),
        branch_name: role === 'branch_admin' ? formData.branch_name.trim() : currentUserBranch,
        role: role
      };

      const response = await usersAPI.createUser(userData);

      if (response.success) {
        // Show success message
        alert('User created successfully ✅');
        
        // Navigate back
        if (role === 'branch_admin') {
          navigate('/branch-admin/users');
        } else if (role === 'inspector') {
          navigate('/admin/users'); // or appropriate route
        } else {
          navigate(-1); // Go back
        }
      } else {
        setErrors({
          general: response.error || 'Failed to create user'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({
        general: 'An error occurred while creating user'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = () => {
    return role ? role.replace(/_/g, ' ').toUpperCase() : 'USER';
  };

  const getHeaderTitle = () => {
    const roleName = getRoleDisplayName();
    return `Create ${roleName}`;
  };

  return (
    <div className="create-user-screen">
      <header className="app-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <span className="icon icon-arrow-back"></span>
            Back
          </button>
          <h1 className="header-title">{getHeaderTitle()}</h1>
          <div className="header-spacer"></div> {/* For balance */}
        </div>
      </header>

      <main className="main-content">
        <div className="form-container">
          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Enter User Details</h2>
              <div className="role-badge">
                {getRoleDisplayName()}
              </div>
            </div>

            {errors.general && (
              <div className="error-message general-error">
                <span className="error-icon">⚠️</span>
                {errors.general}
              </div>
            )}

            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="user_name" className="form-label">
                  Username *
                </label>
                <input
                  id="user_name"
                  type="text"
                  className={`form-input ${errors.user_name ? 'error' : ''}`}
                  placeholder="Enter username"
                  value={formData.user_name}
                  onChange={(e) => handleInputChange('user_name', e.target.value)}
                  disabled={loading}
                />
                {errors.user_name && (
                  <div className="field-error">{errors.user_name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                />
                {errors.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                />
                {errors.password && (
                  <div className="field-error">{errors.password}</div>
                )}
                <div className="password-hint">
                  Password must be at least 6 characters long
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="employee_id" className="form-label">
                  Employee ID *
                </label>
                <input
                  id="employee_id"
                  type="text"
                  className={`form-input ${errors.employee_id ? 'error' : ''}`}
                  placeholder="Enter employee ID"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  disabled={loading}
                />
                {errors.employee_id && (
                  <div className="field-error">{errors.employee_id}</div>
                )}
              </div>

              {role === 'branch_admin' && (
                <div className="form-group">
                  <label htmlFor="branch_name" className="form-label">
                    Branch Name *
                  </label>
                  <input
                    id="branch_name"
                    type="text"
                    className={`form-input ${errors.branch_name ? 'error' : ''}`}
                    placeholder="Enter branch name"
                    value={formData.branch_name}
                    onChange={(e) => handleInputChange('branch_name', e.target.value)}
                    disabled={loading}
                  />
                  {errors.branch_name && (
                    <div className="field-error">{errors.branch_name}</div>
                  )}
                </div>
              )}

              {role === 'inspector' && currentUserBranch && (
                <div className="form-group">
                  <label className="form-label">
                    Branch Name
                  </label>
                  <div className="branch-display">
                    <span className="branch-value">{currentUserBranch}</span>
                    <span className="branch-info">(Auto-assigned from your account)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-submit"
                onClick={createUser}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="icon icon-person-add"></span>
                    Create User
                  </>
                )}
              </button>
            </div>

            <div className="form-footer">
              <div className="required-hint">
                * Required fields
              </div>
              <div className="role-info">
                This user will be created as a <strong>{getRoleDisplayName()}</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateUserScreen;