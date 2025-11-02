import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Real API call to your Django backend
      const response = await authAPI.passwordReset(email);
      
      setLoading(false);
      setMessage('Reset link sent. Check your email. ✅');
      
      // Auto clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);

    } catch (error) {
      setLoading(false);
      console.error('Password reset error:', error);
      
      if (error.message.includes('Network error')) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError(error.message || 'Something went wrong ❌');
      }
    }
  };

  return (
    <div className="min-h-screen bg-green-700 flex items-center justify-center p-4">
      {/* Exact Flutter Design */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Header - Flutter Style */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-600">
              Forgot Password
            </h1>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={sendReset} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Send Reset Button - Exact Flutter Style */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Back to Login - Flutter Style */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-red-500 hover:text-red-600 font-medium text-sm transition duration-200"
              >
                Back to Login
              </Link>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">How it works:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Enter your registered email address</li>
              <li>• We'll send a password reset link</li>
              <li>• Check your email and follow the instructions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotScreen;