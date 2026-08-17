import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    navigate('/');
  };

  const moduleLinks = [
    { name: 'Inventory', to: '/inventory', roles: ['supervisor', 'staff', 'admin'] },
    { name: 'Forecast', to: '/forecast', roles: ['supervisor', 'admin'] },
    { name: 'Operations', to: '/operations', roles: ['supervisor', 'admin'] },
    { name: 'Workforce', to: '/workforce', roles: ['supervisor', 'staff'] },
    { name: 'Analytics', to: '/analytics', roles: ['supervisor', 'admin'] },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-3 items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="text-[2.5rem] tracking-[-0.04em]" style={{ fontFamily: 'var(--font-serif)' }}>
              mofil
            </Link>
          </div>

          <div className="flex justify-center">
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
              <nav className="flex items-center gap-4">
                {moduleLinks.map((m) => {
                  const allowed = m.roles.includes(currentUser.role);
                  if (!allowed) return null;
                  return (
                    <Link key={m.to} to={m.to} className="text-sm tracking-wide uppercase opacity-80 hover:opacity-100 transition-opacity duration-200">
                      {m.name}
                    </Link>
                  );
                })}
              </nav>
            )}

            {currentUser && currentUser.role === 'staff' && (
              <nav className="flex items-center gap-4">
                <Link to="/inventory" className="text-sm tracking-wide uppercase opacity-80 hover:opacity-100 transition-opacity duration-200">Inventory</Link>
                <Link to="/workforce" className="text-sm tracking-wide uppercase opacity-80 hover:opacity-100 transition-opacity duration-200">Workforce</Link>
                <Link to="/staff" className="text-sm tracking-wide uppercase opacity-80 hover:opacity-100 transition-opacity duration-200">Staff</Link>
              </nav>
            )}
          </div>

          <div className="flex items-center justify-end gap-6">
            {currentUser ? (
              <>
                <div className="text-sm text-right">
                  <div>{currentUser.username}</div>
                  <div className="opacity-70 text-xs uppercase tracking-widest">{currentUser.role}</div>
                </div>
                <Link
                  to={currentUser.role === 'admin' ? '/analytics' : currentUser.role === 'supervisor' ? '/operations' : '/inventory'}
                  className="px-6 py-2.5 border border-border text-sm tracking-wide uppercase hover:bg-muted transition-all duration-300"
                >
                  Dashboard
                </Link>


                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm tracking-wide uppercase border border-primary hover:bg-background hover:text-foreground transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm tracking-wide uppercase opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile dropdown removed per request */}
    </header>
  );
}
