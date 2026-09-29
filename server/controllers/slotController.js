const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');

const isMissing = (value) => value === undefined || value === null || value === '';

const handleSlotError = (error, res) => {
  if (error.name === 'ValidationError' || error.code === 11000) {
    const message = error.code === 11000
      ? 'A slot with that slot number already exists.'
      : error.message;
    return res.status(400).json({ success: false, message });
  }

  return res.status(500).json({ success: false, message: 'Server error.' });
};

const createSlot = async (req, res) => {
  try {
    const { slotNumber, location, pricePerHour, isActive } = req.body;

    if (isMissing(slotNumber) || isMissing(location) || isMissing(pricePerHour)) {
      return res.status(400).json({
        success: false,
        message: 'Slot number, location, and price per hour are required.',
      });
    }

    const slot = await ParkingSlot.create({
      slotNumber: typeof slotNumber === 'string' ? slotNumber.trim() : slotNumber,
      location: typeof location === 'string' ? location.trim() : location,
      pricePerHour,
      isActive,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, slot });
  } catch (error) {
    return handleSlotError(error, res);
  }
};

const getSlots = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = {};

    if (req.query.location) {
      filter.location = { $regex: req.query.location.trim(), $options: 'i' };
    }

    if (req.query.isActive === 'true' || req.query.isActive === 'false') {
      filter.isActive = req.query.isActive === 'true';
    }

    const [slots, total] = await Promise.all([
      ParkingSlot.find(filter)
        .sort({ slotNumber: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ParkingSlot.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: slots.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      slots,
    });
  } catch (error) {
    return handleSlotError(error, res);
  }
};

const getSlotById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    return res.status(200).json({ success: true, slot });
  } catch (error) {
    return handleSlotError(error, res);
  }
};

const updateSlot = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    const allowedFields = ['slotNumber', 'location', 'pricePerHour', 'isActive'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        slot[field] = typeof req.body[field] === 'string'
          ? req.body[field].trim()
          : req.body[field];
      }
    });

    await slot.save();
    return res.status(200).json({ success: true, slot });
  } catch (error) {
    return handleSlotError(error, res);
  }
};

const deleteSlot = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    const slot = await ParkingSlot.findByIdAndDelete(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    return res.status(200).json({ success: true, message: 'Parking slot deleted.' });
  } catch (error) {
    return handleSlotError(error, res);
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const startTime = new Date(req.query.from);
    const endTime = new Date(req.query.to);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'Valid from and to times are required, and to must be after from.',
      });
    }

    const occupiedSlotIds = await Booking.distinct('slot', {
      status: { $in: ['pending', 'confirmed'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    const slots = await ParkingSlot.find({
      isActive: true,
      _id: { $nin: occupiedSlotIds },
    }).sort({ slotNumber: 1 });

    return res.status(200).json({ success: true, count: slots.length, slots });
  } catch (error) {
    return handleSlotError(error, res);
  }
};

const getSlotStats = async (req, res) => {
  try {
    const now = new Date();
    const [totalSlots, activeSlots, occupiedSlotIds, topBookedSlots] = await Promise.all([
      ParkingSlot.countDocuments(),
      ParkingSlot.countDocuments({ isActive: true }),
      Booking.distinct('slot', {
        status: { $in: ['pending', 'confirmed'] },
        startTime: { $lte: now },
        endTime: { $gt: now },
      }),
      Booking.aggregate([
        { $match: { status: { $in: ['pending', 'confirmed', 'completed'] } } },
        { $group: { _id: '$slot', bookingCount: { $sum: 1 } } },
        { $sort: { bookingCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'parkingslots',
            localField: '_id',
            foreignField: '_id',
            as: 'slot',
          },
        },
        { $unwind: { path: '$slot', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            bookingCount: 1,
            slot: 1,
          },
        },
      ]),
    ]);

    const occupancyRate = activeSlots === 0
      ? 0
      : Number(((occupiedSlotIds.length / activeSlots) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      totalSlots,
      activeSlots,
      currentlyOccupied: occupiedSlotIds.length,
      occupancyRate,
      topBookedSlots,
    });
  } catch (error) {
    return handleSlotError(error, res);
  }
};

module.exports = {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotStats,
};
