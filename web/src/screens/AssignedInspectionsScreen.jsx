import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, inspectionsAPI } from '../services/api';

const AssignedInspectionsScreen = () => {
  const [assignedInspections, setAssignedInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadAssignedInspections();
  }, []);

  const loadAssignedInspections = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Get current user information
      const userData = await authAPI.getCurrentUser();
      const currentUserId = userData.id;
      
      console.log("✅ Current User ID:", currentUserId);
      console.log("👤 Current User:", userData.user_name, "(", userData.email, ")");

      // Load all new inspections
      const allInspections = await inspectionsAPI.getNewInspections();
      console.log("📋 Total inspections from API:", allInspections.length);

      // Filter inspections assigned to current user AND status is 'pending'
      const myAssignedInspections = allInspections.filter((inspection) => {
        const assignedInspectorId = inspection.assigned_inspector;
        const status = inspection.status;
        const isAssignedToMe = assignedInspectorId === currentUserId;
        const isPending = status === 'pending';
        
        if (isAssignedToMe && isPending) {
          console.log("🎯 Found pending assigned inspection:", inspection.project);
        }
        
        return isAssignedToMe && isPending; // শুধু pending inspections
      });

      setAssignedInspections(myAssignedInspections);
      setIsLoading(false);

      console.log("✅ Pending assigned inspections loaded:", myAssignedInspections.length);
      
      // Show debug information
      if (myAssignedInspections.length === 0) {
        console.log("ℹ️ No PENDING inspections assigned to user ID:", currentUserId);
        
        const allMyInspections = allInspections.filter((inspection) => {
          return inspection.assigned_inspector === currentUserId;
        });
        
        console.log("ℹ️ All assigned inspections (all statuses):");
        allMyInspections.forEach(inspection => {
          console.log("   -", inspection.project, "-> Status:", inspection.status);
        });
      }
    } catch (error) {
      console.error("🚨 Error loading assigned inspections:", error);
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(error.message || 'Failed to load inspections');
    }
  };

  // Navigate to Create Inspection Screen with data
  const navigateToCreateInspection = (inspection) => {
    navigate('/inspector/create-inspection', { 
      state: { 
        inspectionData: inspection,
        isEditMode: false // new inspection create hobe
      }
    });
  };

  const BuildInspectionCard = ({ inspection }) => {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mx-4 my-3">
        <div className="p-4">
          {/* Project Name */}
          <div className="flex items-center mb-3">
            <span className="text-[#116045] text-lg">🏢</span>
            <div className="ml-2 flex-1">
              <h3 className="text-lg font-bold text-[#116045]">
                {inspection.project || 'No Project Name'}
              </h3>
            </div>
          </div>
          
          {/* Client Information */}
          <div className="space-y-2">
            <InfoRow label="Client" icon="👤" value={inspection.client_name} />
            <InfoRow label="Industry" icon="🏭" value={inspection.industry_name} />
            <InfoRow label="Phone" icon="📞" value={inspection.phone_number} />
          </div>
          
          {/* Status and Date */}
          <div className="flex justify-between items-center mt-3">
            <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getStatusColor(inspection.status)}`}>
              {getStatusText(inspection.status)}
            </span>
            <span className="text-gray-500 text-sm">
              {formatDate(inspection.created_at)}
            </span>
          </div>

          {/* Start Inspection Button */}
          <div className="mt-3">
            <button
              onClick={() => navigateToCreateInspection(inspection)}
              className="w-full bg-[#116045] text-white py-3 px-4 rounded-lg font-bold hover:bg-[#0d4f38] transition duration-200 flex items-center justify-center"
            >
              <span className="mr-2">▶️</span>
              Start Inspection
            </button>
          </div>
        </div>
      </div>
    );
  };

  const InfoRow = ({ label, icon, value }) => {
    return (
      <div className="flex items-center py-1">
        <span className="text-gray-500 text-sm mr-2">{icon}</span>
        <span className="text-sm font-medium text-gray-500 mr-1">{label}:</span>
        <span className="text-sm text-gray-800 flex-1">{value || 'N/A'}</span>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'approved':
        return 'bg-[#116045]';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Exact Flutter Design */}
      <header className="bg-[#116045] shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="text-white mr-3"
              >
                <span className="text-xl">←</span>
              </button>
              <h1 className="text-xl font-bold text-white">
                My Assigned Inspections
              </h1>
            </div>
            <button 
              onClick={loadAssignedInspections}
              className="text-white p-2"
            >
              <span className="text-xl">🔄</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#116045] mb-4"></div>
            <p className="text-gray-600">Loading your assigned inspections...</p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Failed to load inspections
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {errorMessage}
            </p>
            <button
              onClick={loadAssignedInspections}
              className="bg-[#116045] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0d4f38] transition duration-200 flex items-center"
            >
              <span className="mr-2">🔄</span>
              Try Again
            </button>
          </div>
        ) : assignedInspections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-500 mb-2 text-center">
              No Assigned Inspections
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              You don't have any inspections assigned to you at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {assignedInspections.map((inspection, index) => (
              <BuildInspectionCard 
                key={inspection.id || index} 
                inspection={inspection} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AssignedInspectionsScreen;