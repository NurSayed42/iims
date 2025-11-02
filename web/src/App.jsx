import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ForgotScreen from './screens/ForgotScreen';
import AdminDashboard from './screens/AdminDashboard';
import BranchAdminDashboard from './screens/BranchAdminDashboard';
import InspectorDashboard from './screens/InspectorDashboard';
import UserListScreen from './screens/UserListScreen';
import CreateUserScreen from './screens/CreateUserScreen';
import InspectionsListScreen from './screens/InspectionsListScreen';
import NewInspectionScreen from './screens/NewInspectionScreen';
import CreateInspectionScreen from './screens/CreateInspectionScreen';
import InspectionDetailScreen from './screens/InspectionDetailScreen';
import AssignedInspectionsScreen from './screens/AssignedInspectionsScreen';

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);

  React.useEffect(() => {
    const validateAuth = () => {
      const token = localStorage.getItem('access');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setIsValid(false);
      } else {
        setIsValid(true);
      }
      setIsValidating(false);
    };

    validateAuth();
  }, []);

  if (isValidating) {
    return <LoadingSpinner />;
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based Protected Route
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!allowedRoles.includes(user.role)) {
    const redirectPath = getDashboardPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

// Get dashboard path based on user role
const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'branch_admin':
      return '/branch-admin/dashboard';
    case 'inspector':
      return '/inspector/dashboard';
    default:
      return '/login';
  }
};

// Route Redirector
const RouteRedirector = () => {
  const token = localStorage.getItem('access');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  const userData = JSON.parse(user);
  const dashboardPath = getDashboardPath(userData.role);
  
  return <Navigate to={dashboardPath} replace />;
};

// 404 Page Component
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotScreen />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <UserListScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/:role" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <UserListScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/create-user/:role" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <CreateUserScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/inspections" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'branch_admin']}>
                  <InspectionsListScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/new-inspection" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'branch_admin']}>
                  <NewInspectionScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />

          {/* Branch Admin Routes */}
          <Route 
            path="/branch-admin/dashboard" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['branch_admin']}>
                  <BranchAdminDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/branch-admin/users" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['branch_admin']}>
                  <UserListScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/branch-admin/users/:role" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['branch_admin']}>
                  <UserListScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/branch-admin/create-user/:role" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['branch_admin']}>
                  <CreateUserScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/branch-admin/inspections" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['branch_admin', 'admin']}>
                  <InspectionsListScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/branch-admin/new-inspection" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['branch_admin', 'admin']}>
                  <NewInspectionScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Inspector Routes */}
          <Route 
            path="/inspector/dashboard" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['inspector']}>
                  <InspectorDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/inspector/assigned-inspections" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['inspector']}>
                  <AssignedInspectionsScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/inspector/create-inspection" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['inspector']}>
                  <CreateInspectionScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/inspector/inspection/:id" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['inspector', 'admin', 'branch_admin']}>
                  <InspectionDetailScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />

          {/* Shared Routes */}
          <Route 
            path="/inspections" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'branch_admin', 'inspector']}>
                  <InspectionsListScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/inspection/:id" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin', 'branch_admin', 'inspector']}>
                  <InspectionDetailScreen />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />

          {/* Profile and Settings Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Profile Page</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* 404 Page */}
          <Route path="/404" element={<NotFoundPage />} />

          {/* Catch all route - Redirect to appropriate dashboard or login */}
          <Route path="*" element={<RouteRedirector />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;