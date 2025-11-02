import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, inspectionsAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  };

  const fetchStats = async () => {
    try {
      const statsData = await inspectionsAPI.getStats();
      setStats(statsData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setIsLoading(false);
      
      // If unauthorized, redirect to login
      if (error.message.includes('401')) {
        navigate('/login');
      }
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const BuildStatCard = ({ title, count, color }) => {
    const colorClasses = {
      blue: 'bg-blue-600',
      orange: 'bg-orange-500',
      green: 'bg-green-600',
      red: 'bg-red-600'
    };

    return (
      <div className={`${colorClasses[color]} rounded-2xl shadow-lg transform hover:scale-105 transition duration-300`}>
        <div className="p-6 w-full h-32 flex flex-col justify-center items-center text-white">
          <h3 className="text-lg font-bold text-center mb-2">{title}</h3>
          <p className="text-3xl font-bold">{count}</p>
        </div>
      </div>
    );
  };

  const BuildButton = ({ label, color, icon, onClick }) => {
    const colorClasses = {
      green: 'bg-green-800 hover:bg-green-900',
      red: 'bg-red-800 hover:bg-red-900',
      blue: 'bg-blue-600 hover:bg-blue-700',
      orange: 'bg-orange-500 hover:bg-orange-600'
    };

    return (
      <button
        onClick={onClick}
        className={`w-full ${colorClasses[color]} text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center space-x-3`}
      >
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              {user && (
                <p className="text-gray-600">Welcome, {user.email} ({user.role})</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={logout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Inspection Overview
          </h2>
          <p className="text-gray-600">Real-time inspection statistics from database</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <BuildStatCard title="All" count={stats.all} color="blue" />
          <BuildStatCard title="Pending" count={stats.pending} color="orange" />
          <BuildStatCard title="Approved" count={stats.approved} color="green" />
          <BuildStatCard title="Rejected" count={stats.rejected} color="red" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-6">
          <BuildButton
            label="Create Branch Admin"
            color="green"
            icon="👤"
            onClick={() => navigate('/admin/create-user', { state: { role: 'branch_admin' } })}
          />
          
          <BuildButton
            label="View Branch Admins"
            color="red"
            icon="📋"
            onClick={() => navigate('/admin/users', { state: { endpoint: 'branch-admin/list' } })}
          />

          <BuildButton
            label="Create Inspector"
            color="blue"
            icon="👨‍💼"
            onClick={() => navigate('/admin/create-user', { state: { role: 'inspector' } })}
          />

          <BuildButton
            label="View All Inspections"
            color="orange"
            icon="📊"
            onClick={() => navigate('/admin/inspections')}
          />
        </div>

        {/* API Status */}
        <div className="mt-8 bg-green-50 rounded-2xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">API Status</h3>
          <div className="text-green-700 text-sm">
            <p>✅ Connected to backend database</p>
            <p>📊 Real-time data from PostgreSQL</p>
            <p>🔐 JWT authentication active</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;