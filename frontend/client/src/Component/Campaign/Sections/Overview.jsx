import React from 'react';
import { FaTag } from 'react-icons/fa';

const OverviewSection = ({ campaign }) => {
  if (!campaign) return null;
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">About this Campaign</h2>
      
      {campaign.shortDescription && (
        <div className="mb-6 text-lg text-gray-700 italic border-l-4 border-indigo-300 pl-4 py-2 bg-indigo-50 bg-opacity-30 rounded">
          "{campaign.shortDescription}"
        </div>
      )}
      
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{campaign.description}</p>
      </div>
      
      {campaign.tags && campaign.tags.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-2">Campaign Tags</h3>
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                <FaTag className="mr-1 text-gray-500" size={12} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {campaign.location && (campaign.location.city || campaign.location.state || campaign.location.country) && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-2">Location</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              {[
                campaign.location.city,
                campaign.location.state,
                campaign.location.country
              ].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewSection;