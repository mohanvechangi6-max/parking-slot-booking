import { useEffect, useState } from 'react';
import bookingService from '../services/bookingService';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeAction, setActiveAction] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await bookingService.getMyBookings({ page: 1, limit: 50 });
        setBookings(data.bookings || []);
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load your bookings.'));
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const updateBookingInList = (updatedBooking) => {
    setBookings((currentBookings) => currentBookings.map((booking) => (
      booking._id === updatedBooking._id ? { ...booking, ...updatedBooking } : booking
    )));
  };

  const handleCancel = async (bookingId) => {
    setActionError('');
    setActiveAction(bookingId);
    try {
      const data = await bookingService.updateBooking(bookingId, { status: 'cancelled' });
      updateBookingInList(data.booking);
    } catch (requestError) {
      setActionError(getErrorMessage(requestError, 'Unable to cancel this booking.'));
    } finally {
      setActiveAction('');
    }
  };

  const handleCheckout = async (bookingId) => {
    setActionError('');
    setActiveAction(bookingId);
    try {
      const data = await bookingService.checkoutBooking(bookingId);
      updateBookingInList(data.booking);
    } catch (requestError) {
      setActionError(getErrorMessage(requestError, 'Unable to check out this booking.'));
    } finally {
      setActiveAction('');
    }
  };

  return (
    <main className="booking-page">
      <div className="booking-shell">
        <div className="booking-video-wrap">
          <video className="booking-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src="/my-bookings-city.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="booking-overlay" />

        <div className="booking-content">
          <header className="booking-header">
            <div>
              <p className="booking-kicker">Your activity</p>
              <h1>My bookings</h1>
            </div>
            <div className="booking-header-badge">Live garage</div>
          </header>

          <div className="booking-summary">
            <div className="booking-stat">
              <span>Total</span>
              <strong>{bookings.length}</strong>
            </div>
            <div className="booking-stat">
              <span>Active</span>
              <strong>{bookings.filter((booking) => booking.status === 'confirmed' || booking.status === 'pending').length}</strong>
            </div>
            <div className="booking-stat">
              <span>Value</span>
              <strong>${bookings.reduce((sum, booking) => sum + Number(booking.totalFee || 0), 0).toFixed(2)}</strong>
            </div>
          </div>

          {error && <div role="alert" className="booking-alert booking-alert-error">{error}</div>}
          {actionError && <div role="alert" className="booking-alert booking-alert-error">{actionError}</div>}

          {loading ? (
            <div className="booking-empty booking-empty-loading">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="booking-empty">
              <h2>No bookings yet</h2>
              <p>Your parking reservations will appear here.</p>
            </div>
          ) : (
            <div className="booking-list">
              {bookings.map((booking) => {
                const canManage = booking.status === 'pending' || booking.status === 'confirmed';
                const isBusy = activeAction === booking._id;

                return (
                  <article className="booking-card" key={booking._id}>
                    <div className="booking-card-row">
                      <div>
                        <div className="booking-card-title-wrap">
                          <h2>{booking.slot?.slotNumber || 'Parking slot'}</h2>
                          <span className={`booking-status ${statusStyles[booking.status] || statusStyles.cancelled}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="booking-slot-location">{booking.slot?.location || 'Location unavailable'}</p>
                      </div>
                      <p className="booking-price">${Number(booking.totalFee).toFixed(2)}</p>
                    </div>

                    <dl className="booking-meta">
                      <div>
                        <dt>Starts</dt>
                        <dd>{formatDate(booking.startTime)}</dd>
                      </div>
                      <div>
                        <dt>Ends</dt>
                        <dd>{formatDate(booking.endTime)}</dd>
                      </div>
                    </dl>

                    {canManage && (
                      <div className="booking-actions">
                        <button className="booking-button booking-button-primary" type="button" disabled={isBusy} onClick={() => handleCheckout(booking._id)}>
                          {isBusy ? 'Updating...' : 'Check out'}
                        </button>
                        <button className="booking-button booking-button-ghost" type="button" disabled={isBusy} onClick={() => handleCancel(booking._id)}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default MyBookings;
