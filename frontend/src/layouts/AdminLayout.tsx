import { Outlet, Link, useNavigate } from 'react-router-dom';

export function AdminLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center mb-6 print:hidden">
        <div className="flex gap-6 font-medium text-gray-700">
          <Link to="/admin" className="hover:text-blue-600">Dashboard</Link>
          
          {(role === 'chair' || role === 'patron') && (
            <Link to="/admin/admin-panel" className="hover:text-blue-600 font-bold text-blue-700">Admin Panel</Link>
          )}
          
          {(role === 'treasurer' || role === 'chair') && (
            <Link to="/admin/treasury" className="hover:text-blue-600">Treasury</Link>
          )}
          
          {role !== 'treasurer' && role !== 'facilitator' && (
            <Link to="/admin/reports" className="hover:text-blue-600">Ministration Reports</Link>
          )}

          {role !== 'facilitator' && (
            <Link to="/admin/people" className="hover:text-blue-600">People</Link>
          )}
        </div>
        <button onClick={handleLogout} className="text-red-600 hover:underline">Log Out</button>
      </nav>
      <main className="max-w-5xl mx-auto px-6 pb-12 print:max-w-none print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
