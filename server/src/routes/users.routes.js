const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// /api/users
router.get('/me', requireAuth, requireRole(['user']), (req, res) => {
  res.json({ user: req.userDoc });
});

module.exports = router;
