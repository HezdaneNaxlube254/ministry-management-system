import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }), credentials: 'include',
    });

    if (!loginRes.ok) { setError('Invalid username or password'); return; }

    const loginData = await loginRes.json();
    const role = loginData.user.role;
    
    // Store role for the layout to read
    localStorage.setItem('userRole', role);

    if (role === 'facilitator') {
      navigate('/admin/reports');
      return;
    }

    const leaderRoles = ['secretary', 'treasurer', 'prayer-sec', 'dad', 'mum', 'os'];
    if (leaderRoles.includes(role)) {
      const checkRes = await fetch('/api/people/search?q=test', { credentials: 'include' });
      if (checkRes.status === 403) { navigate('/onboarding'); return; }
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Ministry System</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border rounded-md mb-4" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-md mb-6" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700">Log In</button>
      </form>
    </div>
  );
}
