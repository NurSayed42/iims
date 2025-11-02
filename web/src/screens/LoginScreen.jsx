import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const login = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Real API call to your Django backend
      const response = await authAPI.login(
        formData.email.trim(),
        formData.password,
        formData.role
      );

      console.log('Login response:', response);

      // Save tokens and user data
      localStorage.setItem('access', response.access);
      localStorage.setItem('refresh', response.refresh);
      
      if (response.user?.branch_name) {
        localStorage.setItem('branch_name', response.user.branch_name);
      } else {
        localStorage.removeItem('branch_name');
      }
      
      localStorage.setItem('user', JSON.stringify(response.user));

      setLoading(false);

      // Navigate according to role - Flutter-এর মতো exactly
      switch (formData.role) {
        case 'admin':
          navigate('/admin/dashboard', { 
            state: { 
              user: response.user,
              access: response.access
            }
          });
          break;
        case 'branch_admin':
          navigate('/branch-admin/dashboard', { 
            state: { 
              user: response.user,
              access: response.access
            }
          });
          break;
        case 'inspector':
          navigate('/inspector/dashboard', { 
            state: { 
              user: response.user,
              access: response.access
            }
          });
          break;
        default:
          navigate('/admin/dashboard');
      }

    } catch (error) {
      setLoading(false);
      console.error('Login error details:', error);
      
      if (error.message.includes('Network error')) {
        setError('Cannot connect to server. Please check if backend is running.');
      } else if (error.message.includes('401') || error.message.includes('Invalid')) {
        setError('Invalid email or password ❌');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#136817] flex items-center justify-center p-4">
      {/* Exact Flutter Design */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Circular Lock Icon - Flutter-এর মতো */}
          <div className="flex justify-center mb-5">
            <div className="bg-green-900 rounded-full p-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
          </div>

          {/* Welcome Texts - Exact Flutter Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#07660b] mb-2">
              Welcome Back!!
            </h1>
            <p className="text-[#07660b] text-sm mb-3">
              Login to continue
            </p>
            <h2 className="text-2xl font-bold text-[#07660b]">
              Login
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={login} className="space-y-4">
            {/* Email Field - Flutter Design */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-green-600">📧</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field - Flutter Design */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-green-600">🔐</span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Role Dropdown - Flutter Design */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              >
                <option value="admin">Admin</option>
                <option value="branch_admin">Branch Admin</option>
                <option value="inspector">Inspector</option>
              </select>
            </div>

            {/* Login Button - Exact Flutter Style */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-900 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-green-800 disabled:opacity-50 transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Forgot Password - Flutter Style */}
            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-red-500 hover:text-red-600 font-medium text-sm transition duration-200"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>

        {/* Development Info */}
        <div className="mt-6 bg-white bg-opacity-20 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2 text-sm">Backend Connection:</h3>
          <div className="text-white text-xs space-y-1">
            <p><strong>API Base:</strong> http://localhost:8000/api</p>
            <p><strong>Endpoint:</strong> /token/</p>
            <p><strong>Status:</strong> {loading ? 'Connecting...' : 'Ready'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;