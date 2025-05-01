import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, 
  FaUser, FaSignature, FaShareAlt, FaCamera,
  FaUpload, FaRobot, FaTimes, FaSpinner
} from 'react-icons/fa';

const isUserAuthorized = () => {
  if (!currentUser || !currentCampaign) return false;
  
  // Check if user is creator
  if (currentCampaign.createdBy && currentCampaign.createdBy._id === currentUser.id) {
    return true;
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
    
    return allMembers.some(member => 
      member && member.userId && member.userId === currentUser.id
    );
  }
  
  return false;
};

const BannerSection = ({ campaign, formatDate, isUserAuthorized, onEditCover, onCoverUpdated }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [uploadTab, setUploadTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempCoverImage, setTempCoverImage] = useState(null);
  
  if (!campaign) return null;
  
  // Display either the temporary cover image (for instant feedback) or the actual campaign cover
  const displayCoverImage = tempCoverImage || campaign.coverImage;
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('coverImage', selectedFile);
      
      // Get token
      const token = localStorage.getItem('token');
      
      console.log('Form data ready for upload', {
        file: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // Instantly show the new image by setting it as temporary cover
      setTempCoverImage(previewUrl);
      
      // Close modal and reset form states, but keep tempCoverImage
      setShowModal(false);
      setSelectedFile(null);
      
      // Make the actual API request
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/cover-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Once the API responds successfully, clear the temp image and notify parent
      setTempCoverImage(null);
      setPreviewUrl(null);
      
      // Notify parent component that cover has been updated
      if (onCoverUpdated) {
        onCoverUpdated(response.data.coverImage);
      }
      
    } catch (err) {
      console.error('Error uploading image:', err);
      // If there's an error, revert back to original cover
      setTempCoverImage(null);
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateAI = async () => {
    if (!aiPrompt || aiPrompt.trim() === '') {
      setError('Please enter a description for your image');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // For now just log the prompt since backend isn't fully implemented
      console.log('AI Image generation prompt:', aiPrompt);
      
      // Reset states and close modal
      setShowModal(false);
      setAiPrompt('');
      
      // This would be used when backend is ready
      // const token = localStorage.getItem('token');
      // const response = await axios.post(
      //   `/api/campaigns/${campaign._id}/generate-cover`,
      //   { prompt: aiPrompt },
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${token}`
      //     }
      //   }
      // );
      
      // if (onCoverUpdated) {
      //   onCoverUpdated(response.data.coverImage);
      // }
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.response?.data?.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="relative">
      <div className=" text-white relative">
        {/* Cover image with black and white filter */}
        {displayCoverImage ? (
          <div className="absolute inset-0">
            <img 
              src={displayCoverImage} 
              alt={campaign.title} 
              className="w-full h-full object-cover filter"
            />
          </div>
        ) : null}
        
        {/* Grain/texture overlay for newspaper feel */}
        <div className="absolute inset-0 bg-repeat opacity-10" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")` 
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 flex items-center">
                <Link to="/dashboard" className="text-white opacity-75 hover:opacity-100 flex items-center mr-4">
                  <FaArrowLeft className="mr-2" /> Back
                </Link>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800 uppercase tracking-wider font-serif">
                  {campaign.category?.replace(/-/g, ' ')}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 font-serif tracking-tight leading-none">
                {campaign.title}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-4 font-serif italic">
                {campaign.shortDescription}
              </p>
              <div className="flex flex-wrap items-center text-sm opacity-75 gap-4 font-serif">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span>Started on {formatDate(campaign.createdAt)}</span>
                </div>
                
                {campaign.location && (campaign.location.city || campaign.location.state || campaign.location.country) && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>
                      {[
                        campaign.location.city,
                        campaign.location.state,
                        campaign.location.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                {campaign.createdBy && (
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    <span>By {campaign.createdBy.fullName || "Anonymous"}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex flex-col items-center">
              <div className="bg-black bg-opacity-70 border border-gray-400 rounded-lg p-4 shadow-lg text-center">
                <div className="text-3xl font-bold font-serif">{campaign.engagementMetrics?.supporters || 0}</div>
                <div className="text-sm uppercase tracking-wide">Supporters</div>
              </div>
              
              <div className="flex mt-4 space-x-2">
                <button className="flex-1 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg shadow flex items-center justify-center font-medium font-serif">
                  <FaSignature className="mr-2" /> Sign
                </button>
                <button className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-lg shadow">
                  <FaShareAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit cover image button - only for authorized users */}
        {isUserAuthorized && (
          <button 
            onClick={() => setShowModal(true)}
            className="absolute top-4 right-4 bg-black hover:bg-gray-800 text-white p-2 rounded-lg flex items-center"
          >
            <FaCamera className="mr-1" /> 
            <span className="text-sm">Edit Cover</span>
          </button>
        )}
      </div>
      
      {/* Cover Image Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-serif">Campaign Cover Image</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setAiPrompt('');
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  uploadTab === 'upload'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                } font-serif`}
                onClick={() => setUploadTab('upload')}
              >
                <FaUpload className="inline mr-2" /> Upload Image
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  uploadTab === 'ai'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                } font-serif`}
                onClick={() => setUploadTab('ai')}
              >
                <FaRobot className="inline mr-2" /> Generate with AI
              </button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm font-serif">
                {error}
              </div>
            )}
            
            {/* Upload Image Tab - with black and white preview */}
            {uploadTab === 'upload' && (
              <div>
                {previewUrl ? (
                  <div className="mb-4">
                    <div className="relative aspect-w-5 aspect-h-2 rounded-md overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full object-cover filter grayscale contrast-125"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center font-serif">
                      Preview shown with newspaper black & white effect
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                      Upload Cover Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center">
                        <FaUpload className="text-gray-400 text-3xl mb-2" />
                        <span className="text-gray-500 mb-1 font-serif">Click to upload or drag and drop</span>
                        <span className="text-xs text-gray-400 font-serif">PNG, JPG, WebP, GIF up to 5MB</span>
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-serif"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-serif"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="inline mr-2 animate-spin" /> Uploading...
                      </>
                    ) : (
                      'Upload Image'
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Generate with AI Tab */}
            {uploadTab === 'ai' && (
              <div>
                <div className="mb-4">
                  <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                    Describe the cover image you want
                  </label>
                  <textarea
                    id="ai-prompt"
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., A dramatic black and white photo of protesters with signs, newspaper style, high contrast, dramatic lighting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-serif"
                  />
                  <p className="mt-1 text-xs text-gray-500 font-serif">
                    For best results with the newspaper theme, request black & white images with high contrast and dramatic lighting.
                  </p>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-serif"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateAI}
                    disabled={!aiPrompt.trim() || isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-serif"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="inline mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <FaRobot className="inline mr-2" /> Generate Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSection;