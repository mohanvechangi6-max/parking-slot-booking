import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import slotService from '../services/slotService';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

function Slots() {
  const [slots, setSlots] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filtered, setFiltered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (filtered) {
      return;
    }

    const loadSlots = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await slotService.getSlots({ page, limit: 9 });
        setSlots(data.slots || []);
        setPages(data.pages || 0);
        setTotal(data.total || 0);
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load parking slots.'));
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [page, filtered]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setError('');

    if (!from || !to) {
      setError('Choose both a start and end time to search availability.');
      return;
    }

    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError('The end time must be after the start time.');
      return;
    }

    setSearching(true);
    try {
      const data = await slotService.getAvailableSlots(start.toISOString(), end.toISOString());
      setSlots(data.slots || []);
      setTotal(data.count || 0);
      setPages(0);
      setFiltered(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to search slot availability.'));
    } finally {
      setSearching(false);
    }
  };

  const clearFilter = () => {
    setFrom('');
    setTo('');
    setFiltered(false);
    setPage(1);
  };

  return (
    <main className="slots-page">
      <section className="slots-cover">
        <video className="slots-cover-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/my-bookings-city.mp4" type="video/mp4" />
        </video>
        <div className="slots-cover-shade" />
        <div className="slots-cover-content">
      <div className="slots-heading">
        <div>
          <p className="slots-kicker">ParkBay / Parking network</p>
          <h1>Find your <em>perfect spot.</em></h1>
          <p>Browse open spaces or search the city grid by the exact time you need to park.</p>
        </div>
        <div className="slots-count"><strong>{total}</strong><span>{filtered ? 'spots available' : 'total spots'}</span></div>
      </div>

      <form className="availability-panel" onSubmit={handleSearch}>
        <div className="availability-title">
          <span className="availability-icon">01</span>
          <div><strong>Search availability</strong><span>Choose a window and we will find the best open spaces.</span></div>
        </div>
        <label>
          From
          <input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          To
          <input type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <div className="availability-actions">
          <button type="submit" disabled={searching}>
            {searching ? 'Searching...' : 'Find availability'}
          </button>
          {filtered && (
            <button className="clear-button" type="button" onClick={clearFilter}>
              Clear
            </button>
          )}
        </div>
      </form>

          <a className="slots-cover-scroll" href="#available-spots"><span>EXPLORE PARKING SPOTS</span><b aria-hidden="true">&#8595;</b></a>
        </div>
      </section>

      <section className="slots-results" id="available-spots">
      {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="py-16 text-center text-slate-500">Loading parking slots...</p>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-slate-950">No slots found</h2>
          <p className="mt-2 text-slate-500">Try a different time window.</p>
        </div>
      ) : (
        <div className="slot-grid">
          {slots.map((slot) => {
            const isFeatured = ['A-101', 'A-102', 'A-103', 'A-104', 'A-105', 'A-106', 'A-107', 'A-108', 'A-109'].includes(slot.slotNumber);
            const isSecondaryFeatured = slot.slotNumber === 'A-102';
            const isTertiaryFeatured = slot.slotNumber === 'A-103';
            const isQuaternaryFeatured = slot.slotNumber === 'A-104';
            const isColoringFeatured = slot.slotNumber === 'A-105';
            const isVehiclesFeatured = slot.slotNumber === 'A-106';
            const isCorporateFeatured = slot.slotNumber === 'A-107';
            const isVinnieFeatured = slot.slotNumber === 'A-108';
            const isImageFeatured = slot.slotNumber === 'A-109';

            return (
              <article className={`slot-card ${isFeatured ? 'slot-card-featured' : ''} ${isSecondaryFeatured ? 'slot-card-featured-secondary' : ''} ${isTertiaryFeatured ? 'slot-card-featured-tertiary' : ''} ${isQuaternaryFeatured ? 'slot-card-featured-quaternary' : ''} ${isColoringFeatured ? 'slot-card-coloring' : ''} ${isVehiclesFeatured ? 'slot-card-vehicles' : ''} ${isCorporateFeatured ? 'slot-card-corporate' : ''} ${isVinnieFeatured ? 'slot-card-vinnie' : ''} ${isImageFeatured ? 'slot-card-image' : ''}`} key={slot._id}>
                <div className="slot-card-top">
                  <div><p>Parking slot</p><h2>{slot.slotNumber}</h2></div>
                  <span className={`slot-status ${slot.isActive ? 'is-active' : ''}`}>{slot.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                {isFeatured && <div className="slot-badge">Featured bay</div>}
                <div className={`slot-visual ${isColoringFeatured ? 'slot-visual-coloring' : ''} ${isVehiclesFeatured ? 'slot-visual-vehicles' : ''} ${isCorporateFeatured ? 'slot-visual-corporate' : ''} ${isVinnieFeatured ? 'slot-visual-vinnie' : ''} ${isImageFeatured ? 'slot-visual-image' : ''}`}>
                  {isImageFeatured ? (
                    <img className="slot-visual-image-art" src="https://cdn.dribbble.com/userupload/19989855/file/original-a20a9ca6a09561b8bd88d3f6c1a58749.png?format=webp&resize=400x300&vertical=center" alt="Parking bay inspiration for slot A-109" />
                  ) : <>
                    <span className="slot-visual-mark">P</span>
                    <span>{isColoringFeatured ? 'ILLUSTRATED BAY' : isVehiclesFeatured ? 'VEHICLE BAY' : isCorporateFeatured ? 'ZENTO / MOBILITY' : isVinnieFeatured ? 'CITY CRUISER' : `OPEN BAY / ${slot.location}`}</span>
                    {isColoringFeatured && (
                      <svg className="slot-coloring-car" viewBox="0 0 180 80" role="img" aria-label="Line drawing of a car">
                        <path d="M22 52h8l12-22c2-4 6-6 11-6h61c5 0 9 2 12 6l14 22h9c5 0 9 4 9 9v8H16v-8c0-5 2-9 6-9Z" />
                        <path d="m51 30-10 20h81l-12-20H51Zm-21 22h113M71 30v20m22-20v20" />
                        <circle cx="47" cy="66" r="9" /><circle cx="129" cy="66" r="9" />
                      </svg>
                    )}
                    {isVehiclesFeatured && (
                      <svg className="slot-vehicles-art" viewBox="0 0 220 100" role="img" aria-label="Stylized illustration of a sport utility vehicle">
                        <path className="vehicle-shadow" d="M28 79h166" />
                        <path className="vehicle-body" d="m30 64 8-18c2-5 7-8 13-9l19-3 19-19c4-4 9-6 15-6h39c7 0 13 3 18 8l18 21 15 6c5 2 8 7 8 12v13h-20a18 18 0 0 0-35 0H78a18 18 0 0 0-35 0H27v-5c0-4 1-7 3-10Z" />
                        <path className="vehicle-window" d="m78 36 17-17c2-2 5-3 9-3h17v24H72l6-4Zm51-20h14c5 0 9 2 13 5l15 19h-42V16Z" />
                        <path className="vehicle-detail" d="M39 53h18m112-9h12M29 64h14m143 0h18m-79-47v24" />
                        <circle className="vehicle-wheel" cx="60" cy="69" r="13" /><circle className="vehicle-wheel" cx="165" cy="69" r="13" />
                        <circle className="vehicle-hub" cx="60" cy="69" r="5" /><circle className="vehicle-hub" cx="165" cy="69" r="5" />
                      </svg>
                    )}
                    {isCorporateFeatured && (
                      <svg className="slot-corporate-art" viewBox="0 0 220 100" role="img" aria-label="Minimal illustration of a modern electric car">
                        <path className="corporate-shadow" d="M26 80h170" />
                        <path className="corporate-body" d="m28 63 8-16c2-5 7-8 13-9l25-3 20-18c4-4 9-6 15-6h31c7 0 13 3 18 8l17 19 17 6c5 2 8 7 8 12v12h-20a17 17 0 0 0-34 0H78a17 17 0 0 0-34 0H27v-5c0-3 0-6 1-8Z" />
                        <path className="corporate-glass" d="m82 34 17-15c3-3 6-4 10-4h16v22H76l6-3Zm51-19h10c5 0 9 2 13 6l13 16h-36V15Z" />
                        <path className="corporate-line" d="M31 58h19m122-9h17M50 58h117m-66-42v23" />
                        <circle className="corporate-wheel" cx="61" cy="68" r="12" /><circle className="corporate-wheel" cx="163" cy="68" r="12" />
                        <circle className="corporate-hub" cx="61" cy="68" r="4" /><circle className="corporate-hub" cx="163" cy="68" r="4" />
                      </svg>
                    )}
                    {isVinnieFeatured && (
                      <svg className="slot-vinnie-art" viewBox="0 0 220 100" role="img" aria-label="Playful illustration of a compact city car">
                        <path className="vinnie-shadow" d="M31 80h158" />
                        <path className="vinnie-body" d="m30 64 7-17c2-5 7-8 12-9l25-3 17-17c4-4 9-6 15-6h35c7 0 13 3 17 8l16 18 17 6c5 2 8 7 8 12v12h-20a17 17 0 0 0-34 0H79a17 17 0 0 0-34 0H28v-5c0-4 0-7 2-9Z" />
                        <path className="vinnie-glass" d="m80 35 16-16c3-3 6-4 10-4h16v22H75l5-2Zm49-20h12c5 0 9 2 12 5l14 17h-38V15Z" />
                        <path className="vinnie-detail" d="M34 57h18m116-8h18M78 39h94m-46-24v24" />
                        <circle className="vinnie-wheel" cx="61" cy="68" r="12" /><circle className="vinnie-wheel" cx="163" cy="68" r="12" />
                        <circle className="vinnie-hub" cx="61" cy="68" r="4" /><circle className="vinnie-hub" cx="163" cy="68" r="4" />
                        <path className="vinnie-spark" d="m191 24 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
                      </svg>
                    )}
                  </>}
                </div>
                <dl className="slot-details">
                  <div><dt>Location</dt><dd>{slot.location}</dd></div>
                  <div><dt>Rate</dt><dd>${Number(slot.pricePerHour).toFixed(2)} <small>/ hour</small></dd></div>
                </dl>
                <Link className="slot-link" to={`/slots/${slot._id}`}>View details <span>{'->'}</span></Link>
              </article>
            );
          })}
        </div>
      )}

      {!filtered && pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={page === 1} onClick={() => setPage((currentPage) => currentPage - 1)}>Previous</button>
          <span className="text-sm text-slate-500">Page {page} of {pages}</span>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={page === pages} onClick={() => setPage((currentPage) => currentPage + 1)}>Next</button>
        </div>
      )}
      </section>
    </main>
  );
}

export default Slots;
