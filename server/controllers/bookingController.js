const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');

const activeStatuses = ['pending', 'confirmed'];
const hourInMilliseconds = 60 * 60 * 1000;

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const getDateRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (!isValidDate(start) || !isValidDate(end) || end <= start) {
    return null;
  }

  return { start, end };
};

const handleBookingError = (error, res) => {
  if (error.name === 'ValidationError' || error.name === 'CastError' || error.code === 11000) {
    return res.status(400).json({ success: false, message: error.message });
  }

  return res.status(500).json({ success: false, message: 'Server error.' });
};

const hasOverlap = async (slotId, startTime, endTime, excludeBookingId) => {
  const filter = {
    slot: slotId,
    status: { $in: activeStatuses },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  return Boolean(await Booking.exists(filter));
};

const isOwnerOrAdmin = (booking, user) => {
  if (user.role === 'admin') {
    return true;
  }

  const bookingUserId = booking.user && (booking.user._id || booking.user);
  return bookingUserId && bookingUserId.toString() === user._id.toString();
};

const createBooking = async (req, res) => {
  try {
    const { slot: slotId, startTime, endTime } = req.body;
    const dateRange = getDateRange(startTime, endTime);

    if (!slotId || !dateRange) {
      return res.status(400).json({
        success: false,
        message: 'A valid slot, start time, and end time are required.',
      });
    }

    if (!mongoose.isValidObjectId(slotId)) {
      return res.status(400).json({ success: false, message: 'Invalid parking slot ID.' });
    }

    const slot = await ParkingSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    if (!slot.isActive) {
      return res.status(400).json({ success: false, message: 'Parking slot is not active.' });
    }

    if (await hasOverlap(slot._id, dateRange.start, dateRange.end)) {
      return res.status(400).json({
        success: false,
        message: 'Parking slot is already booked for that time window.',
      });
    }

    const hours = (dateRange.end - dateRange.start) / hourInMilliseconds;
    const booking = await Booking.create({
      user: req.user._id,
      slot: slot._id,
      startTime: dateRange.start,
      endTime: dateRange.end,
      status: 'confirmed',
      totalFee: hours * slot.pricePerHour,
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    return handleBookingError(error, res);
  }
};

const getBookings = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = {};

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email role')
        .populate('slot', 'slotNumber location pricePerHour')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    return handleBookingError(error, res);
  }
};

const getMyBookings = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = { user: req.user._id };

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('slot', 'slotNumber location pricePerHour')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    return handleBookingError(error, res);
  }
};

const getBookingById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('slot', 'slotNumber location pricePerHour');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (!isOwnerOrAdmin(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'You cannot access this booking.' });
    }

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return handleBookingError(error, res);
  }
};

const updateBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (!isOwnerOrAdmin(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'You cannot update this booking.' });
    }

    const timesChanged = req.body.startTime !== undefined || req.body.endTime !== undefined;

    if (timesChanged) {
      const dateRange = getDateRange(
        req.body.startTime === undefined ? booking.startTime : req.body.startTime,
        req.body.endTime === undefined ? booking.endTime : req.body.endTime,
      );

      if (!dateRange) {
        return res.status(400).json({
          success: false,
          message: 'A valid start time and end time are required.',
        });
      }

      if (await hasOverlap(booking.slot, dateRange.start, dateRange.end, booking._id)) {
        return res.status(400).json({
          success: false,
          message: 'Parking slot is already booked for that time window.',
        });
      }

      booking.startTime = dateRange.start;
      booking.endTime = dateRange.end;
      const slot = await ParkingSlot.findById(booking.slot);
      if (!slot) {
        return res.status(404).json({ success: false, message: 'Parking slot not found.' });
      }
      booking.totalFee = ((dateRange.end - dateRange.start) / hourInMilliseconds) * slot.pricePerHour;
    }

    if (req.body.status !== undefined) {
      booking.status = req.body.status;
    }

    await booking.save();
    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return handleBookingError(error, res);
  }
};

const deleteBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (!isOwnerOrAdmin(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'You cannot delete this booking.' });
    }

    await booking.deleteOne();
    return res.status(200).json({ success: true, message: 'Booking deleted.' });
  } catch (error) {
    return handleBookingError(error, res);
  }
};

const checkoutBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (!isOwnerOrAdmin(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'You cannot check out this booking.' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking cannot be checked out.' });
    }

    const checkoutTime = new Date();
    if (checkoutTime <= booking.startTime) {
      return res.status(400).json({ success: false, message: 'Checkout cannot happen before the booking starts.' });
    }

    const slot = await ParkingSlot.findById(booking.slot);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    booking.totalFee = ((checkoutTime - booking.startTime) / hourInMilliseconds) * slot.pricePerHour;
    booking.status = 'completed';
    await booking.save();

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return handleBookingError(error, res);
  }
};

module.exports = {
  hasOverlap,
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  checkoutBooking,
};
