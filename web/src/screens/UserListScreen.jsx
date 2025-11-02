import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersAPI } from '../services/api';
import './UserListScreen.css';

const UserListScreen = () => {
  const navigate = useNavigate();
  const { role } = useParams(); // 'branch_admin' or 'inspector'
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState('user_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Determine endpoint based on role
  const getEndpoint = () => {
    switch (role) {
      case 'branch_admin':
        return 'branch-admin/list';
      case 'inspector':
        return 'inspector/list';
      default:
        return 'users/';
    }
  };

  const getPageTitle = () => {
    switch (role) {
      case 'branch_admin':
        return 'Branch Admin List';
      case 'inspector':
        return 'Inspector List';
      default:
        return 'All Users';
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await usersAPI.getUsers(getEndpoint());
      
      if (response.success) {
        setUsers(response.data.results || response.data || []);
        console.log('✅ Users loaded:', (response.data.results || response.data || []).length, 'items');
      } else {
        setErrorMessage('Failed to load users');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setErrorMessage('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await usersAPI.deleteUser(userId);
      
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        setDeleteConfirm(null);
        console.log('✅ User deleted successfully');
      } else {
        setErrorMessage('Failed to delete user');
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      setErrorMessage('Failed to delete user. Please try again.');
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await usersAPI.updateUser(editingUser.id, userData);
      
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? { ...user, ...userData } : user
        ));
        setEditingUser(null);
        console.log('✅ User updated successfully');
      } else {
        setErrorMessage('Failed to update user');
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      setErrorMessage('Failed to update user. Please try again.');
    }
  };

  const navigateToCreateUser = () => {
    navigate(`/create-user/${role}`);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.user_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.employee_id?.toString().includes(searchLower) ||
      user.branch_name?.toLowerCase().includes(searchLower)
    );
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

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
      setSortOrder('asc');
    }
  };

  // Edit User Modal Component
  const EditUserModal = () => {
    const [formData, setFormData] = useState({
      user_name: editingUser?.user_name || '',
      email: editingUser?.email || '',
      employee_id: editingUser?.employee_id || '',
      password: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Prepare data for update (remove password if empty)
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      updateUser(updateData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Modal Header */}
          <div className="bg-green-700 text-white rounded-t-xl p-4">
            <h2 className="text-xl font-bold text-center">Edit User</h2>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Name *
              </label>
              <input
                type="text"
                required
                value={formData.user_name}
                onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="number"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!deleteConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
          {/* Modal Header */}
          <div className="bg-red-600 text-white rounded-t-xl p-4">
            <h2 className="text-xl font-bold text-center">Confirm Delete</h2>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to delete user <strong>{deleteConfirm.user_name}</strong>?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Card Component
  const UserCard = ({ user }) => {
    return (
      <div className="bg-green-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <h3 className="text-lg font-semibold truncate mr-2">
                  {user.user_name}
                </h3>
                <span className="text-yellow-300 text-sm font-medium truncate">
                  {user.email}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-green-100">
                <div className="flex items-center">
                  <span className="font-medium mr-1">ID:</span>
                  <span>{user.employee_id || 'N/A'}</span>
                </div>
                
                {user.branch_name && (
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Branch:</span>
                    <span>{user.branch_name}</span>
                  </div>
                )}
                
                {user.role && (
                  <div className="flex items-center">
                    <span className="font-medium mr-1">Role:</span>
                    <span className="capitalize">{user.role.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setEditingUser(user)}
                className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-colors duration-200"
                title="Edit User"
              >
                <span className="text-black text-sm">✏️</span>
              </button>
              
              <button
                onClick={() => setDeleteConfirm(user)}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors duration-200"
                title="Delete User"
              >
                <span className="text-white text-sm">🗑️</span>
              </button>
            </div>
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
          <p className="text-gray-600 text-lg">Loading Users...</p>
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
                {getPageTitle()}
              </h1>
              <p className="text-green-100 text-sm mt-1">
                {sortedUsers.length} user{sortedUsers.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchUsers}
                className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors duration-200"
                title="Refresh"
              >
                <span className="text-lg">🔄</span>
              </button>
              
              <button
                onClick={navigateToCreateUser}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 font-medium"
              >
                <span>➕</span>
                <span>Add User</span>
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
                Search Users
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, email, ID..."
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
                <SortButton field="user_name">
                  👤 Name
                </SortButton>
                <SortButton field="email">
                  📧 Email
                </SortButton>
                <SortButton field="employee_id">
                  🆔 Employee ID
                </SortButton>
                <SortButton field="branch_name">
                  🏢 Branch
                </SortButton>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
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
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        {sortedUsers.length === 0 && !isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No users found matching "${searchTerm}"` 
                : `No ${role ? role.replace('_', ' ') + 's' : 'users'} found in the system.`
              }
            </p>
            <button
              onClick={navigateToCreateUser}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <span>➕</span>
              <span>Add First User</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {editingUser && <EditUserModal />}
      {deleteConfirm && <DeleteConfirmationModal />}
    </div>
  );
};

export default UserListScreen;