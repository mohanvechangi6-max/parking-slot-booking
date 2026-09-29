import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import AdminSlots from './pages/AdminSlots';
import Login from './pages/Login';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import MyBookings from './pages/MyBookings';
import Register from './pages/Register';
import SlotDetail from './pages/SlotDetail';
import Slots from './pages/Slots';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-account" element={<Register />} />
          <Route path="/slots" element={<Slots />} />
          <Route path="/slots/:id" element={<SlotDetail />} />

          <Route element={<PrivateRoute />}>
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          <Route element={<PrivateRoute adminOnly />}>
            <Route path="/admin/slots" element={<AdminSlots />} />
          </Route>

          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/slots" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
