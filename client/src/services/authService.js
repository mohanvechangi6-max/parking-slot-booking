import api from './api';

const register = async (userData) => (await api.post('/auth/register', userData)).data;
const login = async (credentials) => (await api.post('/auth/login', credentials)).data;
const getMe = async () => (await api.get('/auth/me')).data;
const requestPasswordReset = async (data) => (await api.post('/auth/forgot-password', data)).data;
const resetPassword = async (data) => (await api.post('/auth/reset-password', data)).data;

export default { register, login, getMe, requestPasswordReset, resetPassword };
