import React from 'react';
import { 
  FaEdit, FaClipboardList, FaRegNewspaper, FaUsers, 
  FaHandshake, FaUserPlus, FaFileUpload, FaPhotoVideo,
  FaComments, FaCheck, FaHeart
} from 'react-icons/fa';

const ActivitySection = ({ campaign, formatDate }) => {
  // Construct timeline from various campaign activities
  const constructTimeline = () => {
    const timeline = [];
    
    // Add campaign creation
    if (campaign.createdAt) {
      timeline.push({
        type: 'creation',
        date: campaign.createdAt,
        title: 'Campaign Created',
        description: `${campaign.createdBy?.fullName || 'Someone'} created this campaign.`,
        icon: <FaEdit className="text-green-600" />
      });
    }
    
    // Add evidence uploads
    if (campaign.evidence && campaign.evidence.length > 0) {
      campaign.evidence.forEach(evidence => {
        timeline.push({
          type: 'evidence',
          date: evidence.createdAt,
          title: 'Evidence Added',
          description: `New evidence was added: "${evidence.title}"`,
          icon: <FaClipboardList className="text-blue-600" />,
          status: evidence.status
        });
      });
    }
    
    // Add updates
    if (campaign.updates && campaign.updates.length > 0) {
      campaign.updates.forEach(update => {
        timeline.push({
          type: 'update',
          date: update.postedAt || update.createdAt,
          title: 'Campaign Update',
          description: update.title,
          content: update.content,
          icon: <FaRegNewspaper className="text-indigo-600" />
        });
      });
    }
    
    // Add team changes if available
    if (campaign.teamChanges && campaign.teamChanges.length > 0) {
      campaign.teamChanges.forEach(change => {
        timeline.push({
          type: 'team',
          date: change.date,
          title: 'Team Change',
          description: change.description,
          icon: <FaUsers className="text-purple-600" />
        });
      });
    }
    
    // Add other activities if available
    if (campaign.activities && campaign.activities.length > 0) {
      campaign.activities.forEach(activity => {
        let icon;
        switch (activity.type) {
          case 'milestone':
            icon = <FaCheck className="text-green-600" />;
            break;
          case 'partnership':
            icon = <FaHandshake className="text-yellow-600" />;
            break;
          case 'supporter':
            icon = <FaUserPlus className="text-indigo-600" />;
            break;
          case 'media':
            icon = <FaPhotoVideo className="text-pink-600" />;
            break;
          case 'comment':
            icon = <FaComments className="text-gray-600" />;
            break;
          case 'reaction':
            icon = <FaHeart className="text-red-600" />;
            break;
          default:
            icon = <FaEdit className="text-blue-600" />;
        }
        
        timeline.push({
          type: activity.type,
          date: activity.date,
          title: activity.title,
          description: activity.description,
          icon
        });
      });
    }
    
    // Sort by date (newest first)
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  
  const timeline = constructTimeline();
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Activity Timeline</h2>
      
      {timeline.length > 0 ? (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-0 bottom-0 left-5 md:left-7 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="relative pl-10 md:pl-14">
                <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-white rounded-full border-4 border-white z-10 shadow-md">
                  {item.icon}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                  
                  {/* Optional content display for updates */}
                  {item.type === 'update' && item.content && (
                    <div className="mt-2 text-sm bg-white p-3 rounded border border-gray-100">
                      {item.content.length > 150 
                        ? `${item.content.substring(0, 150)}...` 
                        : item.content}
                    </div>
                  )}
                  
                  {/* Status badge for evidence */}
                  {item.type === 'evidence' && item.status && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        item.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Activity Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There's no activity history for this campaign yet. As the campaign progresses, activities will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivitySection;