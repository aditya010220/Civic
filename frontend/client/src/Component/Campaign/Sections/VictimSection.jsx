import React, { useState } from 'react';
import { FaUserShield, FaUser, FaShieldAlt, FaEnvelope, FaPhone, FaHandHoldingHeart } from 'react-icons/fa';

const VictimsSection = ({ campaign }) => {
  const [activeVictimId, setActiveVictimId] = useState(null);
  
  // Get victims from campaign or use empty array
  const victims = campaign?.victims || [];
  
  // Handle support action for a victim
  const handleSupportVictim = (victimId) => {
    console.log(`Supporting victim: ${victimId}`);
    // Add support logic here
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-red-100 p-2 rounded-full mr-3">
          <FaUserShield className="text-red-600" size={20} />
        </div>
        <h2 className="text-xl font-semibold">Campaign Victims</h2>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
        <p className="text-yellow-800 text-sm">
          <strong>Important:</strong> Information shared here is presented with the consent of the victims or their representatives. 
          Some details may be anonymized for privacy and safety reasons. Please be respectful when discussing or sharing this information.
        </p>
      </div>
      
      {victims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {victims.map((victim) => (
            <div 
              key={victim._id || victim.id} 
              className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                activeVictimId === victim._id ? 'border-indigo-400 ring-2 ring-indigo-200' : ''
              }`}
              onClick={() => setActiveVictimId(victim._id || victim.id)}
            >
              <div className="relative">
                {victim.privacyLevel === 'public' && victim.image ? (
                  <div className="h-36 bg-gray-100">
                    <img 
                      src={victim.image} 
                      alt={victim.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-gray-100 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FaUser size={32} className="mx-auto mb-2" />
                      <p className="text-sm">{victim.privacyLevel === 'public' ? 'No Image Available' : 'Anonymous'}</p>
                    </div>
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    victim.privacyLevel === 'public' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {victim.privacyLevel === 'public' ? 'Public' : 'Anonymous'}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">
                  {victim.privacyLevel === 'public' ? victim.name : 'Anonymous Victim'}
                </h3>
                
                {victim.privacyLevel === 'public' && victim.location && (
                  <p className="text-gray-500 text-sm mb-3">{victim.location}</p>
                )}
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {victim.privacyLevel === 'public' 
                    ? victim.story || 'No story provided.' 
                    : 'This victim has chosen to remain anonymous. Their story is kept private to protect their identity.'
                  }
                </p>
                
                <div className="flex">
                  <button 
                    onClick={() => handleSupportVictim(victim._id || victim.id)}
                    className="flex-1 flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                  >
                    <FaHandHoldingHeart className="mr-2" /> Support
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Victim Information</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There is no victim information associated with this campaign.
          </p>
        </div>
      )}
      
      {/* Selected victim details */}
      {activeVictimId && victims.find(v => (v._id || v.id) === activeVictimId) && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {(() => {
              const victim = victims.find(v => (v._id || v.id) === activeVictimId);
              if (victim.privacyLevel === 'public') {
                return (
                  <>
                    <h4 className="font-medium">{victim.name}</h4>
                    {victim.age && <p className="text-gray-600 text-sm">Age: {victim.age}</p>}
                    {victim.location && <p className="text-gray-600 text-sm">Location: {victim.location}</p>}
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Story</h5>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">{victim.story || 'No story provided.'}</p>
                    </div>
                    
                    {victim.needs && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Needs</h5>
                        <p className="text-gray-600 text-sm">{victim.needs}</p>
                      </div>
                    )}
                    
                    {victim.contactPermission && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h5>
                        <div className="flex flex-col space-y-2">
                          {victim.email && (
                            <a 
                              href={`mailto:${victim.email}`} 
                              className="text-indigo-600 hover:text-indigo-800 flex items-center"
                            >
                              <FaEnvelope className="mr-2" /> {victim.email}
                            </a>
                          )}
                          {victim.phone && (
                            <a 
                              href={`tel:${victim.phone}`}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center"
                            >
                              <FaPhone className="mr-2" /> {victim.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              } else {
                return (
                  <div className="text-center py-4">
                    <FaShieldAlt className="mx-auto text-gray-400 mb-2" size={24} />
                    <h4 className="font-medium mb-2">Anonymous Victim</h4>
                    <p className="text-gray-600 text-sm">
                      This victim's information is kept private for their protection. If you have relevant information 
                      or wish to help, please contact the campaign organizers directly.
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VictimsSection;