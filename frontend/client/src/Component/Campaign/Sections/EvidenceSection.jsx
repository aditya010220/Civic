import React, { useState } from 'react';
import { FaFileUpload, FaFileAlt, FaImage, FaVideo, FaFileWord, FaFilePdf, FaSearch, FaFilter } from 'react-icons/fa';

const EvidenceSection = ({ campaign, formatDate, isUserAuthorized }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Filter evidence based on status and search
  const filteredEvidence = campaign?.evidence?.filter(item => {
    // Filter by status
    if (filter !== 'all' && item.status !== filter) return false;
    
    // Filter by search
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && 
        !item.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Get icon based on evidence type
  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'photo':
        return <FaImage className="text-blue-500" />;
      case 'video':
        return <FaVideo className="text-red-500" />;
      case 'document':
        return <FaFileWord className="text-indigo-500" />;
      case 'pdf':
        return <FaFilePdf className="text-red-600" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };
  
  // Get status badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold">Campaign Evidence</h2>
        
        {isUserAuthorized && (
          <button className="mt-3 sm:mt-0 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm transition-colors">
            <FaFileUpload className="mr-2" /> Upload New Evidence
          </button>
        )}
      </div>
      
      {/* Filters and search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
              className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Evidence cards */}
      {filteredEvidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvidence.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {item.mediaFile?.url && item.evidenceType === 'photo' && (
                <div className="h-48 bg-gray-100">
                  <img 
                    src={item.mediaFile.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {getEvidenceIcon(item.evidenceType)}
                    </span>
                    <span className="capitalize text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                      {item.evidenceType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-medium text-lg mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {item.description}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Source: {item.source}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Evidence Available</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {search || filter !== 'all' 
              ? "No evidence matches your search or filter criteria." 
              : "There is currently no evidence attached to this campaign. Evidence helps strengthen the campaign's case and provides transparency to supporters."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default EvidenceSection;