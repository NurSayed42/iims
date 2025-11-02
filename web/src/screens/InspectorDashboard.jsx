import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionsAPI, authAPI } from '../services/api';
import './InspectorDashboard.css';

const InspectorDashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    in_progress: 0,
    completed: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [recentInspections, setRecentInspections] = useState([]);

  useEffect(() => {
    checkTokenAndLoadData();
  }, []);

  const checkTokenAndLoadData = async () => {
    try {
      const accessToken = localStorage.getItem('access');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('🔑 Token Check:', {
        access: accessToken ? 'Yes' : 'No',
        user: userData.user_name || 'Not found'
      });

      if (!accessToken) {
        console.log('❌ No access token found! Redirecting to login...');
        redirectToLogin();
        return;
      }

      setUser(userData);
      await loadDashboardData();
    } catch (error) {
      console.error('Error in token check:', error);
      setIsLoading(false);
    }
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load stats and recent inspections in parallel
      const [statsData, recentData] = await Promise.all([
        inspectionsAPI.getStats(),
        inspectionsAPI.getInspections({ limit: 5 }) // Get 5 most recent inspections
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (recentData.success) {
        setRecentInspections(recentData.data.results || recentData.data || []);
      }

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      alert('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      localStorage.removeItem('branch_name');
      
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.clear();
      navigate('/login');
    }
  };

  // Navigation functions
  const navigateToInspectionsList = (status = 'all') => {
    navigate('/inspections', { state: { filterStatus: status } });
  };

  const navigateToAssignedInspections = () => {
    navigate('/inspector/assigned-inspections');
  };

  const navigateToCreateInspection = () => {
    navigate('/inspector/create-inspection');
  };

  const navigateToInspectionDetail = (id) => {
    navigate(`/inspection/${id}`);
  };

  // Stat Card Component
  const StatCard = ({ title, count, color, icon, status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'total': return 'from-blue-500 to-blue-600';
        case 'pending': return 'from-yellow-500 to-yellow-600';
        case 'approved': return 'from-green-500 to-green-600';
        case 'rejected': return 'from-red-500 to-red-600';
        case 'in_progress': return 'from-purple-500 to-purple-600';
        case 'completed': return 'from-indigo-500 to-indigo-600';
        default: return 'from-gray-500 to-gray-600';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'total': return '📊';
        case 'pending': return '⏳';
        case 'approved': return '✅';
        case 'rejected': return '❌';
        case 'in_progress': return '🔄';
        case 'completed': return '📋';
        default: return '📈';
      }
    };

    return (
      <div 
        onClick={() => navigateToInspectionsList(status === 'total' ? 'all' : status)}
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
      >
        <div className={`p-6 rounded-t-xl bg-gradient-to-r ${getStatusColor(status)}`}>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white">{count}</div>
            <div className="text-2xl">{getStatusIcon(status)}</div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">Click to view details</p>
        </div>
      </div>
    );
  };

  // Navigation Button Component
  const NavButton = ({ text, icon, onClick, variant = 'primary', fullWidth = false }) => {
    const baseClasses = "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95";
    
    const variants = {
      primary: "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl",
      secondary: "bg-white text-green-700 border border-green-600 hover:bg-green-50 shadow-md hover:shadow-lg",
      blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{text}</span>
      </button>
    );
  };

  // Recent Inspection Item Component
  const RecentInspectionItem = ({ inspection }) => {
    const getStatusBadge = (status) => {
      const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
        approved: { color: 'bg-green-100 text-green-800', icon: '✅' },
        rejected: { color: 'bg-red-100 text-red-800', icon: '❌' },
        in_progress: { color: 'bg-purple-100 text-purple-800', icon: '🔄' },
        completed: { color: 'bg-indigo-100 text-indigo-800', icon: '📋' }
      };

      const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '📄' };

      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <span>{config.icon}</span>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </span>
      );
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return (
      <div 
        onClick={() => navigateToInspectionDetail(inspection.id)}
        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800 group-hover:text-green-700 truncate">
            {inspection.client_name || 'Unnamed Client'}
          </h4>
          {getStatusBadge(inspection.status)}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{inspection.industry_name || 'No Industry'}</span>
          <span>{formatDate(inspection.created_at)}</span>
        </div>
        
        {inspection.branch_name && (
          <div className="mt-2 text-xs text-gray-500">
            Branch: {inspection.branch_name}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome, {user.user_name || 'Inspector'} 👋
              </h1>
              <p className="text-green-100 text-sm mt-1">
                {user.role ? `${user.role.replace('_', ' ').toUpperCase()} Dashboard` : 'Inspection Dashboard'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors duration-200"
                title="Refresh Data"
              >
                <span className="text-lg">🔄</span>
              </button>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <span>🚪</span>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NavButton
              text="All Inspections"
              icon="📋"
              onClick={() => navigateToInspectionsList('all')}
              variant="secondary"
            />
            <NavButton
              text="Pending"
              icon="⏳"
              onClick={() => navigateToInspectionsList('pending')}
              variant="secondary"
            />
            <NavButton
              text="Approved"
              icon="✅"
              onClick={() => navigateToInspectionsList('approved')}
              variant="secondary"
            />
            <NavButton
              text="Rejected"
              icon="❌"
              onClick={() => navigateToInspectionsList('rejected')}
              variant="secondary"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <NavButton
              text="Assigned Inspections"
              icon="📥"
              onClick={navigateToAssignedInspections}
              variant="blue"
              fullWidth
            />
            <NavButton
              text="Create New Inspection"
              icon="➕"
              onClick={navigateToCreateInspection}
              variant="primary"
              fullWidth
            />
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Inspection Statistics</h2>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatCard
              title="Total Inspections"
              count={stats.total}
              color="blue"
              status="total"
            />
            <StatCard
              title="Pending"
              count={stats.pending}
              color="yellow"
              status="pending"
            />
            <StatCard
              title="Approved"
              count={stats.approved}
              color="green"
              status="approved"
            />
            <StatCard
              title="Rejected"
              count={stats.rejected}
              color="red"
              status="rejected"
            />
            <StatCard
              title="In Progress"
              count={stats.in_progress}
              color="purple"
              status="in_progress"
            />
            <StatCard
              title="Completed"
              count={stats.completed}
              color="indigo"
              status="completed"
            />
          </div>
        </section>

        {/* Recent Inspections Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Inspections */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Inspections</h3>
              <button
                onClick={() => navigateToInspectionsList('all')}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            
            <div className="space-y-3">
              {recentInspections.length > 0 ? (
                recentInspections.map((inspection) => (
                  <RecentInspectionItem 
                    key={inspection.id} 
                    inspection={inspection} 
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <p>No inspections found</p>
                  <button
                    onClick={navigateToCreateInspection}
                    className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Create your first inspection
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-green-600">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Approval Rate</span>
                  <span className="font-semibold text-blue-600">
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Processing</span>
                  <span className="font-semibold text-purple-600">2.5 days</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
                >
                  <span className="text-lg">👤</span>
                  <span className="text-sm font-medium">Profile</span>
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button
                  onClick={() => navigate('/help')}
                  className="flex items-center gap-2 p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
                >
                  <span className="text-lg">❓</span>
                  <span className="text-sm font-medium">Help</span>
                </button>
                <button
                  onClick={() => window.open('/reports', '_blank')}
                  className="flex items-center gap-2 p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
                >
                  <span className="text-lg">📈</span>
                  <span className="text-sm font-medium">Reports</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              © 2024 Inspection System. All rights reserved.
            </div>
            <div className="flex gap-4">
              <button className="hover:text-green-600 transition-colors duration-200">
                Privacy Policy
              </button>
              <button className="hover:text-green-600 transition-colors duration-200">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InspectorDashboard;