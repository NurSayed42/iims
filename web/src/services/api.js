// services/api.js - Updated with debugging

const BASE_URL = 'http://localhost:8000/api';

// Generic API call function with detailed logging
const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('access');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle body serialization
  if (options.body && config.headers['Content-Type'] === 'application/json') {
    config.body = JSON.stringify(options.body);
  }

  console.log('🚀 API Request:', {
    url,
    method: config.method || 'GET',
    body: config.body,
    headers: config.headers
  });

  try {
    const response = await fetch(url, config);
    
    console.log('📡 API Response Status:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    const data = await response.json();
    console.log('📦 API Response Data:', data);

    if (!response.ok) {
      const errorMessage = data.detail || data.error || data.message || 
                          (typeof data === 'string' ? data : `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};

// Auth API calls - Multiple format support
export const authAPI = {
  login: async (email, password, role) => {
    // Try different payload formats that Django might expect
    const payloadFormats = [
      // Format 1: Basic email/password
      { email, password },
      // Format 2: With username field
      { username: email, password },
      // Format 3: With role
      { email, password, role },
      // Format 4: Username with role
      { username: email, password, role }
    ];

    let lastError = null;

    for (const body of payloadFormats) {
      try {
        console.log(`🔍 Trying login with format:`, body);
        const response = await apiCall('/token/', {
          method: 'POST',
          body: body,
        });
        
        console.log('✅ Login successful with format:', body);
        return response;
      } catch (error) {
        console.log(`❌ Failed with format ${JSON.stringify(body)}:`, error.message);
        lastError = error;
        // Continue to next format
      }
    }

    // If all formats fail, throw the last error
    throw lastError || new Error('All login attempts failed');
  },

  // ... rest of your authAPI methods remain same
  passwordReset: async (email) => {
    return await apiCall('/password_reset/', {
      method: 'POST',
      body: { email },
    });
  },

  passwordResetConfirm: async (token, newPassword) => {
    return await apiCall('/password_reset_confirm/', {
      method: 'POST',
      body: { token, new_password: newPassword },
    });
  },

  getCurrentUser: async () => {
    return await apiCall('/current-user/');
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh');
    if (refresh) {
      try {
        await apiCall('/token/logout/', {
          method: 'POST',
          body: { refresh },
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('branch_name');
  },
};

// Users API calls
export const usersAPI = {
  createUser: async (userData) => {
    const endpoint = userData.role === 'branch_admin' 
      ? '/branch-admin/create/' 
      : '/inspector/create/';
    
    return await apiCall(endpoint, {
      method: 'POST',
      body: userData,
    });
  },

  getUsers: async (role = '') => {
    const endpoint = role ? `/users/?role=${role}` : '/users/';
    return await apiCall(endpoint);
  },

  updateUser: async (id, userData) => {
    return await apiCall(`/users/${id}/`, {
      method: 'PUT',
      body: userData,
    });
  },

  deleteUser: async (id) => {
    return await apiCall(`/users/${id}/`, {
      method: 'DELETE',
    });
  },

  getBranchAdmins: async () => {
    return await apiCall('/branch-admin/list');
  },

  getInspectors: async () => {
    return await apiCall('/inspector/list');
  },

  searchUsers: async (query, role = '') => {
    const params = new URLSearchParams();
    
    if (query) {
      params.append('search', query);
    }
    
    if (role) {
      params.append('role', role);
    }
    
    return await apiCall(`/users/?${params.toString()}`);
  },

  getAvailableInspectors: async (branchName = '') => {
    const params = branchName ? `?branch_name=${branchName}` : '';
    return await apiCall(`/inspector/available/${params}`);
  }
};

// Inspections API calls
export const inspectionsAPI = {
  // Basic CRUD operations
  getInspections: async () => {
    return await apiCall('/inspections/');
  },

  getInspection: async (id) => {
    return await apiCall(`/inspections/${id}/`);
  },

  createInspection: async (inspectionData) => {
    return await apiCall('/inspections/', {
      method: 'POST',
      body: inspectionData,
    });
  },

  updateInspection: async (id, inspectionData) => {
    return await apiCall(`/inspections/${id}/`, {
      method: 'PUT',
      body: inspectionData,
    });
  },

  // Stats and Dashboard
  getStats: async () => {
    return await apiCall('/inspection/stats/');
  },

  getDashboardStats: async () => {
    return await apiCall('/dashboard/stats/');
  },

  getBranchStats: async () => {
    return await apiCall('/branch/inspection-stats/');
  },

  getBranchInspectionStats: async () => {
    return await apiCall('/branch/inspection-stats/');
  },

  // Filtering and Search
  getInspectionsByStatus: async (status = 'all') => {
    const url = status === 'all' 
      ? '/inspections/' 
      : `/inspections/?status=${status}`;
    return await apiCall(url);
  },

  searchInspections: async (query, filters = {}) => {
    const params = new URLSearchParams();
    
    if (query) {
      params.append('search', query);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    return await apiCall(`/inspections/?${params.toString()}`);
  },

  getInspectionsWithPagination: async (page = 1, pageSize = 20, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...filters
    });
    
    return await apiCall(`/inspections/?${params.toString()}`);
  },

  getRecentInspections: async (limit = 5) => {
    return await apiCall(`/inspections/?limit=${limit}&ordering=-created_at`);
  },

  getInspectionsByDateRange: async (startDate, endDate) => {
    return await apiCall(`/inspections/?start_date=${startDate}&end_date=${endDate}`);
  },

  getInspectionsByBranch: async (branchName) => {
    return await apiCall(`/inspections/?branch_name=${branchName}`);
  },

  // New Inspection endpoints
  createNewInspection: async (inspectionData) => {
    return await apiCall('/new-inspections/create/', {
      method: 'POST',
      body: inspectionData,
    });
  },

  getNewInspections: async () => {
    return await apiCall('/new-inspections/list/');
  },

  assignInspector: async (inspectionId, inspectorId) => {
    return await apiCall(`/new-inspections/${inspectionId}/assign/`, {
      method: 'POST',
      body: { inspector_id: inspectorId },
    });
  },

  updateNewInspection: async (inspectionId, updateData) => {
    return await apiCall(`/new-inspections/${inspectionId}/`, {
      method: 'PUT',
      body: updateData,
    });
  },

  // Assigned inspections
  getAssignedInspections: async () => {
    return await apiCall('/inspections/assigned/');
  },

  // File and Media handling
  getInspectionPhotos: async (inspectionId) => {
    return await apiCall(`/inspections/${inspectionId}/photos/`);
  },

  getInspectionVideo: async (inspectionId) => {
    return await apiCall(`/inspections/${inspectionId}/video/`);
  },

  getInspectionDocuments: async (inspectionId) => {
    return await apiCall(`/inspections/${inspectionId}/documents/`);
  },

  uploadFiles: async (files, inspectionId) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('inspection_id', inspectionId);

    return await apiCall('/inspections/upload-files/', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Location tracking
  getLocationTracking: async (inspectionId) => {
    return await apiCall(`/inspections/${inspectionId}/locations/`);
  },

  getLocationData: async (inspectionId) => {
    return await apiCall(`/inspections/${inspectionId}/location-data/`);
  }
};

// Direct exports for commonly used functions (যদি direct import করা হয়)
export const getBranchInspectionStats = inspectionsAPI.getBranchInspectionStats;
export const getDashboardStats = inspectionsAPI.getDashboardStats;
export const getStats = inspectionsAPI.getStats;

// Branches API calls
export const branchesAPI = {
  getBranches: async () => {
    return await apiCall('/branches/');
  },

  getBranch: async (id) => {
    return await apiCall(`/branches/${id}/`);
  },

  createBranch: async (branchData) => {
    return await apiCall('/branches/', {
      method: 'POST',
      body: branchData,
    });
  },

  updateBranch: async (id, branchData) => {
    return await apiCall(`/branches/${id}/`, {
      method: 'PUT',
      body: branchData,
    });
  },

  deleteBranch: async (id) => {
    return await apiCall(`/branches/${id}/`, {
      method: 'DELETE',
    });
  }
};

// Reports API calls
export const reportsAPI = {
  generateReport: async (reportData) => {
    return await apiCall('/reports/generate/', {
      method: 'POST',
      body: reportData,
    });
  },

  getReports: async () => {
    return await apiCall('/reports/');
  },

  downloadReport: async (reportId) => {
    return await apiCall(`/reports/${reportId}/download/`);
  }
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: async () => {
    return await apiCall('/notifications/');
  },

  markAsRead: async (notificationId) => {
    return await apiCall(`/notifications/${notificationId}/mark-read/`, {
      method: 'POST',
    });
  },

  markAllAsRead: async () => {
    return await apiCall('/notifications/mark-all-read/', {
      method: 'POST',
    });
  }
};

export default {
  authAPI,
  usersAPI,
  inspectionsAPI,
  branchesAPI,
  reportsAPI,
  notificationsAPI,
  apiCall
};