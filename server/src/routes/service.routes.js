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
router.get('/', requireAuth, requireRole(['user']), getServices);
router.get('/:id', requireAuth, requireRole(['user']), getServiceById);

// /api/services/:id/booking
// endpoint for booking seeing all the booking of the service while in service detail page. Only users that has posted (provider) the service can view all the booking. otherwise 403 status.
router.get(
  '/:id/booking',
  requireAuth,
  requireRole(['user']),
  getServiceBookings
);
// /api/services/:id/booking
// endpoint for booking a service from the service details page
router.post('/:id/booking', requireAuth, requireRole(['user']), createBooking);

router.post('/', requireAuth, requireRole(['user']), createService);
router.put('/:id', requireAuth, requireRole(['user']), updateService);
router.delete('/:id', requireAuth, requireRole(['user']), deleteService);

module.exports = router;
