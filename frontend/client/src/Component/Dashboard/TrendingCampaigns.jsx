import React from 'react';
import { FaArrowTrendUp, FaArrowRight, FaRegHeart } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const TrendingCampaigns = () => {
  // Mock data for trending campaigns
  const trendingCampaigns = [
    {
      id: 't1',
      title: "Stop Corporate Pollution in Green River",
      organization: "Environmental Defense Coalition",
      image: "https://images.unsplash.com/photo-1621451801944-57796f1dc98a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      trend: "+231% this week",
      supporters: "23K",
      category: "Environment"
    },
    {
      id: 't2',
      title: "Reform School Lunch Programs Nationwide",
      organization: "Healthy Future Initiative",
      image: "https://images.unsplash.com/photo-1577308873518-7fd772788ec6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      trend: "+178% this week",
      supporters: "17K",
      category: "Education"
    },
    {
      id: 't3',
      title: "Affordable Healthcare Access Campaign",
      organization: "People's Health Movement",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      trend: "+125% this week",
      supporters: "42K",
      category: "Healthcare"
    }
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-5">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FaArrowTrendUp className="text-black mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Trending Now</h2>
        </div>
        <button className="text-sm text-gray-500 hover:text-black flex items-center">
          View all <FaArrowRight size={12} className="ml-1" />
        </button>
      </div>
      
      <div className="space-y-4">
        {trendingCampaigns.map(campaign => (
          <Link to={`/campaigns/${campaign.id}`} key={campaign.id}>
            <div className="group relative rounded-lg overflow-hidden">
              <div className="h-40 w-full">
                <img 
                  src={campaign.image} 
                  alt={campaign.title} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-medium text-white inline-flex items-center mb-1">
                      <FaArrowTrendUp className="mr-1" size={10} />
                      {campaign.trend}
                    </div>
                    <h3 className="text-white font-bold line-clamp-2">{campaign.title}</h3>
                    <p className="text-white/70 text-xs mt-1">{campaign.organization}</p>
                  </div>
                  
                  <button className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 transition-colors">
                    <FaRegHeart className="text-white" size={14} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white text-xs">{campaign.supporters} supporters</span>
                  <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs text-white">
                    {campaign.category}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingCampaigns;