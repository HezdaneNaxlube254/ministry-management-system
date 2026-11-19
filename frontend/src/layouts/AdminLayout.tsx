import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function AdminLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = (
    <>
      <Link to="/admin" onClick={closeMenu} className="block px-4 py-3 hover:bg-gray-100 text-gray-700 font-medium border-b border-gray-100">
        Dashboard
      </Link>
      {(role === 'chair' || role === 'patron') && (
        <Link to="/admin/admin-panel" onClick={closeMenu} className="block px-4 py-3 hover:bg-gray-100 text-blue-700 font-bold border-b border-gray-100">
          Admin Panel
        </Link>
      )}
      {(role === 'treasurer' || role === 'chair') && (
        <Link to="/admin/treasury" onClick={closeMenu} className="block px-4 py-3 hover:bg-gray-100 text-gray-700 font-medium border-b border-gray-100">
          Treasury
        </Link>
      )}
      {role !== 'treasurer' && role !== 'facilitator' && (
        <Link to="/admin/reports" onClick={closeMenu} className="block px-4 py-3 hover:bg-gray-100 text-gray-700 font-medium border-b border-gray-100">
          Reports
        </Link>
      )}
      {role !== 'facilitator' && (
        <Link to="/admin/people" onClick={closeMenu} className="block px-4 py-3 hover:bg-gray-100 text-gray-700 font-medium border-b border-gray-100">
          People
        </Link>
      )}
      <button onClick={handleLogout} className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium">
        Log Out
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <nav className="bg-white shadow-sm mb-6 print:hidden sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <span className="text-base md:text-lg font-bold text-gray-800">Ministry System</span>
          </div>
          <span className="text-xs md:text-sm text-gray-500 capitalize">{role}</span>
        </div>

        {isMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={closeMenu} aria-hidden="true" />
            <div className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-200 z-40">
              {navLinks}
            </div>
          </>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-3 md:px-6 pb-12 print:max-w-none print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
