import express from 'express';
import {
  createCampaign,
  updateCampaignStep,
  uploadEvidence,
  getCampaign,
  getUserCampaigns,
  getTeamMemberCampaigns,
  getUserCampaignStats
} from '../controller/Campaign.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Campaign Creation & Management ---

// POST /api/campaigns - Create a new campaign (Step 1)
router.post('/', authMiddleware, createCampaign);

// PUT /api/campaigns/:id/step - Update campaign step-by-step
router.put('/:id/step', authMiddleware, updateCampaignStep);

// --- User Campaign Management ---
// IMPORTANT: Put specific routes BEFORE parameter routes to ensure proper matching

// GET /api/campaigns/my-campaigns - Get all campaigns created by the current user
router.get('/my-campaigns', authMiddleware, getUserCampaigns);

// GET /api/campaigns/team-campaigns - Get campaigns where user is a team member
router.get('/team-campaigns', authMiddleware, getTeamMemberCampaigns);

// GET /api/campaigns/campaign-stats - Get user's campaign statistics
router.get('/campaign-stats', authMiddleware, getUserCampaignStats);

// --- Evidence Management ---

// POST /api/campaigns/:id/evidence - Upload evidence for a campaign
router.post(
  '/:id/evidence',
  authMiddleware,
  uploadEvidence
);

// --- Generic/Parameter routes MUST come AFTER specific routes ---

// GET /api/campaigns/:id - Get a specific campaign's details
router.get('/:id', getCampaign);

// --- Other Routes ---

export default router;