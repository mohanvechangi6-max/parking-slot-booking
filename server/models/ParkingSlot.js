const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required.'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required.'],
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required.'],
      min: [0, 'Price per hour cannot be negative.'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.ParkingSlot || mongoose.model('ParkingSlot', parkingSlotSchema);
