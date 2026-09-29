const express = require('express');
const {
  createSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotById,
  getSlots,
  getSlotStats,
  updateSlot,
} = require('../controllers/slotController');
const { adminOnly, protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, createSlot)
  .get(getSlots);

router.get('/available', getAvailableSlots);
router.get('/stats', getSlotStats);

router.route('/:id')
  .get(getSlotById)
  .put(protect, adminOnly, updateSlot)
  .delete(protect, adminOnly, deleteSlot);

module.exports = router;
