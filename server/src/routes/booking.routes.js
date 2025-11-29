const express = require('express');
const router = express.Router();

const {
  getUserBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/booking.controller');

const { requireAuth, requireRole } = require('../middleware/auth');

router.get(
  '/',
  requireAuth,
  requireRole(['provider', 'user']),
  getUserBookings
);
router.get(
  '/:id',
  requireAuth,
  requireRole(['provider', 'user']),
  getBookingById
);
router.put(
  '/:id',
  requireAuth,
  requireRole(['provider', 'user']),
  updateBooking
);
router.delete(
  '/:id',
  requireAuth,
  requireRole(['provider', 'user']),
  deleteBooking
);

module.exports = router;
