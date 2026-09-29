import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isLogin = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={isHome ? 'home-navbar' : isLogin ? 'login-navbar' : 'border-b border-slate-200 bg-white'}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4" aria-label="Main navigation">
        <Link to="/" className={isHome ? 'home-brand' : isLogin ? 'login-brand' : 'text-lg font-bold tracking-tight text-slate-950'}>
          ParkBay
        </Link>

        <div className={isHome ? 'home-nav-links' : isLogin ? 'login-nav-links' : 'flex items-center gap-5 text-sm font-medium text-slate-600'}>
          <Link className={location.pathname.startsWith('/slots') ? (isHome ? 'home-nav-active' : isLogin ? 'login-nav-active' : 'text-slate-950') : undefined} to="/slots">
            Slots
          </Link>
          {user && <Link to="/my-bookings">My bookings</Link>}
          {user?.role === 'admin' && <Link to="/admin/slots">Admin</Link>}
          {user ? (
            <>
              <span className="hidden text-slate-400 sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link
                to="/create-account"
                className="rounded-lg bg-slate-950 px-3 py-2 text-white transition hover:bg-slate-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
