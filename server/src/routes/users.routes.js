const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/user.controller');

const router = Router();

// /api/users
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);

module.exports = router;
