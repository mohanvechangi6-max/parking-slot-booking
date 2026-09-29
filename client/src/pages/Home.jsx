import { Link } from 'react-router-dom';

const features = [
  {
    number: '01',
    title: 'Live availability',
    text: 'See real-time slot status, hourly pricing, and location information before you leave home.',
  },
  {
    number: '02',
    title: 'Quick booking flow',
    text: 'Choose your preferred time in seconds and reserve without the usual parking stress.',
  },
  {
    number: '03',
    title: 'Smart operations',
    text: 'Keep inventory, occupancy, and pricing aligned with a clean admin dashboard built for speed.',
  },
];

const metrics = [
  { label: 'Spots monitored', value: '12k+' },
  { label: 'Avg. booking time', value: '2 min' },
  { label: 'Customer rating', value: '4.9/5' },
];

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-video-wrap">
          <video className="home-video" autoPlay muted loop playsInline>
            <source src="https://cdn.dribbble.com/userupload/24877163/file/large-8352d6fd417a1ee8b59a2dad6dfe22ee.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-content">
          <p className="eyebrow">
            <span className="pulse-dot" /> Premium parking experience
          </p>
          <h1>
            Park faster.<br />
            <em>Feel better.</em>
          </h1>
          <p className="hero-lede">
            Reserve a spot in minutes, avoid the stress of circling, and arrive to a smoother city day.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/slots">
              Find a parking spot <span>↗</span>
            </Link>
            <Link className="button button-quiet" to="/create-account">
              Create free account
            </Link>
          </div>

          <div className="hero-proof">
            <span>●</span> Live availability <i /> <span>⌁</span> Instant confirmation
          </div>
        </div>

        <div className="hero-visual" aria-label="Parking availability preview">
          <div className="visual-surface">
            <div className="visual-header">LIVE MAP / 09:41 PM</div>
            <div className="map-panel">
              <div className="map-grid" />
              <div className="map-road road-a" />
              <div className="map-road road-b" />
              <div className="map-road road-c" />
              <div className="map-pin pin-one"><span>A1</span></div>
              <div className="map-pin pin-two"><span>B2</span></div>
              <div className="map-pin pin-three"><span>C4</span></div>
              <div className="map-pin occupied"><span>D1</span></div>
              <div className="map-corner">NORTH<br />GARAGE</div>
              <div className="map-crosshair" />
            </div>
            <div className="visual-card">
              <div><span className="status-light" /> 12 spots open now</div>
              <strong>
                Starting at <b>$4.50</b>
                <small> / hour</small>
              </strong>
            </div>
            <div className="visual-footer">PARKBAY / CITY GRID 01</div>
          </div>
        </div>
      </section>

      <section className="signal-strip">
        <p>Built for the moments between leaving and arriving.</p>
        <div className="signal-stats">
          <span><strong>24/7</strong> visibility</span>
          <span><strong>3 taps</strong> to reserve</span>
          <span><strong>0</strong> parking loops</span>
        </div>
      </section>
    </main>
  );
}

export default Home;
