const express = require('express');
const {
  checkoutBooking,
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  getMyBookings,
  updateBooking,
} = require('../controllers/bookingController');
const { adminOnly, protect } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', protect, getMyBookings);
router.get('/', protect, adminOnly, getBookings);
router.post('/', protect, createBooking);
router.patch('/:id/checkout', protect, checkoutBooking);
router.route('/:id')
  .get(protect, getBookingById)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

module.exports = router;
