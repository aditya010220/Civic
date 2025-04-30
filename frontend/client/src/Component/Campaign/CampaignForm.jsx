import React, { useState } from 'react';
import { useCampaign } from '../../Context/campaignContext';
import { useNavigate } from 'react-router-dom';

// Step 1: Basic Campaign Information
const Step1Form = ({ formData, updateFormData, nextStep }) => {
  const categories = [
    'environment', 'education', 'healthcare', 'human-rights',
    'animal-welfare', 'poverty', 'equality', 'infrastructure',
    'governance', 'public-safety', 'other'
  ];

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Campaign Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={updateFormData}
            required
            maxLength={100}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Give your campaign a clear, compelling title"
          />
        </div>

        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <input
            type="text"
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={updateFormData}
            required
            maxLength={200}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="A brief one-liner explaining your campaign (max 200 chars)"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.shortDescription?.length || 0}/200 characters
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Full Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={updateFormData}
            required
            rows={4}
            maxLength={5000}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Explain the issue in detail, your goals, and why people should support your campaign"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.description?.length || 0}/5000 characters
          </p>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={updateFormData}
            required
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (Optional)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={updateFormData}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter tags separated by commas (e.g., climate, local, urgent)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Add relevant keywords to help people find your campaign
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          disabled={!formData.title || !formData.description || !formData.shortDescription || !formData.category}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Step 2: Campaign Location and Timeline
const Step2Form = ({ formData, updateFormData, prevStep, nextStep }) => {
  const locationTypes = [
    { value: 'local', label: 'Local (City/Town)' },
    { value: 'state', label: 'State/Province' },
    { value: 'national', label: 'National' },
    { value: 'international', label: 'International' }
  ];

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      target: {
        name: name.includes('location.') ? name : `location.${name}`,
        value
      }
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Location & Timeline</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="locationType" className="block text-sm font-medium text-gray-700">
            Campaign Scope
          </label>
          <select
            id="locationType"
            name="location.type"
            value={formData.location?.type || 'local'}
            onChange={handleLocationChange}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {locationTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {(formData.location?.type === 'local' || formData.location?.type === 'state') && (
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City/Town
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.location?.city || ''}
              onChange={handleLocationChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}

        {(formData.location?.type === 'local' || formData.location?.type === 'state' || formData.location?.type === 'national') && (
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.location?.state || ''}
              onChange={handleLocationChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.location?.country || ''}
            onChange={handleLocationChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            Target End Date (Optional)
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate || ''}
            onChange={updateFormData}
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            When do you aim to achieve your campaign goal?
          </p>
        </div>

        <div>
          <label htmlFor="targetGoal" className="block text-sm font-medium text-gray-700">
            Campaign Goal Type
          </label>
          <select
            id="targetGoal"
            name="targetGoal"
            value={formData.targetGoal || 'signatures'}
            onChange={updateFormData}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="signatures">Signatures</option>
            <option value="awareness">Awareness</option>
            <option value="policy_change">Policy Change</option>
            <option value="fundraising">Fundraising</option>
            <option value="volunteer_recruitment">Volunteer Recruitment</option>
          </select>
        </div>

        <div>
          <label htmlFor="targetNumber" className="block text-sm font-medium text-gray-700">
            Target Goal Number
          </label>
          <input
            type="number"
            id="targetNumber"
            name="targetNumber"
            value={formData.targetNumber || 1000}
            onChange={updateFormData}
            min={1}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            How many {formData.targetGoal === 'signatures' ? 'signatures' : 
                       formData.targetGoal === 'awareness' ? 'views' : 
                       formData.targetGoal === 'fundraising' ? 'dollars' : 
                       formData.targetGoal === 'volunteer_recruitment' ? 'volunteers' : 
                       'supporters'} are you aiming for?
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Step 3: Campaign Summary & Creation
const Step3Form = ({ formData, prevStep, onSubmit, isLoading, error }) => {
  // Format the campaign data for display
  const formatLocation = () => {
    const { location } = formData;
    if (!location) return 'Not specified';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Review & Create Campaign</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-gray-50 rounded-md p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Campaign Title</h3>
          <p className="mt-1 text-sm text-gray-900">{formData.title}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Short Description</h3>
          <p className="mt-1 text-sm text-gray-900">{formData.shortDescription}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="mt-1 text-sm text-gray-900 capitalize">{formData.category?.replace('-', ' ')}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Location</h3>
          <p className="mt-1 text-sm text-gray-900">{formatLocation()}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Campaign Goal</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formData.targetNumber?.toLocaleString()} {formData.targetGoal?.replace('_', ' ')}
          </p>
        </div>
        
        {formData.endDate && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Target End Date</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(formData.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
        
        {formData.tags && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tags</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {formData.tags.split(',').map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          <span className="font-medium">What happens next?</span> After creating your campaign, you'll be taken to the campaign setup wizard where you can:
        </p>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Add team members</li>
          <li>Add evidence and documentation</li>
          <li>Set up communication channels</li>
          <li>Publish your campaign when ready</li>
        </ul>
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Campaign'
          )}
        </button>
      </div>
    </div>
  );
};

// Main multi-step form component
const CampaignCreationForm = ({ onSuccess, onCancel }) => {
  const { createCampaign, isLoading, error, clearError } = useCampaign();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    tags: '',
    location: {
      type: 'local',
      city: '',
      state: '',
      country: ''
    },
    targetGoal: 'signatures',
    targetNumber: 1000
  });

  const updateFormData = (e) => {
    const { name, value } = e.target;
    
    // Clear any existing errors when user makes changes
    if (error) clearError();
    
    // Handle nested location object
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else {
      // For regular fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // Format tags into array if present
      let submitData = { ...formData };
      if (submitData.tags) {
        submitData.tags = submitData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
      
      // Create campaign
      const newCampaign = await createCampaign(submitData);
      
      if (onSuccess) {
        onSuccess(newCampaign);
      }
      
      // Navigate to campaign edit page to continue setup
      navigate(`/campaigns/${newCampaign._id}/edit`);
    } catch (err) {
      // Error is already handled in context
      console.error("Failed to create campaign:", err);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Form
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <Step2Form
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
      case 3:
        return (
          <Step3Form
            formData={formData}
            prevStep={prevStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white">
      {/* Progress bar */}
      <div className="px-6 pt-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span className={step >= 1 ? 'text-indigo-600 font-medium' : ''}>Details</span>
          <span className={step >= 2 ? 'text-indigo-600 font-medium' : ''}>Location</span>
          <span className={step >= 3 ? 'text-indigo-600 font-medium' : ''}>Review</span>
        </div>
      </div>
      
      {/* Form steps */}
      {renderStep()}
    </div>
  );
};

export default CampaignCreationForm;