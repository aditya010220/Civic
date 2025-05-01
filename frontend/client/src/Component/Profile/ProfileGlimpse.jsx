import React from 'react';
import { 
  FaUser, FaEnvelope, FaCheckCircle, FaCalendarAlt,
  FaChartLine, FaNewspaper, FaUsers
} from 'react-icons/fa';

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

  // Modern loading skeleton
  if (!userData) {
    return (
      <div className="bg-white rounded-xl p-6 max-w-sm animate-pulse shadow-lg overflow-hidden">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 mr-4"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full w-full mb-6"></div>
        <div className="flex justify-between mb-6">
          <div className="h-16 bg-gray-200 rounded-lg w-[30%]"></div>
          <div className="h-16 bg-gray-200 rounded-lg w-[30%]"></div>
          <div className="h-16 bg-gray-200 rounded-lg w-[30%]"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Determine user level and role based on impact score and activities
  const getUserLevel = (score) => {
    if (!score) return { level: 1, title: "Advocate" };
    if (score < 50) return { level: 1, title: "Advocate" };
    if (score < 100) return { level: 2, title: "Activist" };
    if (score < 200) return { level: 3, title: "Organizer" };
    if (score < 500) return { level: 4, title: "Changemaker" };
    return { level: 5, title: "Leader" };
  };

  const { level, title } = getUserLevel(userData?.impactScore);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl max-w-sm">
      {/* User info with gradient accent */}
      <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="p-6">
        {/* Profile header */}
        <div className="flex items-center mb-4">
          {userData?.profilePicture ? (
            <div className="relative">
              <img 
                src={userData.profilePicture} 
                alt={`${userData?.fullName}'s profile`} 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
              {userData?.govVerification?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                  <FaCheckCircle size={12} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center shadow-md">
              <FaUser className="text-gray-500" size={24} />
            </div>
          )}
          
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-800">{userData?.fullName || 'Anonymous User'}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <span>{title}</span>
              <span className="mx-1.5 text-gray-300">•</span>
              <span>Level {level}</span>
            </div>
          </div>
        </div>
        
        {/* Bio section */}
        <p className="text-gray-600 mb-6 text-sm">
          {userData?.bio || `${userData?.fullName || 'This user'} is actively working to create positive social impact through civic campaigns.`}
        </p>
        
        {/* Stats with modern cards */}
        <div className="flex justify-between mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center w-[30%]">
            <div className="text-xl font-bold text-indigo-600">{userData?.impactScore || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center">
              <FaChartLine className="mr-1" size={10} /> Impact
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center w-[30%]">
            <div className="text-xl font-bold text-purple-600">{userData?.campaignsCreated?.length || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center">
              <FaNewspaper className="mr-1" size={10} /> Campaigns
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center w-[30%]">
            <div className="text-xl font-bold text-pink-600">{userData?.followersCount || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center">
              <FaUsers className="mr-1" size={10} /> Network
            </div>
          </div>
        </div>
        
        {/* Contact info with modern buttons */}
        <div className="space-y-2">
          <div className="flex items-center p-2 rounded-lg bg-gray-50 text-gray-700">
            <FaEnvelope className="text-gray-400 mr-3" />
            <span className="text-sm overflow-hidden overflow-ellipsis">{userData?.email || 'No email provided'}</span>
          </div>
          
          <div className="flex items-center p-2 rounded-lg bg-gray-50 text-gray-700">
            <FaCalendarAlt className="text-gray-400 mr-3" />
            <span className="text-sm">Joined {formatDate(userData?.createdAt)}</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-6 pb-4 flex space-x-2">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
          View Profile
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
          Connect
        </button>
      </div>
    </div>
  );
};

export default ProfileGlimpse;