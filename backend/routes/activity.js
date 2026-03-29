/* ════════════════════════════════════════════
   ARCUS — Activity Route
   GET /api/activity
   ════════════════════════════════════════════ */

const router = require('express').Router();
const { activity } = require('../data/store');

router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  res.json({ success: true, data: activity.slice(0, limit) });
});

module.exports = router;
