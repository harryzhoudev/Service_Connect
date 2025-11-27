const User = require('../models/User');

// GET /api/users/me
async function getMe(req, res) {
  try {
    // req.userDoc set by auth middleware
    const user = req.userDoc;
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/users/me
async function updateMe(req, res) {
  try {
    const userId = req.user.id;
    const payload = req.body || {};

    // Only allow updating safe fields
    const allowed = ['name', 'phone'];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        updates[key] = payload[key];
      }
    }

    // prevent role changes via this endpoint
    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: '-password',
    });

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getMe, updateMe };