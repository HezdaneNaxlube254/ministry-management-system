import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await apiFetch<{ user: { role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const role = data.user.role;
      localStorage.setItem('userRole', role);

      if (role === 'facilitator') {
        navigate('/admin/reports');
        return;
      }

      const leaderRoles = ['secretary', 'treasurer', 'prayer-sec', 'dad', 'mum', 'os'];
      if (leaderRoles.includes(role)) {
        try {
          await apiFetch('/people/search?q=test');
        } catch (err: any) {
          if (err.message.includes('ONBOARDING_REQUIRED')) {
            navigate('/onboarding'); 
            return;
          }
        }
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm mx-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Ministry System</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border rounded-md mb-4" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-md mb-6" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700">Log In</button>
      </form>
    </div>
  );
}
