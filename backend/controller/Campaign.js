import Campaign from '../models/campaign.js';
import CampaignTeam from '../models/campaignTeam.js';
import CampaignVictim from '../models/CompaignVictim.js';
import CampaignEvidence from '../models/CampaignEvidence.js';
import cloudinary from '../config/cloudinary.js';
import { uploadToBlob, deleteFromBlob } from '../config/vercelBlob.js';
import { validateEvidence } from '../config/gemini.js'; // Keep if you have this service
import mongoose from 'mongoose';
import { promises as fs } from 'fs'; // Standard Node.js module
import path from 'path'; // Standard Node.js module

// Removed Queue and logger imports

/**
 * Create a new campaign (Step 1) - Enhanced
 */
export const createCampaign = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate required fields
    const { title, description, shortDescription, category } = req.body;

    if (!title || !description || !shortDescription || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        requiredFields: ['title', 'description', 'shortDescription', 'category']
      });
    }

    // Sanitize and trim input data
    const sanitizedData = {
      ...req.body,
      title: title.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      category: category.trim()
      // Add trimming/sanitization for other fields as needed
    };

    // Create campaign
    const campaign = new Campaign({
      ...sanitizedData,
      createdBy: req.user._id,
      status: 'draft',
      creationStep: 1 // Start at step 1
    });

    await campaign.save({ session });

    // Create initial campaign team with creator as leader
    const team = new CampaignTeam({
      campaign: campaign._id,
      leader: {
        userId: req.user._id,
        name: req.user.fullName || req.user.displayName || 'Campaign Leader', // Fallback name
        email: req.user.email,
        acceptedInvite: true, // Creator automatically accepts
        joinedAt: new Date()
      }
    });

    await team.save({ session });

    // Link team to campaign
    campaign.team = team._id;
    await campaign.save({ session });

    await session.commitTransaction();

    console.log(`[INFO] Campaign ${campaign._id} created by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`[ERROR] Campaign creation error: ${error.message}`, { error, userId: req.user?._id });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating campaign',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};

/**
 * Update campaign step by step - Enhanced
 */
export const updateCampaignStep = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { step, data } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign ID' });
    }

    if (!step || !data) {
        return res.status(400).json({ success: false, message: 'Missing step or data in request body' });
    }

    const campaign = await Campaign.findById(id).session(session);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check permissions - Only creator can update during creation steps
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      console.warn(`[WARN] Unauthorized campaign update attempt: User ${req.user._id} tried to update campaign ${id} owned by ${campaign.createdBy}`);
      return res.status(403).json({ success: false, message: 'Not authorized to update this campaign' });
    }

    // Ensure steps are completed in order (or allow returning to step 1)
    const currentStep = parseInt(step);
    if (currentStep !== campaign.creationStep && currentStep !== 1) {
      return res.status(400).json({
        success: false,
        message: `Cannot jump to step ${currentStep}. Current step is ${campaign.creationStep}. Please complete steps sequentially.`
      });
    }

    let nextStep = campaign.creationStep; // Default to current step

    switch (currentStep) {
      case 1: // Basic info update
        if (data.title) campaign.title = data.title.trim();
        if (data.description) campaign.description = data.description.trim();
        if (data.shortDescription) campaign.shortDescription = data.shortDescription.trim();
        if (data.category) campaign.category = data.category;
        if (data.tags) {
          campaign.tags = Array.isArray(data.tags)
            ? data.tags.filter(tag => tag && tag.trim()).map(tag => tag.trim())
            : [];
        }
        if (data.endDate) campaign.endDate = new Date(data.endDate);
        if (data.location) campaign.location = data.location;
        // Add other step 1 fields as needed

        nextStep = 2; // Move to step 2 after updating step 1
        break;

      case 2: // Team setup
        if (!campaign.team) {
          return res.status(400).json({ success: false, message: 'Campaign team not initialized. Cannot proceed to step 2.' });
        }
        const team = await CampaignTeam.findById(campaign.team).session(session);
        if (!team) {
          return res.status(404).json({ success: false, message: 'Campaign team not found' });
        }

        // Update team roles
        const roleUpdates = ['coLeader', 'socialMediaCoordinator', 'volunteerCoordinator', 'financeManager'];

        for (const role of roleUpdates) {
          if (data[role]) {
            // Handle invitations for new team members
            if (data[role].userId && data[role].userId !== team[role]?.userId?.toString()) {
              data[role].invitedAt = new Date();
              data[role].acceptedInvite = false;

              // TODO: Send invitation email or notification to the user
            }

            team[role] = data[role];
          }
        }

        if (data.additionalMembers) {
          // Update existing members and add new ones
          const existingMembers = team.additionalMembers || [];
          const updatedMembers = [];

          // Process existing members first
          for (const existingMember of existingMembers) {
            const matchingUpdatedMember = data.additionalMembers.find(
              m => m._id === existingMember._id?.toString() ||
                  (m.userId && m.userId === existingMember.userId?.toString())
            );

            if (matchingUpdatedMember) {
              // Update existing member
              updatedMembers.push({
                ...existingMember.toObject(),
                ...matchingUpdatedMember,
                userId: existingMember.userId // Keep the original userId as ObjectId
              });
            } else {
              // Keep the existing member
              updatedMembers.push(existingMember);
            }
          }

          // Add new members
          for (const newMember of data.additionalMembers) {
            const isNewMember = !existingMembers.some(
              m => m._id?.toString() === newMember._id ||
                  (m.userId && m.userId.toString() === newMember.userId)
            );

            if (isNewMember) {
              updatedMembers.push({
                ...newMember,
                invitedAt: new Date(),
                acceptedInvite: false
                // TODO: Send invitation
              });
            }
          }

          team.additionalMembers = updatedMembers;
        }

        if (data.communicationChannels) {
          team.communicationChannels = data.communicationChannels;
        }

        await team.save({ session });
        nextStep = 3; // Move to step 3 after updating team
        break;

      case 3: // Victims information
        campaign.hasVictims = data.hasVictims || false;

        // If campaign has victims, save victim records
        if (data.hasVictims && data.victims && data.victims.length > 0) {
          // Get existing victims to avoid duplicates
          const existingVictims = campaign.victims ?
            await CampaignVictim.find({ _id: { $in: campaign.victims } }).session(session) :
            [];

          const victimIds = [];

          for (const victimData of data.victims) {
            // Check if this is an existing victim being updated
            let victim;

            if (victimData._id) {
              victim = existingVictims.find(v => v._id.toString() === victimData._id);

              if (victim) {
                // Update existing victim
                Object.assign(victim, {
                  ...victimData,
                  updatedAt: new Date()
                });
                await victim.save({ session });
                victimIds.push(victim._id);
                continue;
              }
            }

            // Create new victim
            victim = new CampaignVictim({
              ...victimData,
              campaign: campaign._id,
              addedBy: req.user._id
            });

            await victim.save({ session });
            victimIds.push(victim._id);
          }

          // Delete any victims that were removed
          const removedVictims = existingVictims.filter(
            existing => !victimIds.some(id => id.toString() === existing._id.toString())
          );

          for (const victim of removedVictims) {
            await CampaignVictim.findByIdAndDelete(victim._id, { session });
          }

          campaign.victims = victimIds;
        } else {
          // If hasVictims is false, remove any existing victims
          if (campaign.victims && campaign.victims.length > 0) {
            await CampaignVictim.deleteMany({
              _id: { $in: campaign.victims }
            }, { session });

            campaign.victims = [];
          }
        }

        nextStep = 4; // Move to step 4 after updating victims
        break;

      case 4: // Evidence has been added and campaign is complete
        const evidenceCount = await CampaignEvidence.countDocuments({ campaign: campaign._id });

        if (evidenceCount === 0 && !data.skipEvidenceRequirement) {
          return res.status(400).json({
            success: false,
            message: 'At least one piece of evidence is required to complete campaign creation'
          });
        }

        campaign.creationComplete = true;

        // If publishNow is true, make the campaign active
        if (data.publishNow === true) {
          campaign.status = 'active';
          // Update campaign metrics
          campaign.engagementMetrics = {
            ...campaign.engagementMetrics,
            views: 0,
            supporters: 0
          };
        }

        nextStep = 5; // Mark as complete
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid step number'
        });
    }

    campaign.creationStep = nextStep; // Update the campaign's creation step
    campaign.updatedAt = new Date();
    await campaign.save({ session });

    await session.commitTransaction();

    // Log campaign update
    console.log(`[INFO] Campaign ${id} updated to step ${step} by user ${req.user._id}`);

    // Prepare response with populated data
    const populatedCampaign = await Campaign.findById(id)
      .populate('team')
      .populate('victims')
      .populate('evidence')
      .lean();

    res.json({
      success: true,
      message: `Campaign updated to step ${step}`,
      data: populatedCampaign
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`[ERROR] Campaign step update error: ${error.message}`, {
      error,
      userId: req.user?._id,
      campaignId: req.params.id
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error updating campaign',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};

/**
 * Upload evidence for a campaign - improved for multi-file upload support
 */
export const uploadEvidence = async (req, res) => {
  let tempFiles = [];

  try {
    const { campaignId } = req.params;
    const { title, description, source, evidenceType, relatedVictims = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign ID' });
    }

    // Handle both single file and multiple files
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0 && evidenceType !== 'testimonial') {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. For testimonial evidence, please provide testimonialContent.'
      });
    }

    if (!title || !description || !source || !evidenceType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        requiredFields: ['title', 'description', 'source', 'evidenceType']
      });
    }

    // For testimonial evidence, require content
    if (evidenceType === 'testimonial' && !req.body.testimonialContent) {
      return res.status(400).json({
        success: false,
        message: 'Testimonial evidence requires testimonialContent field'
      });
    }

    // Verify campaign exists and user has permission
    const campaign = await Campaign.findById(campaignId)
      .populate({
        path: 'team',
        select: 'leader coLeader socialMediaCoordinator volunteerCoordinator financeManager additionalMembers'
      });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Verify related victims if provided
    if (relatedVictims.length > 0) {
      const validVictims = await CampaignVictim.find({
        _id: { $in: relatedVictims },
        campaign: campaignId
      }).select('_id');

      if (validVictims.length !== relatedVictims.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more related victims are invalid or do not belong to this campaign'
        });
      }
    }

    // Check permissions (allow team members to upload)
    const isCreator = campaign.createdBy.toString() === req.user._id.toString();
    let isTeamMember = false;

    if (!isCreator && campaign.team) {
      const team = campaign.team;

      // Check if user is in any team role
      isTeamMember = [
        team.leader?.userId,
        team.coLeader?.userId,
        team.socialMediaCoordinator?.userId,
        team.volunteerCoordinator?.userId,
        team.financeManager?.userId
      ].some(id => id && id.toString() === req.user._id.toString());

      // Check additional members if not found in primary roles
      if (!isTeamMember && team.additionalMembers && team.additionalMembers.length > 0) {
        isTeamMember = team.additionalMembers.some(
          member => member.userId && member.userId.toString() === req.user._id.toString() && member.acceptedInvite
        );
      }
    }

    if (!isCreator && !isTeamMember) {
      console.warn(`[WARN] Unauthorized evidence upload attempt: User ${req.user._id} tried to upload evidence for campaign ${campaignId}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload evidence for this campaign'
      });
    }

    // For testimonial evidence, create a record without file upload
    if (evidenceType === 'testimonial') {
      const evidence = new CampaignEvidence({
        campaign: campaignId,
        title,
        description,
        evidenceType: 'testimonial',
        source,
        dateCollected: new Date(),
        testimonialContent: req.body.testimonialContent,
        relatedVictims: relatedVictims.length > 0 ? relatedVictims : undefined,
        addedBy: req.user._id,
        status: 'submitted',
        permissions: {
          isPublic: req.body.isPublic !== false // Default to public unless explicitly set to false
        }
      });

      await evidence.save();

      // Add to campaign's evidence array
      await Campaign.findByIdAndUpdate(campaignId, {
        $push: { evidence: evidence._id },
        $set: {
          updatedAt: new Date(),
          creationStep: Math.max(campaign.creationStep, 4)
        }
      });

      // Queue background validation if enabled
      if (process.env.ENABLE_AI_VALIDATION === 'true') {
        await evidenceQueue.add('validateEvidence', {
          evidenceId: evidence._id,
          campaignId
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Evidence uploaded successfully',
        data: evidence
      });
    }

    // Process file uploads
    for (const file of files) {
      let uploadResult;

      // If using multer disk storage, we'll have file.path
      // If using multer memory storage, we'll have file.buffer
      if (evidenceType === 'photo' || evidenceType === 'image') {
        // Upload to Cloudinary
        if (file.buffer) {
          // Create temporary file from buffer for cloudinary
          const tempFilePath = path.join(
            process.env.TEMP_DIR || '/tmp',
            `${Date.now()}-${file.originalname}`
          );
          await fs.writeFile(tempFilePath, file.buffer);
          uploadResult = await cloudinary.uploader.upload(tempFilePath, {
            folder: `campaign-evidence/${campaignId}`,
            resource_type: 'image'
          });
          tempFiles.push(tempFilePath); // Add to tempFiles for later deletion
        } else {
          uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: `campaign-evidence/${campaignId}`,
            resource_type: 'image'
          });
        }
      } else {
        // Upload to Vercel Blob
        uploadResult = await uploadToBlob(file, {
          directory: `campaign-evidence/${campaignId}`
        });
      }

      // Create evidence record
      const evidence = new CampaignEvidence({
        campaign: campaignId,
        title,
        description,
        evidenceType,
        source,
        dateCollected: new Date(),
        mediaFile: {
          url: uploadResult.secure_url || uploadResult.url,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          dimensions: uploadResult.width && uploadResult.height ? {
            width: uploadResult.width,
            height: uploadResult.height
          } : undefined,
          duration: uploadResult.duration,
          thumbnailUrl: uploadResult.thumbnail_url
        },
        addedBy: req.user._id,
        status: 'submitted',
        permissions: {
          isPublic: req.body.isPublic !== false // Default to public unless explicitly set to false
        }
      });

      await evidence.save();

      // Add to campaign's evidence array
      await Campaign.findByIdAndUpdate(campaignId, {
        $push: { evidence: evidence._id },
        $set: { updatedAt: new Date() }
      });

      // Queue background validation if enabled
      if (process.env.ENABLE_AI_VALIDATION === 'true') {
        await evidenceQueue.add('validateEvidence', {
          evidenceId: evidence._id,
          campaignId
        });
      }
    }

    // If we've reached here, delete any temporary files
    for (const tempFile of tempFiles) {
      await fs.unlink(tempFile);
    }

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: evidence
    });
  } catch (error) {
    console.error('Upload evidence error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading evidence',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get detailed information about a campaign
 */
export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('team')
      .populate('victims')
      .populate('evidence');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all campaigns created by the currently authenticated user
 */
export const getUserCampaigns = async (req, res) => {
  console.log(`[INFO] User ${req.user._id} requested their campaigns`);
  try {
    // Extract query parameters for pagination and filtering
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sort = 'createdAt', 
      order = 'desc',
      search
    } = req.query;

    // Build query filters
    const filter = { createdBy: req.user._id };
    
    // Add status filter if provided
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }
    
    // Add text search if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' }},
        { description: { $regex: search, $options: 'i' }},
        { shortDescription: { $regex: search, $options: 'i' }},
        { tags: { $regex: search, $options: 'i' }}
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const campaigns = await Campaign.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title shortDescription status creationStep creationComplete category coverImage updatedAt startDate endDate')
      .lean();
    
    // Get total count for pagination
    const totalCampaigns = await Campaign.countDocuments(filter);
    
    // Calculate pages
    const totalPages = Math.ceil(totalCampaigns / parseInt(limit));
    
    // Get some basic analytics
    const statusCounts = await Campaign.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Format status counts into an object
    const statusAnalytics = {};
    statusCounts.forEach(item => {
      statusAnalytics[item._id] = item.count;
    });
    
    // Return paginated results with metadata
    res.json({
      success: true,
      data: campaigns,
      pagination: {
        total: totalCampaigns,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      analytics: {
        statusCounts: statusAnalytics,
        total: totalCampaigns
      }
    });
  } catch (error) {
    console.error(`[ERROR] Get user campaigns error: ${error.message}`, { 
      error, 
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving user campaigns',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get all campaigns where user is a team member (but not creator)
 */
export const getTeamMemberCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all campaign teams where user is a member
    const teams = await CampaignTeam.find({
      $or: [
        { 'leader.userId': userId },
        { 'coLeader.userId': userId },
        { 'socialMediaCoordinator.userId': userId },
        { 'volunteerCoordinator.userId': userId },
        { 'financeManager.userId': userId },
        { 'additionalMembers.userId': userId }
      ]
    }).select('campaign');
    
    // Extract campaign IDs
    const campaignIds = teams.map(team => team.campaign);
    
    // Get all these campaigns excluding ones created by the user
    const campaigns = await Campaign.find({
      _id: { $in: campaignIds },
      createdBy: { $ne: userId } // Exclude campaigns where user is the creator
    })
    .select('title shortDescription status category coverImage updatedAt createdBy')
    .populate('createdBy', 'fullName email')
    .lean();
    
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error(`[ERROR] Get team member campaigns error: ${error.message}`, { 
      error, 
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving team member campaigns',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get campaign statistics for the user
 */
export const getUserCampaignStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get basic counts
    const campaignCounts = await Campaign.aggregate([
      { $match: { createdBy: userId } },
      { 
        $group: { 
          _id: null, 
          total: { $sum: 1 },
          active: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "active"] }, 1, 0] 
            } 
          },
          draft: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "draft"] }, 1, 0] 
            } 
          },
          completed: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0] 
            } 
          }
        } 
      }
    ]);
    
    // Get engagement metrics across all campaigns
    const engagementStats = await Campaign.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$engagementMetrics.views" },
          totalShares: { $sum: "$engagementMetrics.shares" },
          totalLikes: { $sum: "$engagementMetrics.likes" },
          totalComments: { $sum: "$engagementMetrics.comments" },
          totalSupporters: { $sum: "$engagementMetrics.supporters" },
          totalSignatures: { $sum: "$engagementMetrics.signatureCount" }
        }
      }
    ]);
    
    // Get most popular campaigns
    const popularCampaigns = await Campaign.find({ createdBy: userId })
      .sort({ "engagementMetrics.views": -1 })
      .limit(5)
      .select('title shortDescription engagementMetrics status')
      .lean();
    
    // Get recent team members across all campaigns
    const teamMembers = await CampaignTeam.aggregate([
      {
        $match: {
          "leader.userId": userId
        }
      },
      {
        $project: {
          campaign: 1,
          members: {
            $concatArrays: [
              [{ role: "coLeader", info: "$coLeader" }],
              [{ role: "socialMediaCoordinator", info: "$socialMediaCoordinator" }],
              [{ role: "volunteerCoordinator", info: "$volunteerCoordinator" }],
              [{ role: "financeManager", info: "$financeManager" }],
              {
                $map: {
                  input: "$additionalMembers",
                  as: "member",
                  in: {
                    role: { $ifNull: ["$$member.customRoleTitle", "$$member.role"] },
                    info: "$$member"
                  }
                }
              }
            ]
          }
        }
      },
      { $unwind: "$members" },
      { $match: { "members.info.userId": { $exists: true } } },
      { $sort: { "members.info.invitedAt": -1 } },
      { $limit: 10 },
      {
        $project: {
          campaign: 1,
          role: "$members.role",
          userId: "$members.info.userId",
          name: "$members.info.name",
          acceptedInvite: "$members.info.acceptedInvite",
          invitedAt: "$members.info.invitedAt"
        }
      }
    ]);
    
    // Construct the response
    const stats = {
      campaigns: campaignCounts.length > 0 ? campaignCounts[0] : { total: 0, active: 0, draft: 0, completed: 0 },
      engagement: engagementStats.length > 0 ? engagementStats[0] : { 
        totalViews: 0, totalShares: 0, totalLikes: 0, 
        totalComments: 0, totalSupporters: 0, totalSignatures: 0 
      },
      popularCampaigns,
      recentTeamMembers: teamMembers
    };
    
    // Remove _id from the stats objects
    if (stats.campaigns) delete stats.campaigns._id;
    if (stats.engagement) delete stats.engagement._id;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(`[ERROR] Get user campaign stats error: ${error.message}`, { 
      error, 
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving campaign statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};