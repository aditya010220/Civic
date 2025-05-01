import React from 'react';
import { 
  FaChartLine, FaHistory, FaClipboardList, FaPhotoVideo,
  FaUsers, FaUserShield, FaComments, FaGavel, FaWrench, FaCogs 
} from 'react-icons/fa';

const CampaignSidebar = ({ activeTab, setActiveTab, campaign, isUserAuthorized }) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-300 h-full fixed left-0 z-10 shadow-md font-serif">
      <div className="p-4 border-b border-gray-300 bg-white">
        <h3 className="font-bold text-lg text-gray-900 tracking-tight">Campaign Menu</h3>
      </div>
      
      <nav className="px-2 py-4">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'overview' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaChartLine className="mr-3" />
              <span>Overview</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'updates' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaHistory className="mr-3" />
              <span>Updates</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'evidence' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaClipboardList className="mr-3" />
              <span>Evidence ({campaign?.evidence?.length || 0})</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'gallery' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaPhotoVideo className="mr-3" />
              <span>Gallery</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'activity' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaHistory className="mr-3" />
              <span>Activity Timeline</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'team' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaUsers className="mr-3" />
              <span>Team</span>
            </button>
          </li>
          
          {campaign?.hasVictims && (
            <li>
              <button
                onClick={() => setActiveTab('victims')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'victims' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-800 hover:bg-gray-200'
                }`}
              >
                <FaUserShield className="mr-3" />
                <span>Victims</span>
              </button>
            </li>
          )}
          
          <li className="pt-4 border-t border-gray-300 mt-4">
            <h4 className="px-3 text-xs text-gray-700 uppercase font-bold mb-2 tracking-widest">
              Support Tools
            </h4>
          </li>
          
          <li>
            <button
              onClick={() => setActiveTab('expert')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'expert' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaComments className="mr-3" />
              <span>Talk to Expert</span>
            </button>
          </li>
          
          <li>
            <button
              onClick={() => setActiveTab('legal')}
              className={`flex items-center w-full px-3 py-2 rounded-md ${
                activeTab === 'legal' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <FaGavel className="mr-3" />
              <span>LegalEye</span>
            </button>
          </li>
          
          {/* Only show if user is authorized */}
          {isUserAuthorized && (
            <>
              <li className="pt-4 border-t border-gray-300 mt-4">
                <h4 className="px-3 text-xs text-gray-700 uppercase font-bold mb-2 tracking-widest">
                  Admin Tools
                </h4>
              </li>
              
              <li>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === 'manage' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FaWrench className="mr-3" />
                  <span>Manage Campaign</span>
                </button>
              </li>
              
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === 'settings' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FaCogs className="mr-3" />
                  <span>Campaign Settings</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
      
      {/* Newspaper-style decorative footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-300 text-center">
        <div className="text-xs text-gray-500 font-serif italic">
          The Civic Chronicle
        </div>
        <div className="text-xs text-gray-400 font-serif mt-1">
          Est. {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default CampaignSidebar;