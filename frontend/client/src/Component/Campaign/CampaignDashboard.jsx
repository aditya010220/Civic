import React, { useState, useEffect } from 'react';
import { useCampaign } from '../../Context/campaignContext';
import { Link } from 'react-router-dom';
import CampaignCreationForm from './CampaignForm';

// Campaign status badge with appropriate colors
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Campaign card component
const CampaignCard = ({ campaign }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="h-40 bg-gray-200 relative">
        {campaign.coverImage ? (
          <img 
            src={campaign.coverImage} 
            alt={campaign.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <span className="text-white text-lg font-medium">{campaign.title?.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={campaign.status} />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{campaign.shortDescription}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
          {campaign.category && (
            <span className="capitalize px-2 py-1 bg-gray-100 rounded-full">
              {campaign.category.replace('-', ' ')}
            </span>
          )}
        </div>
        
        {campaign.creationComplete ? (
          <div className="flex items-center justify-between">
            <Link 
              to={`/campaigns/${campaign._id}`} 
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              View Campaign
            </Link>
            <Link 
              to={`/campaigns/${campaign._id}/manage`} 
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Manage
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Step {campaign.creationStep}/5</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${(campaign.creationStep / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <Link 
              to={`/campaigns/${campaign._id}/edit`} 
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              Continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Campaign Dashboard Component
const CampaignDashboard = () => {
  const { 
    userCampaigns, 
    teamCampaigns,
    campaignStats,
    getUserCampaigns, 
    getTeamCampaigns,
    getCampaignStats,
    isLoading, 
    error 
  } = useCampaign();
  
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('my-campaigns');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Load initial data when component mounts
    getUserCampaigns();
    getTeamCampaigns();
    getCampaignStats();
  }, [getUserCampaigns, getTeamCampaigns, getCampaignStats]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    getUserCampaigns({ 
      search: searchTerm,
      status: filterStatus || undefined
    });
  };
  
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    getUserCampaigns({ 
      status,
      search: searchTerm || undefined
    });
  };
  
  const handleCampaignCreated = () => {
    setShowCreationForm(false);
    // Refresh campaign list
    getUserCampaigns();
  };
  
  // Statistics summary
  const StatisticCard = ({ title, value, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Campaign Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your advocacy campaigns and track their progress
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowCreationForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Campaign
          </button>
        </div>
      </div>
      
      {/* Stats Section */}
      {campaignStats && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatisticCard 
            title="Total Campaigns" 
            value={campaignStats.campaigns?.total || 0} 
          />
          <StatisticCard 
            title="Active Campaigns" 
            value={campaignStats.campaigns?.active || 0} 
          />
          <StatisticCard 
            title="Total Supporters" 
            value={campaignStats.engagement?.totalSupporters || 0} 
          />
          <StatisticCard 
            title="Total Views" 
            value={campaignStats.engagement?.totalViews?.toLocaleString() || 0} 
          />
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'my-campaigns'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('my-campaigns')}
          >
            My Campaigns
          </button>
          <button
            className={`${
              activeTab === 'team-campaigns'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('team-campaigns')}
          >
            Team Campaigns
          </button>
        </nav>
      </div>
      
      {/* Filters and Search */}
      {activeTab === 'my-campaigns' && (
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-1 text-sm rounded-full ${
                filterStatus === '' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('draft')}
              className={`px-3 py-1 text-sm rounded-full ${
                filterStatus === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`px-3 py-1 text-sm rounded-full ${
                filterStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilter('completed')}
              className={`px-3 py-1 text-sm rounded-full ${
                filterStatus === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Completed
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      )}
      
      {/* Display error if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Display campaigns */}
      {isLoading && (activeTab === 'my-campaigns' ? !userCampaigns.length : !teamCampaigns.length) ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'my-campaigns' ? (
            userCampaigns.length > 0 ? (
              userCampaigns.map(campaign => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreationForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Campaign
                  </button>
                </div>
              </div>
            )
          ) : (
            teamCampaigns.length > 0 ? (
              teamCampaigns.map(campaign => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="mt-2 text-sm font-medium text-gray-900">No team campaigns</h3>
                <p className="mt-1 text-sm text-gray-500">You're not part of any campaign teams yet.</p>
              </div>
            )
          )}
        </div>
      )}
      
      {/* Campaign Creation Modal */}
      {showCreationForm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowCreationForm(false)}
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <CampaignCreationForm 
                onSuccess={handleCampaignCreated}
                onCancel={() => setShowCreationForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;