import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../Context/authContext';
import { useCampaign } from '../../Context/campaignContext';
import LoadingAnimation from '../Loading/CustomLoading';

// Import components
import BannerSection from './Sections/BannerSection';
import CampaignSidebar from './Sections/CampaignSidebar';
import MobileTabBar from './Sections/MobileTabBar';

// Import section components
import OverviewSection from './Sections/Overview';
import TeamSection from './Sections/TeamSection';
import EvidenceSection from './Sections/EvidenceSection';
import UpdatesSection from './Sections/UpdatesSection';
import ActivitySection from './Sections/ActivitySection';
import GallerySection from './Sections/GallerySection';
import VictimsSection from './Sections/VictimSection';
import ExpertHelpSection from './Sections/ExpertHelpSection';
import ManageSection from './Sections/ManageSection';
import SupporterSection from './Sections/SupporterSection';
import SignatureList from './Sections/SignatureList';

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser } = useAuth();
  const { 
    currentCampaign, 
    fetchCampaign, 
    isLoading, 
    error 
  } = useCampaign();
  
  // Modal state for cover image upload/generation
  const [showCoverModal, setShowCoverModal] = useState(false);

  // Fetch campaign data when component mounts or campaignId changes
  useEffect(() => {
    if (campaignId) {
      fetchCampaign(campaignId);
    }
  }, [campaignId, fetchCampaign]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to check if user is campaign creator or team member
  const isUserAuthorized = () => {
    // Check if we have both user and campaign data
    if (!currentUser) {
      console.log("Authorization failed: No current user");
      return false;
    }
    
    if (!currentCampaign) {
      console.log("Authorization failed: No current campaign");
      return false;
    }
    
    console.log("Checking authorization for:", {
      userId: currentUser.id,
      userEmail: currentUser.email,
      campaignCreator: currentCampaign.createdBy,
      campaignTeam: currentCampaign.team
    });
    
    // Check if user is creator
    if (currentCampaign.createdBy) {
      // Check both string and object ID comparison
      const creatorId = typeof currentCampaign.createdBy === 'object' 
        ? currentCampaign.createdBy._id 
        : currentCampaign.createdBy;
        
      if (creatorId === currentUser.id || creatorId === currentUser._id) {
        console.log("Authorization succeeded: User is campaign creator");
        return true;
      }
    }
    
    // Check if user is team member
    if (currentCampaign.team) {
      const allMembers = [
        currentCampaign.team.leader,
        currentCampaign.team.coLeader,
        currentCampaign.team.socialMediaCoordinator,
        currentCampaign.team.volunteerCoordinator,
        currentCampaign.team.financeManager,
        ...(currentCampaign.team.additionalMembers || [])
      ].filter(Boolean);
      
      const isTeamMember = allMembers.some(member => {
        if (!member) return false;
        
        // Check all possible ID formats
        const memberId = member.userId || member._id || member.id;
        const isMatch = memberId === currentUser.id || memberId === currentUser._id;
        
        if (isMatch) {
          console.log("Found matching team member:", member);
        }
        
        return isMatch;
      });
      
      if (isTeamMember) {
        console.log("Authorization succeeded: User is team member");
        return true;
      }
    }
    
    console.log("Authorization failed: User is not creator or team member");
    return false;
  };

  // Handle cover image edit
  const handleEditCover = () => {
    setShowCoverModal(true);
  };

  // Handle cover image update
  const handleCoverUpdated = (newCoverUrl) => {
    // Update the campaign in state with new cover URL
    if (currentCampaign) {
      const updatedCampaign = {
        ...currentCampaign,
        coverImage: newCoverUrl
      };
      // This would ideally update the state in your context
      console.log("Cover image updated:", newCoverUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingAnimation size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link to="/dashboard" className="flex items-center text-indigo-600 hover:text-indigo-800">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Area */}
      <BannerSection 
        campaign={currentCampaign}
        formatDate={formatDate}
        isUserAuthorized={isUserAuthorized()}
        onEditCover={handleEditCover}
        onCoverUpdated={handleCoverUpdated}
      />
      
      {/* Mobile Tab Navigation */}
      <MobileTabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        campaign={currentCampaign}
        isUserAuthorized={isUserAuthorized()}
      />
      
      {/* Main Content Area with Sidebar */}
      <div className="relative">
        {/* Campaign Side Navigation */}
        <CampaignSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          campaign={currentCampaign}
          isUserAuthorized={isUserAuthorized()}
        />
        
        {/* Main Content */}
        <div className="md:ml-64 p-4 md:p-6">
          {/* Render content based on active tab */}
          {activeTab === 'overview' && (
            <OverviewSection campaign={currentCampaign} />
          )}
          
          {activeTab === 'team' && (
            <TeamSection campaign={currentCampaign} />
          )}
          
          {activeTab === 'evidence' && (
            <EvidenceSection 
              campaign={currentCampaign}
              formatDate={formatDate}
              isUserAuthorized={isUserAuthorized()}
            />
          )}
          
          {activeTab === 'updates' && (
            <UpdatesSection 
              campaign={currentCampaign}
              formatDate={formatDate}
            />
          )}
          
          {activeTab === 'activity' && (
            <ActivitySection 
              campaign={currentCampaign}
              formatDate={formatDate}
              isUserAuthorized={isUserAuthorized()}
            />
          )}
          
          {activeTab === 'gallery' && (
            <GallerySection 
              campaign={currentCampaign}
              isUserAuthorized={isUserAuthorized()}
            />
          )}
          
          {activeTab === 'victims' && (
            <VictimsSection 
              campaign={currentCampaign} 
              isUserAuthorized={isUserAuthorized()}
            />
          )}
          
          {activeTab === 'expert' && (
            <ExpertHelpSection />
          )}
          
          {activeTab === 'legal' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">LegalEye Support</h2>
              {/* LegalEye content */}
            </div>
          )}
          
          {activeTab === 'supporters' && (
            <div className="p-6">
              <SupporterSection campaign={currentCampaign} />
            </div>
          )}

          {activeTab === 'signatures' && (
            <div className="p-6">
              <SignatureList campaignId={currentCampaign._id} />
            </div>
          )}
          
          {activeTab === 'manage' && isUserAuthorized() && (
            <ManageSection campaign={currentCampaign} />
          )}
          
          {activeTab === 'settings' && isUserAuthorized() && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Campaign Settings</h2>
              {/* Settings content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;