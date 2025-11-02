import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionsAPI, usersAPI } from '../services/api';
import './NewInspectionScreen.css';

const NewInspectionScreen = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    project: '',
    client_name: '',
    industry_name: '',
    phone_number: '',
    assigned_inspector: '',
    branch_name: ''
  });

  const [inspectors, setInspectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [branchName, setBranchName] = useState('');

  useEffect(() => {
    loadBranchInfo();
    fetchInspectors();
  }, []);

  const loadBranchInfo = () => {
    const branch = localStorage.getItem('branch_name') || '';
    setBranchName(branch);
    setFormData(prev => ({ ...prev, branch_name: branch }));
    console.log("✅ Branch Name:", branch);
  };

  const fetchInspectors = async () => {
    try {
      setIsLoading(true);
      
      const response = await usersAPI.getInspectors();
      
      if (response.success) {
        setInspectors(response.data.results || response.data || []);
        console.log("✅ Inspectors loaded:", (response.data.results || response.data || []).length);
        
        // Debug: Print inspector details
        (response.data.results || response.data || []).forEach(inspector => {
          console.log("👤 Inspector:", inspector.user_name, "- ID:", inspector.id);
        });
      } else {
        console.log("❌ Failed to load inspectors");
        setErrors({ fetch: 'Failed to load inspectors list' });
      }
    } catch (error) {
      console.error("🚨 Error fetching inspectors:", error);
      setErrors({ fetch: 'Error loading inspectors. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

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

    if (!formData.project.trim()) {
      newErrors.project = 'Project name is required';
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (!formData.industry_name.trim()) {
      newErrors.industry_name = 'Industry name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (!formData.assigned_inspector) {
      newErrors.assigned_inspector = 'Please select an inspector';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createInspection = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare the request data
      const requestData = {
        project: formData.project.trim(),
        client_name: formData.client_name.trim(),
        industry_name: formData.industry_name.trim(),
        phone_number: formData.phone_number.trim(),
        assigned_inspector: formData.assigned_inspector,
        branch_name: formData.branch_name
      };

      console.log("📡 Creating inspection with data:", requestData);
      console.log("👤 Selected Inspector ID:", formData.assigned_inspector);

      const response = await inspectionsAPI.createNewInspection(requestData);

      if (response.success) {
        console.log("✅ Inspection created successfully!");
        
        // Show success message
        alert("Inspection created successfully!");
        
        // Navigate back or to inspections list
        navigate('/inspections');
      } else {
        console.log("❌ Failed to create inspection:", response.error);
        setErrors({ submit: response.error || 'Failed to create inspection' });
      }
    } catch (error) {
      console.error("🚨 Error creating inspection:", error);
      setErrors({ submit: 'An error occurred while creating inspection. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createInspection();
  };

  const FormField = ({ label, name, value, onChange, type = 'text', required = false, error, placeholder, icon }) => (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-lg">{icon}</span>
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200
            ${icon ? 'pl-10' : 'pl-4'}
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );

  const SelectField = ({ label, name, value, onChange, options, required = false, error, icon }) => (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <span className="text-gray-400 text-lg">{icon}</span>
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          required={required}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 appearance-none
            ${icon ? 'pl-10' : 'pl-4'}
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          `}
        >
          <option value="">Select {label}</option>
          {options.map((inspector) => (
            <option key={inspector.id} value={inspector.id}>
              {inspector.user_name} ({inspector.email})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <span className="text-gray-400">▼</span>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Inspectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">
                Create New Inspection
              </h1>
              <p className="text-green-100 text-sm mt-1">
                Fill in the basic details to create a new inspection assignment
              </p>
            </div>
            
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors duration-200"
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-green-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Inspection Details</h2>
            <p className="text-green-100 text-sm mt-1">
              All fields marked with * are required
            </p>
          </div>

          {/* Error Alert */}
          {errors.fetch && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">❌</span>
                <div>
                  <h3 className="text-red-800 font-medium">Unable to load inspectors</h3>
                  <p className="text-red-600 text-sm mt-1">{errors.fetch}</p>
                </div>
              </div>
              <button
                onClick={fetchInspectors}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-500 text-xl mr-3">❌</span>
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              </div>
            )}

            <FormField
              label="Project Name"
              name="project"
              value={formData.project}
              onChange={handleInputChange}
              required={true}
              error={errors.project}
              placeholder="Enter project name"
              icon="🏗️"
            />

            <FormField
              label="Client Name"
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              required={true}
              error={errors.client_name}
              placeholder="Enter client name"
              icon="👤"
            />

            <FormField
              label="Industry Name"
              name="industry_name"
              value={formData.industry_name}
              onChange={handleInputChange}
              required={true}
              error={errors.industry_name}
              placeholder="Enter industry name"
              icon="🏢"
            />

            <FormField
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              type="tel"
              required={true}
              error={errors.phone_number}
              placeholder="Enter phone number"
              icon="📞"
            />

            <SelectField
              label="Assigned Inspector"
              name="assigned_inspector"
              value={formData.assigned_inspector}
              onChange={handleInputChange}
              options={inspectors}
              required={true}
              error={errors.assigned_inspector}
              icon="👷"
            />

            {/* Branch Info Display */}
            {branchName && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-blue-500 text-lg mr-3">🏢</span>
                  <div>
                    <p className="text-blue-800 font-medium">Branch</p>
                    <p className="text-blue-600 text-sm">{branchName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center
                  ${isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Creating Inspection...
                  </>
                ) : (
                  <>
                    <span className="text-xl mr-3">➕</span>
                    Create Inspection
                  </>
                )}
              </button>
            </div>

            {/* Form Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                After creation, the assigned inspector will be able to complete the detailed inspection form
              </p>
            </div>
          </form>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl mb-2">👷</div>
            <h3 className="font-semibold text-gray-800">Available Inspectors</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{inspectors.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl mb-2">🏢</div>
            <h3 className="font-semibold text-gray-800">Branch</h3>
            <p className="text-lg text-gray-600 mt-2 truncate">{branchName || 'Not set'}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800">Quick Setup</h3>
            <p className="text-sm text-gray-600 mt-2">Complete in 2 minutes</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewInspectionScreen;