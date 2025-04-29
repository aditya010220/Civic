import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Campaign',
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  role: {
    type: String,
    enum: ['leader', 'co-leader', 'activity-updater', 'social-media', 'finance', 'volunteer-coordinator', 'analyst', 'designer'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canEditCampaign: { type: Boolean, default: false },
    canPostUpdates: { type: Boolean, default: false },
    canManageTeam: { type: Boolean, default: false },
    canModerateComments: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: true },
    canManageResources: { type: Boolean, default: false },
  },
  notes: String,
  assignedAt: { type: Date, default: Date.now },
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  lastActive: Date
});

teamSchema.pre('save', function(next) {
  if (this.isNew) {
    switch(this.role) {
      case 'leader':
        this.permissions = {
          canEditCampaign: true,
          canPostUpdates: true,
          canManageTeam: true,
          canModerateComments: true,
          canViewAnalytics: true,
          canManageResources: true
        };
        break;
      case 'co-leader':
        this.permissions = {
          canEditCampaign: true,
          canPostUpdates: true,
          canManageTeam: false,
          canModerateComments: true,
          canViewAnalytics: true,
          canManageResources: true
        };
        break;
      case 'activity-updater':
        this.permissions = {
          canEditCampaign: false,
          canPostUpdates: true,
          canManageTeam: false,
          canModerateComments: false,
          canViewAnalytics: true,
          canManageResources: true
        };
        break;
      case 'social-media':
        this.permissions = {
          canEditCampaign: false,
          canPostUpdates: true,
          canManageTeam: false,
          canModerateComments: true,
          canViewAnalytics: true,
          canManageResources: false
        };
        break;
      
    }
  }
  next();
});

// Index for performance
teamSchema.index({ campaignId: 1, userId: 1 }, { unique: true });
teamSchema.index({ userId: 1 });
teamSchema.index({ role: 1 });

const Team = mongoose.model('Team', teamSchema);
export default Team;