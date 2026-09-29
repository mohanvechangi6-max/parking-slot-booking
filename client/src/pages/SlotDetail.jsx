import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import slotService from '../services/slotService';

const toInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

function SlotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [slot, setSlot] = useState(null);
  const [startTime, setStartTime] = useState(() => toInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [endTime, setEndTime] = useState(() => toInputValue(new Date(Date.now() + 2 * 60 * 60 * 1000)));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const loadSlot = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await slotService.getSlotById(id);
        setSlot(data.slot);
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load this parking slot.'));
      } finally {
        setLoading(false);
      }
    };

    loadSlot();
  }, [id]);

  const estimatedHours = useMemo(() => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return 0;
    }
    return (end - start) / (60 * 60 * 1000);
  }, [startTime, endTime]);

  const estimatedFee = slot ? estimatedHours * Number(slot.pricePerHour) : 0;

  const handleBooking = async (event) => {
    event.preventDefault();
    setError('');
    setConfirmation(null);

    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (!estimatedHours) {
      setError('The end time must be after the start time.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await bookingService.createBooking({
        slot: id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      setConfirmation(data.booking);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'This slot could not be booked. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-4xl px-6 py-16 text-center text-slate-500">Loading slot details...</main>;
  }

  if (!slot) {
    return <main className="mx-auto max-w-4xl px-6 py-16"><div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || 'Parking slot not found.'}</div></main>;
  }

  return (
    <main className="time-page">
      <div className="time-page-inner">
        <Link className="time-back-link" to="/slots"><span aria-hidden="true">&larr;</span> All parking spots</Link>
        <header className="time-page-heading">
          <div>
            <p className="time-eyebrow">Your reservation &middot; Step 1 of 2</p>
            <h1>Choose your <em>time.</em></h1>
            <p>Set your arrival and departure. We&apos;ll take care of the rest.</p>
          </div>
          <div className="time-progress" aria-label="Step 1 of 2: Choose time">
            <span className="time-progress-active">01 <small>Choose time</small></span>
            <i />
            <span>02 <small>Confirm</small></span>
          </div>
        </header>

        <div className="time-layout">
          <section className="time-form-card">
            <div className="time-card-heading">
              <span className="time-heading-icon" aria-hidden="true">&#8599;</span>
              <div><p>Parking period</p><h2>When do you need the spot?</h2></div>
            </div>
            <form className="time-form" onSubmit={handleBooking}>
              <label className="time-field">
                <span><b>01</b> Arrival</span>
                <input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
              </label>
              <div className="time-field-connector" aria-hidden="true"><span /></div>
              <label className="time-field">
                <span><b>02</b> Departure</span>
                <input type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
              </label>
              <div className="time-note"><span aria-hidden="true">&#10033;</span> You can adjust your reservation later from My bookings.</div>
              {error && <div role="alert" className="time-error">{error}</div>}
              {confirmation ? (
                <div className="time-confirmation">
                  <div><strong>You're all set.</strong><span>Final fee: ${Number(confirmation.totalFee).toFixed(2)}</span></div>
                  <Link to="/my-bookings">View my bookings <span aria-hidden="true">&#8599;</span></Link>
                </div>
              ) : (
                <button className="time-submit" type="submit" disabled={submitting || !slot.isActive}>
                  <span>{submitting ? 'Confirming your spot...' : user ? 'Continue to confirmation' : 'Log in to reserve'}</span><b aria-hidden="true">&#8599;</b>
                </button>
              )}
            </form>
          </section>

          <aside className="time-summary-card">
            <div className="time-summary-top"><span>YOUR PARKING SPOT</span><span className={`time-status ${slot.isActive ? '' : 'time-status-inactive'}`}><i />{slot.isActive ? 'Available' : 'Unavailable'}</span></div>
            <div className="time-spot-art time-map-art" aria-label={`Map preview showing selected parking space ${slot.slotNumber}`}>
              <svg viewBox="0 0 420 220" role="img" aria-label={`Map around ${slot.location}`}>
                <path className="map-water" d="M-20 174c70-32 93-15 147-57 45-35 77-27 117-8 44 21 93 18 196-39v170H-20Z" />
                <path className="map-road minor" d="M-10 55 130 90l112-22 180 35M20 205 110 20m65 215 57-213m90 215 28-215M-4 130l423 2M-8 94l420 80M45 0l115 220m88-220 90 220" />
                <path className="map-road major" d="M-10 190 120 133l93-48 221-51M45-12l106 88 83 45 195 43" />
                <path className="map-route" d="M91 151c44-14 54-54 109-54s68 38 127 20" />
                <circle className="map-origin" cx="91" cy="151" r="9" />
                <circle className="map-origin-ring" cx="91" cy="151" r="17" />
                <g className="map-destination" transform="translate(327 117)"><circle r="17"/><text textAnchor="middle" y="5">P</text></g>
                <text className="map-label" x="27" y="37">NORTH AVE</text>
                <text className="map-label" x="286" y="199">{slot.slotNumber}</text>
              </svg>
              <div className="time-map-label"><span><i /> Selected spot</span><strong>{slot.location}</strong></div>
            </div>
            <div className="time-spot-name"><div><h2>{slot.slotNumber}</h2><p>{slot.location}</p></div><span className="time-spot-arrow" aria-hidden="true">&#8599;</span></div>
            <div className="time-summary-divider" />
            <div className="time-summary-detail"><span>Duration</span><strong>{estimatedHours ? `${estimatedHours.toFixed(2)} hrs` : 'Set your time'}</strong></div>
            <div className="time-summary-detail"><span>Rate</span><strong>${Number(slot.pricePerHour).toFixed(2)} <small>/ hr</small></strong></div>
            <div className="time-total"><span>Estimated total</span><strong>${estimatedFee.toFixed(2)}</strong></div>
            <p className="time-summary-foot">Final amount is calculated from your actual parking duration.</p>
          </aside>
        </div>
        <footer className="time-footer"><span>ParkBay</span><span>Parking made simple.</span><span>Need help? <a href="mailto:support@parkbay.com">Contact us</a></span></footer>
      </div>
    </main>
  );
}

export default SlotDetail;
