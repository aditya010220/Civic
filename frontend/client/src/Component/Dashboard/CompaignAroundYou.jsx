import React from 'react';
import { FaMapMarkerAlt, FaRegClock, FaUsers, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CampaignsAroundYou = () => {
  // Mock data for nearby campaigns with added color themes
  const nearbyCampaigns = [
    {
      id: 'c1',
      title: "Save Riverside Park",
      location: "Downtown, 2.3 miles",
      coverImage: "https://images.unsplash.com/photo-1552084117-56a987666449?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      supporters: 423,
      daysLeft: 14,
      category: "Environment",
      color: "green"
    },
    {
      id: 'c2',
      title: "Fund New Community Library",
      location: "Westside, 1.7 miles",
      coverImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      supporters: 156,
      daysLeft: 30,
      category: "Education",
      color: "blue"
    },
    {
      id: 'c3',
      title: "Safer Streets Initiative",
      location: "Northgate, 3.5 miles",
      coverImage: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      supporters: 291,
      daysLeft: 21,
      category: "Safety",
      color: "orange"
    }
  ];

  // Function to get gradient overlay based on color
  const getGradientStyle = (color) => {
    const styles = {
      green: "from-green-900/60 to-transparent",
      blue: "from-blue-900/60 to-transparent",
      orange: "from-orange-900/60 to-transparent",
      red: "from-red-900/60 to-transparent",
      purple: "from-purple-900/60 to-transparent",
      default: "from-gray-900/60 to-transparent"
    };
    return styles[color] || styles.default;
  };

  // Function to get pill style based on color
  const getPillStyle = (color) => {
    const styles = {
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
      purple: "bg-purple-100 text-purple-800",
      default: "bg-gray-100 text-gray-800"
    };
    return styles[color] || styles.default;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">Near You</h2>
        <button className="text-xs flex items-center space-x-1 text-gray-500 hover:text-black bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors">
          <span>View map</span>
          <FaArrowRight size={10} />
        </button>
      </div>
      
      <div className="space-y-3 overflow-auto flex-1">
        {nearbyCampaigns.map(campaign => (
          <Link to={`/campaigns/${campaign.id}`} key={campaign.id} className="block">
            <div className="relative h-32 rounded-lg overflow-hidden group">
              <img 
                src={campaign.coverImage} 
                alt={campaign.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              
              <div className={`absolute inset-0 bg-gradient-to-t ${getGradientStyle(campaign.color)}`}>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center text-xs text-white mb-1">
                    <FaMapMarkerAlt className="mr-1" size={10} />
                    <span>{campaign.location}</span>
                  </div>
                  
                  <h3 className="font-bold text-white text-sm line-clamp-1">{campaign.title}</h3>
                  
                  <div className="mt-1 flex justify-between text-xs">
                    <div className="flex items-center text-white/90">
                      <FaUsers className="mr-1" size={10} />
                      <span>{campaign.supporters}</span>
                    </div>
                    
                    <div className="flex items-center text-white/90">
                      <FaRegClock className="mr-1" size={10} />
                      <span>{campaign.daysLeft}d left</span>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getPillStyle(campaign.color)}`}>
                      {campaign.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <button className="mt-3 w-full py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        Explore More Nearby
      </button>
    </div>
  );
};

export default CampaignsAroundYou;