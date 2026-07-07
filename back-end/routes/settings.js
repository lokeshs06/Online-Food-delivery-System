const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, authorize } = require('../middleware/auth');

// In-memory cache for fast lookup in middleware
let globalSettingsCache = null;

// Helper to fetch and cache settings
const getSettings = async () => {
  if (globalSettingsCache) return globalSettingsCache;
  const settings = await Setting.find();
  const settingsMap = {};
  settings.forEach(s => {
    settingsMap[s.key] = s.value;
  });
  globalSettingsCache = settingsMap;
  return settingsMap;
};

// Exported so server.js can use the cache getter
router.getGlobalSettings = getSettings;

// @route   GET /api/settings
// @desc    Get all global settings (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/settings
// @desc    Update global settings
// @access  Private/Admin
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body; // e.g., { maintenance: { maintenanceMode: true }, ... }
    const adminId = req.user.id;

    for (const [key, value] of Object.entries(updates)) {
      const existingSetting = await Setting.findOne({ key });
      
      console.log(`[AUDIT LOG] ${new Date().toISOString()} - Admin user ${adminId} updated setting [${key}] from ${JSON.stringify(existingSetting ? existingSetting.value : null)} to ${JSON.stringify(value)}`);

      await Setting.findOneAndUpdate(
        { key },
        { value, lastUpdatedBy: adminId },
        { upsert: true, new: true }
      );
    }

    // Invalidate cache
    globalSettingsCache = null;
    
    // Pre-warm cache
    const newSettings = await getSettings();

    res.json({ success: true, data: newSettings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

module.exports = router;
