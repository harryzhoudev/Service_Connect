const express = require('express');
const router = express.Router();

const {
  getUserBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/booking.controller');

const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole(['user']), getUserBookings);
router.get('/:id', requireAuth, requireRole(['user']), getBookingById);
router.put('/:id', requireAuth, requireRole(['user']), updateBooking);
router.delete('/:id', requireAuth, deleteBooking);

module.exports = router;
