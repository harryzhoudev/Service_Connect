const express = require('express');
const router = express.Router();

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/service.controller.js');

const {
  getServiceBookings,
  createBooking,
} = require('../controllers/booking.controller');

const { requireAuth, requireRole } = require('../middleware/auth');

// /api/services
// viewing services: make listing and single service public (no auth required)
router.get('/', getServices);
router.get('/:id', getServiceById);

// /api/services/:id/booking
// viewing bookings for a service: provider (owner) or superuser/admin
router.get('/:id/booking', requireAuth, requireRole(['provider']), getServiceBookings);
// booking a service: only customers (users) can create bookings
router.post('/:id/booking', requireAuth, requireRole(['user']), createBooking);

// service management: only providers (and superuser/admin via middleware bypass) can create/update/delete
router.post('/', requireAuth, requireRole(['provider']), createService);
router.put('/:id', requireAuth, requireRole(['provider']), updateService);
router.delete('/:id', requireAuth, requireRole(['provider']), deleteService);

module.exports = router;
