import api from './api';

const createBooking = async (bookingData) => (await api.post('/bookings', bookingData)).data;
const getBookings = async (params) => (await api.get('/bookings', { params })).data;
const getMyBookings = async (params) => (await api.get('/bookings/mine', { params })).data;
const getBookingById = async (bookingId) => (await api.get(`/bookings/${bookingId}`)).data;
const updateBooking = async (bookingId, bookingData) => (
  await api.put(`/bookings/${bookingId}`, bookingData)
).data;
const deleteBooking = async (bookingId) => (await api.delete(`/bookings/${bookingId}`)).data;
const checkoutBooking = async (bookingId) => (
  await api.patch(`/bookings/${bookingId}/checkout`)
).data;

export default {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  checkoutBooking,
};
