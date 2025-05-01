import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSearch, FaFilter, FaFileUpload, FaImage, FaVideo, 
  FaFileAlt, FaMicrophone, FaQuoteRight, FaCheckCircle, 
  FaTimesCircle, FaExclamationCircle, FaHourglass,
  FaEye, FaDownload, FaPlus, FaSyncAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const EvidenceSection = ({ campaign, formatDate, isUserAuthorized }) => {
  // Basic state management
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simple form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState('photo');
  const [source, setSource] = useState('victim');
  const [testimonialContent, setTestimonialContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Load evidence when component mounts or campaign changes
  useEffect(() => {
    if (campaign?._id) {
      refreshEvidence();
    }
  }, [campaign]);
  
  // Refresh evidence data from server
  const refreshEvidence = async () => {
    if (!campaign?._id) return;
    
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/campaigns/${campaign._id}/evidence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEvidence(response.data.data);
      }
    } catch (error) {
      console.error('Error refreshing evidence:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Filter evidence based on status and search
  const filteredEvidence = evidence?.filter(item => {
    // Filter by status
    if (filter !== 'all' && item.status !== filter) {
      return false;
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        (item.title && item.title.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.testimonialContent && item.testimonialContent.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  }) || [];
  
  // Get icon based on evidence type
  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'photo': return <FaImage className="text-blue-600" />;
      case 'video': return <FaVideo className="text-red-600" />;
      case 'document': return <FaFileAlt className="text-amber-600" />;
      case 'audio': return <FaMicrophone className="text-purple-600" />;
      case 'testimonial': return <FaQuoteRight className="text-green-600" />;
      default: return <FaFileAlt className="text-gray-600" />;
    }
  };
  
  // Status styling helpers
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'accepted': return "bg-green-100 text-green-800";
      case 'rejected': return "bg-red-100 text-red-800";
      case 'under_review': return "bg-yellow-100 text-yellow-800";
      case 'pending_verification': return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      case 'under_review': return <FaExclamationCircle className="text-yellow-500" />;
      case 'pending_verification': 
      case 'pending_more_info':
      case 'submitted': return <FaHourglass className="text-blue-500" />;
      default: return <FaHourglass className="text-gray-500" />;
    }
  };

  // File selection handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Reset the form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEvidenceType('photo');
    setSource('victim');
    setTestimonialContent('');
    setSelectedFile(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Simple validation
    if (!title) {
      setErrorMessage("Title is required");
      return;
    }
    
    if (!description) {
      setErrorMessage("Description is required");
      return;
    }
    
    if (evidenceType === 'testimonial' && !testimonialContent) {
      setErrorMessage("Testimonial content is required");
      return;
    }
    
    if (evidenceType !== 'testimonial' && !selectedFile) {
      setErrorMessage("Please select a file to upload");
      return;
    }
    
    // Start upload process
    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('evidenceType', evidenceType);
      formData.append('source', source);
      
      if (evidenceType === 'testimonial') {
        formData.append('testimonialContent', testimonialContent);
      } else if (selectedFile) {
        // Important: Use 'files' as the field name to match backend expectation
        formData.append('files', selectedFile);
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/evidence`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      if (response.data.success) {
        setUploadSuccess(true);
        await refreshEvidence();
        resetForm();
        
        // Close modal after success
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      setErrorMessage(error.response?.data?.message || "Failed to upload evidence");
    } finally {
      setIsLoading(false);
    }
  };

  // Evidence types for the form
  const evidenceTypes = [
    { value: 'photo', label: 'Photo', icon: <FaImage /> },
    { value: 'video', label: 'Video', icon: <FaVideo /> },
    { value: 'document', label: 'Document', icon: <FaFileAlt /> },
    { value: 'audio', label: 'Audio', icon: <FaMicrophone /> },
    { value: 'testimonial', label: 'Testimonial', icon: <FaQuoteRight /> }
  ];
  
  const evidenceSources = [
    { value: 'victim', label: 'Victim' },
    { value: 'witness', label: 'Witness' },
    { value: 'official', label: 'Official Source' },
    { value: 'media', label: 'Media Outlet' },
    { value: 'investigation', label: 'Investigation' },
    { value: 'self_collected', label: 'Self-Collected' },
    { value: 'other', label: 'Other Source' }
  ];

  // Simplified Upload Modal Component
  const UploadModal = () => {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-bold">Upload New Evidence</h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-gray-500 hover:text-gray-700"
              type="button"
            >
              <FaTimesCircle size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Evidence Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence Type
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {evidenceTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setEvidenceType(type.value);
                        setErrorMessage('');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        evidenceType === type.value
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.icon}
                      <span className="mt-1 text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:border-black focus:ring-black"
                  placeholder="Enter title for this evidence"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:border-black focus:ring-black"
                  placeholder="Describe this evidence"
                ></textarea>
              </div>
              
              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:border-black focus:ring-black"
                >
                  {evidenceSources.map(src => (
                    <option key={src.value} value={src.value}>
                      {src.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Testimonial Content (if testimonial type) */}
              {evidenceType === 'testimonial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonial Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={testimonialContent}
                    onChange={(e) => setTestimonialContent(e.target.value)}
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:border-black focus:ring-black"
                    placeholder="Enter the testimonial text"
                  ></textarea>
                </div>
              )}
              
              {/* File Upload (if not testimonial) */}
              {evidenceType !== 'testimonial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-black transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept={evidenceType === 'photo' ? 'image/*' : 
                             evidenceType === 'video' ? 'video/*' :
                             evidenceType === 'audio' ? 'audio/*' : '*/*'}
                    />
                    <div className="flex flex-col items-center">
                      <FaFileUpload className="text-3xl mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to select a file'}
                      </p>
                      {selectedFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <FaExclamationCircle className="text-red-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Upload Progress */}
              {isLoading && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Success Message */}
              {uploadSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex">
                    <FaCheckCircle className="text-green-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-green-700">Evidence uploaded successfully!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Uploading...' : 'Upload Evidence'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Evidence Detail Modal Component
  const EvidenceDetailModal = ({ evidence, onClose }) => {
    if (!evidence) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-bold">{evidence.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimesCircle size={24} />
            </button>
          </div>
          
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            {/* Media content */}
            {evidence.mediaFile?.url && (
              <div className="mb-6">
                {evidence.evidenceType === 'photo' && (
                  <img 
                    src={evidence.mediaFile.url} 
                    alt={evidence.title} 
                    className="w-full max-h-[50vh] object-contain rounded-lg"
                  />
                )}
                
                {evidence.evidenceType === 'video' && (
                  <video 
                    src={evidence.mediaFile.url}
                    controls
                    className="w-full max-h-[50vh] rounded-lg"
                  />
                )}
                
                {evidence.evidenceType === 'audio' && (
                  <audio
                    src={evidence.mediaFile.url}
                    controls
                    className="w-full"
                  />
                )}
                
                {evidence.evidenceType === 'document' && (
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                    <FaFileAlt size={48} className="text-gray-500" />
                    <a 
                      href={evidence.mediaFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {/* Testimonial content */}
            {evidence.testimonialContent && (
              <div className="mb-6 bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300 italic">
                "{evidence.testimonialContent}"
              </div>
            )}
            
            {/* Evidence details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                <p className="text-gray-700">{evidence.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Type</h4>
                  <p className="text-gray-700 capitalize">{evidence.evidenceType}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Source</h4>
                  <p className="text-gray-700 capitalize">{evidence.source}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Status</h4>
                  <div className="flex items-center">
                    {getStatusIcon(evidence.status)}
                    <span className="ml-2 capitalize">{(evidence.status || "").replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Added On</h4>
                  <p className="text-gray-700">{formatDate(evidence.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
            {evidence.mediaFile?.url && (
              <a 
                href={evidence.mediaFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Download
              </a>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Campaign Evidence</h2>
          <p className="text-sm text-gray-500 mt-1">
            Documentation and materials supporting this campaign
          </p>
        </div>
        
        <div className="mt-3 sm:mt-0 flex gap-2">
          <button 
            onClick={refreshEvidence}
            className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
            disabled={isRefreshing}
          >
            <FaSyncAlt className={`${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {isUserAuthorized && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 shadow-sm transition-colors"
            >
              <FaFileUpload className="mr-2" /> Upload Evidence
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-black focus:border-black"
            placeholder="Search evidence..."
          />
        </div>
        
        <div className="w-full sm:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-black focus:border-black"
            >
              <option value="all">All Status</option>
              <option value="pending_verification">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredEvidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEvidence.map((item, index) => (
              <motion.div
                key={item._id || index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedEvidence(item)}
              >
                <div className="relative">
                  {/* Status badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{(item.status || "").replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  {/* Media preview */}
                  {item.mediaFile?.url && item.evidenceType === 'photo' ? (
                    <div className="h-48 bg-gray-100">
                      <img 
                        src={item.mediaFile.url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-b from-gray-100 to-white flex items-center justify-center">
                      <div className="p-6 bg-gray-50 rounded-full">
                        {getEvidenceIcon(item.evidenceType)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{item.title}</h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {item.testimonialContent && (
                    <p className="text-gray-600 text-sm italic mb-3 line-clamp-2 bg-gray-50 p-2 rounded-md">
                      "{item.testimonialContent}"
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="capitalize">{item.source}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add Evidence Card */}
          {isUserAuthorized && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors flex items-center justify-center cursor-pointer min-h-[300px]"
              onClick={() => setShowUploadModal(true)}
            >
              <div className="flex flex-col items-center text-gray-500 p-6 text-center">
                <FaPlus className="text-3xl mb-3" />
                <h3 className="font-medium text-lg">Add New Evidence</h3>
                <p className="text-sm mt-2">Upload photos, videos, documents or testimonials</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaFileAlt className="text-gray-400 w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Evidence Available</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {search || filter !== 'all' 
              ? "No evidence matches your search or filter criteria." 
              : "There is currently no evidence attached to this campaign."
            }
          </p>
          
          {isUserAuthorized && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 shadow-sm transition-colors"
            >
              <FaFileUpload className="mr-2" /> Upload Evidence
            </button>
          )}
        </div>
      )}
      
      {/* Modals */}
      {selectedEvidence && (
        <EvidenceDetailModal 
          evidence={selectedEvidence} 
          onClose={() => setSelectedEvidence(null)} 
        />
      )}
      
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default EvidenceSection;