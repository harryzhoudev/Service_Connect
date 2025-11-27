const Booking = require('../models/Booking');
const Service = require('../models/Service');

//create booking
async function createBooking(req, res) {
  try {
    const { date, notes } = req.body;
    const serviceId = req.params.id || req.params.serviceId;

    //load service
    const service = await Service.findById(serviceId);

    if (!service) {
      return res
        .status(404)
        .json({ message: 'Service not found or unavailable' });
    }

    //ensure user is not booking their own service
    if (service.providerId.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: 'You cannot book your own service' });
    }

    const booking = await Booking.create({
      service: service._id,
      customer: req.user.id,
      provider: service.providerId,
      date,
      notes,
      status: 'pending',
      priceAtTime: service.price,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//get bookings for user (as customer and provider)
async function getUserBookings(req, res) {
  try {
    const userId = req.user.id;

    const asCustomer = await Booking.find({ customer: userId })
      .populate('service')
      .populate('customer', '-password')
      .populate('provider', '-password')
      .sort({ createdAt: -1 });

    const asProvider = await Booking.find({ provider: userId })
      .populate('service')
      .populate('customer', '-password')
      .populate('provider', '-password')
      .sort({ createdAt: -1 });

    res.json({
      summary: {
        userId,
        asCustomerCount: asCustomer.length,
        asProviderCount: asProvider.length,
      },
      asCustomer,
      asProvider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//get list of booking when viewed from the specified service page
async function getServiceBookings(req, res) {
  try {
    const userId = req.user.id;
    const serviceId = req.params.id || req.params.serviceId;

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Only provider of this service can see its bookings
    if (service.providerId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view bookings for this service' });
    }

    const bookings = await Booking.find({ service: serviceId })
      .populate('service')
      .populate('customer', '-password')
      .populate('provider', '-password')
      .sort({ createdAt: -1 });

    res.json({
      serviceId,
      providerId: userId,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get booking by ID
async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('customer', '-password')
      .populate('provider', '-password');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateBooking(req, res) {
  try {
    const bookingId = req.params.id || req.params.bookingId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { action, date, notes } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('service')
      .populate('customer', '-password')
      .populate('provider', '-password');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isCustomer = booking.customer._id.toString() === userId;
    const isProvider = booking.provider._id.toString() === userId;
    const isAdmin = userRole === 'admin' || userRole === 'superuser';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this booking' });
    }

    const validActions = ['accept', 'reject', 'complete', 'cancel'];

    //if action exists and action is not included in the array of validActions
    if (action && !validActions.includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Provider can accept, reject, and complete bookings
    // provider accept action
    if (isProvider || isAdmin) {
      if (action === 'accept') {
        if (booking.status !== 'pending') {
          return res
            .status(400)
            .json({ message: 'Only pending bookings can be accepted' });
        }
        booking.status = 'accepted';
      }
      // provider reject action
      if (action === 'reject') {
        if (booking.status !== 'pending') {
          return res
            .status(400)
            .json({ message: 'Only pending bookings can be rejected' });
        }
        booking.status = 'rejected';
      }
      // provider complete action
      if (action === 'complete') {
        if (booking.status !== 'accepted') {
          return res
            .status(400)
            .json({ message: 'Only accepted bookings can be completed' });
        }
        booking.status = 'completed';
      }
    }

    // Customer can cancel bookings
    if (isCustomer || isAdmin) {
      if (action === 'cancel') {
        //cancel only if it's pending or accepted
        if (!['pending', 'accepted'].includes(booking.status)) {
          return res.status(400).json({
            message: 'Only pending or accepted bookings can be cancelled',
          });
        }
        booking.status = 'cancelled';
      }
    }

    //Customer editing booking details only when pending
    if (isCustomer && booking.status === 'pending') {
      if (date) booking.date = date;
      if (notes !== undefined) booking.notes = notes;
    }

    await booking.save();

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: error.message });
  }
}

//Delete booking
async function deleteBooking(req, res) {
  try {
    const bookingId = req.params.id || req.params.bookingId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isCustomer = booking.customer.toString() === userId;
    const isProvider = booking.provider.toString() === userId;
    const isAdmin = userRole === 'admin' || userRole === 'superuser';

    // Only someone involved in the booking (or admin) can delete it
    if (!isCustomer && !isProvider && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this booking' });
    }

    if (
      !['cancelled', 'rejected', 'completed'].includes(booking.status) &&
      !isAdmin
    ) {
      return res.status(400).json({
        message:
          'Only cancelled, rejected, or completed bookings can be deleted (unless admin)',
      });
    }

    await booking.deleteOne();

    return res.json({
      message: 'Booking deleted successfully',
      bookingId: bookingId,
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getUserBookings,
  getServiceBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
};
