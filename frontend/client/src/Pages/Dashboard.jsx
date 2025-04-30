import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/authContext';
import { useCampaign } from '../Context/campaignContext';
import ProfileGlimpse from '../Component/Profile/ProfileGlimpse';
import SideNavbar from '../Component/Navbar/sideNavbar';
import LoadingAnimation from '../Component/Loading/CustomLoading.jsx';
import CampaignDashboard from '../Component/Campaign/CampaignDashboard';

function Dashboard() {
  const { currentUser, getGreetingMessage } = useAuth();
  const { getUserCampaigns, getCampaignStats, isLoading: campaignsLoading } = useCampaign();
  
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  
  // Use ref to track if data has been fetched
  const initialDataFetched = useRef(false);
  
  useEffect(() => {
    // Function to fetch data
    const fetchCampaignData = async () => {
      if (!initialDataFetched.current) {
        try {
          await getUserCampaigns({ limit: 10 });
          
          try {
            await getCampaignStats();
          } catch (statsError) {
            console.log("Could not load campaign stats, continuing anyway");
          }
          
          initialDataFetched.current = true;
        } catch (error) {
          console.error("Error fetching campaign data:", error);
          initialDataFetched.current = true;
        }
      }
    };
    
    if (currentUser) {
      setUserData(currentUser);
      setIsLoading(false);
      fetchCampaignData();
    } else {
      setIsLoading(true);
    }
  }, [currentUser]); // Only depend on currentUser, not the context functions

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SideNavbar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <LoadingAnimation size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Side Navigation */}
      <SideNavbar />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header Section with User Profile */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 hidden sm:inline">
                {getGreetingMessage()}, {userData.fullName}
              </span>
              <ProfileGlimpse userData={userData} />
            </div>
          </div>
          
          {/* Tabbed Navigation */}
          <div className="border-b border-gray-200">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8">
              <button
                className={`${
                  activeTab === 'campaigns'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('campaigns')}
              >
                Campaigns
              </button>
              <button
                className={`${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
            </nav>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Campaigns Tab Content */}
          {activeTab === 'campaigns' && (
            <div>
              <CampaignDashboard />
            </div>
          )}
          
          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-gray-500 sm:w-1/4">Full Name</span>
                  <span className="text-sm text-gray-900">{userData.fullName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-gray-500 sm:w-1/4">Email</span>
                  <span className="text-sm text-gray-900">{userData.email}</span>
                </div>
                {userData.location && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-sm font-medium text-gray-500 sm:w-1/4">Location</span>
                    <span className="text-sm text-gray-900">{userData.location}</span>
                  </div>
                )}
                {userData.joinDate && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-sm font-medium text-gray-500 sm:w-1/4">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {new Date(userData.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;