import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inspectionsAPI } from '../services/api';
import './InspectionsListScreen.css';

const InspectionsListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get filter status from navigation state or props
  const filterStatus = location.state?.filterStatus || 'all';
  
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadInspections();
  }, [filterStatus]);

  const loadInspections = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await inspectionsAPI.getInspectionsByStatus(filterStatus);
      
      if (response.success) {
        setInspections(response.data.results || response.data || []);
        console.log('✅ Inspections loaded:', (response.data.results || response.data || []).length, 'items');
      } else {
        setErrorMessage('Failed to load inspections');
      }
    } catch (error) {
      console.error('❌ Error loading inspections:', error);
      setErrorMessage('Failed to load inspections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'approved': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'completed': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    };

    return statusColors[status?.toLowerCase()] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      border: 'border-gray-200' 
    };
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'approved': '✅',
      'rejected': '❌',
      'pending': '⏳',
      'in_progress': '🔄',
      'completed': '📋',
    };

    return statusIcons[status?.toLowerCase()] || '📄';
  };

  const getStatusDisplayText = () => {
    if (filterStatus === 'all') {
      return 'All Inspections';
    }
    return `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1).replace('_', ' ')} Inspections`;
  };

  const navigateToDetail = (inspection) => {
    navigate(`/inspection/${inspection.id}`, { state: { inspection } });
  };

  const navigateToCreateInspection = () => {
    navigate('/inspector/create-inspection');
  };

  // Filter inspections based on search term
  const filteredInspections = inspections.filter(inspection => {
    const searchLower = searchTerm.toLowerCase();
    return (
      inspection.client_name?.toLowerCase().includes(searchLower) ||
      inspection.industry_name?.toLowerCase().includes(searchLower) ||
      inspection.branch_name?.toLowerCase().includes(searchLower) ||
      inspection.status?.toLowerCase().includes(searchLower)
    );
  });

  // Sort inspections
  const sortedInspections = [...filteredInspections].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy.includes('date') || sortBy.includes('created') || sortBy.includes('updated')) {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const InspectionCard = ({ inspection }) => {
    const statusColor = getStatusColor(inspection.status);
    const statusIcon = getStatusIcon(inspection.status);

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
        onClick={() => navigateToDetail(inspection)}
        className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className={`w-12 h-12 rounded-full ${statusColor.bg} flex items-center justify-center text-xl`}>
                {statusIcon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {inspection.client_name || 'Unnamed Client'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {inspection.industry_name || 'No Industry'}
                </p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateToDetail(inspection);
              }}
              className="ml-4 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="View Details"
            >
              <span className="text-lg">👁️</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-24 font-medium">Branch:</span>
                <span className="text-gray-800">{inspection.branch_name || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-medium">Created:</span>
                <span className="text-gray-800">{formatDate(inspection.created_at)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-24 font-medium">Updated:</span>
                <span className="text-gray-800">{formatDate(inspection.updated_at)}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-medium">Inspector:</span>
                <span className="text-gray-800">{inspection.inspector_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
              {statusIcon} {inspection.status?.charAt(0).toUpperCase() + inspection.status?.slice(1).replace('_', ' ') || 'Unknown'}
            </span>
            
            {inspection.location_points && inspection.location_points.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                📍 {inspection.location_points.length} locations
              </span>
            )}
            
            {inspection.site_photos && inspection.site_photos.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-50 text-purple-700">
                📷 {inspection.site_photos.length} photos
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SortButton = ({ field, children }) => {
    const isActive = sortBy === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
          isActive 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {children}
        {isActive && (
          <span className="text-xs">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Inspections...</p>
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
                {getStatusDisplayText()}
              </h1>
              <p className="text-green-100 text-sm mt-1">
                {sortedInspections.length} inspection{sortedInspections.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadInspections}
                className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors duration-200"
                title="Refresh"
              >
                <span className="text-lg">🔄</span>
              </button>
              
              <button
                onClick={navigateToCreateInspection}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 font-medium"
              >
                <span>➕</span>
                <span>New Inspection</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Inspections
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by client, industry, branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex flex-wrap gap-2">
                <SortButton field="created_at">
                  📅 Created Date
                </SortButton>
                <SortButton field="client_name">
                  👤 Client Name
                </SortButton>
                <SortButton field="status">
                  🏷️ Status
                </SortButton>
                <SortButton field="branch_name">
                  🏢 Branch
                </SortButton>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {filterStatus}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">❌</span>
                <div>
                  <h3 className="text-red-800 font-medium">Failed to load inspections</h3>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={loadInspections}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Inspections List */}
        {sortedInspections.length === 0 && !isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No inspections found
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "There are no inspections in the system yet." 
                : `No ${filterStatus} inspections found.`
              }
            </p>
            <button
              onClick={navigateToCreateInspection}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <span>➕</span>
              <span>Create Your First Inspection</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedInspections.map((inspection) => (
              <InspectionCard 
                key={inspection.id} 
                inspection={inspection} 
              />
            ))}
          </div>
        )}

        {/* Load More Button (for pagination) */}
        {inspections.length > 0 && filteredInspections.length > 10 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-white text-green-700 border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium">
              Load More Inspections
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default InspectionsListScreen;