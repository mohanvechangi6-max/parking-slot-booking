import api from './api';

const createSlot = async (slotData) => (await api.post('/slots', slotData)).data;
const getSlots = async (params) => (await api.get('/slots', { params })).data;
const getSlotById = async (slotId) => (await api.get(`/slots/${slotId}`)).data;
const updateSlot = async (slotId, slotData) => (await api.put(`/slots/${slotId}`, slotData)).data;
const deleteSlot = async (slotId) => (await api.delete(`/slots/${slotId}`)).data;
const getAvailableSlots = async (from, to) => (
  await api.get('/slots/available', { params: { from, to } })
).data;
const getSlotStats = async () => (await api.get('/slots/stats')).data;

export default {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotStats,
};
