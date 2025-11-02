import React from 'react';
import { Link } from 'react-router-dom';

const WelcomeScreen = () => {
  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test',
          role: 'admin'
        })
      });
      
      if (response.status === 401) {
        alert('✅ Backend is running! (Invalid credentials but server responded)');
      } else {
        alert(`✅ Backend is running! Status: ${response.status}`);
      }
    } catch (error) {
      alert('❌ Backend is not running. Please start Django server.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Investment Inspection System
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Connected to Django Backend - Real Database Operations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/login"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition duration-200 shadow-lg"
            >
              Login to System
            </Link>
            <button 
              onClick={checkBackend}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition duration-200"
            >
              Test Backend Connection
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-2xl mb-3">🔐</div>
            <h3 className="text-lg font-semibold mb-2">JWT Authentication</h3>
            <p className="text-green-100 text-sm">Secure login with Django REST Framework</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-2xl mb-3">🗄️</div>
            <h3 className="text-lg font-semibold mb-2">PostgreSQL Database</h3>
            <p className="text-green-100 text-sm">Real data operations with your models</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-2xl mb-3">👥</div>
            <h3 className="text-lg font-semibold mb-2">Role Management</h3>
            <p className="text-green-100 text-sm">Admin, Branch Admin, Inspector roles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;