import React from 'react';
import { FaUser, FaEnvelope, FaMedal, FaCalendarAlt, FaUsers } from 'react-icons/fa';

const ProfileGlimpse = ({ userData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Add a loading state check
  if (!userData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 max-w-sm animate-pulse">
        <div className="flex items-center mb-5">
          <div className="w-16 h-16 rounded-full mr-4 bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex justify-between py-3 border-t border-b border-gray-200 mb-5">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-sm transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-center mb-5">
        {userData?.profilePicture ? (
          <img 
            src={userData.profilePicture} 
            alt={`${userData?.fullName}'s profile`} 
            className="w-16 h-16 rounded-full mr-4 border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full mr-4 bg-gray-100 flex items-center justify-center text-indigo-500 border-2 border-gray-200">
            <FaUser size={24} />
          </div>
        )}
        <div className="flex flex-col"> 
          <h3 className="text-xl font-semibold text-gray-800 m-0 mb-1">{userData?.fullName}</h3>
          <span className="text-sm text-indigo-500 font-medium capitalize">{userData?.role}</span>   
        </div>
      </div>
      
      <div className="flex justify-between py-3 border-t border-b border-gray-200 mb-5">
        <div className="flex flex-col items-center flex-1">
          <FaMedal className="text-indigo-500 mb-2 text-xl" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg text-gray-800">{userData?.impactScore || 0}</span>
            <span className="text-xs text-gray-500">Impact Score</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center flex-1">
          <FaUsers className="text-indigo-500 mb-2 text-xl" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg text-gray-800">{userData?.followersCount || 0}</span>
            <span className="text-xs text-gray-500">Followers</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center flex-1">
          <FaCalendarAlt className="text-indigo-500 mb-2 text-xl" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg text-gray-800">
              {userData?.campaignsCreated?.length || 0}
            </span>
            <span className="text-xs text-gray-500">Campaigns</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center mb-3">
        <FaEnvelope className="text-indigo-500 mr-2" />
        <span className="text-sm text-gray-600">{userData?.email || 'No email provided'}</span>
      </div>
      
      <div className="flex flex-col text-xs text-gray-500 mb-3">
        <span>Joined {formatDate(userData?.createdAt)}</span>
        <span>Login count: {userData?.loginCount || 0}</span>
      </div>
      
      {userData?.govVerification?.isVerified && (
        <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          ✓ Government Verified
        </div>
      )}
    </div>
  );
};

export default ProfileGlimpse;