import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Onboarding() {
  const [targets, setTargets] = useState([
    { metricName: 'reports_submitted', label: 'Reports Submitted (%)', targetValue: 90 },
    { metricName: 'action_items', label: 'Action Items Completed (%)', targetValue: 80 },
    { metricName: 'meetings', label: 'Meetings Held', targetValue: 4 },
  ]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targets }),
    });

    if (res.ok) {
      navigate('/admin');
    } else {
      const data = await res.json();
      setError(data.message || data.error || 'Failed to submit targets');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-lg mx-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Set Your Department Targets</h1>
        <p className="text-gray-600 mb-6 text-center">You must set at least 3 targets for this term before you can access the system.</p>
        
        {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded">{error}</p>}

        <div className="space-y-4 mb-6">
          {targets.map((t, i) => (
            <div key={t.metricName}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.label}</label>
              <input
                type="number"
                value={t.targetValue}
                onChange={(e) => {
                  const newTargets = [...targets];
                  newTargets[i].targetValue = Number(e.target.value);
                  setTargets(newTargets);
                }}
                className="w-full p-3 border rounded-md"
                required
              />
            </div>
          ))}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700">
          Submit Targets
        </button>
      </form>
    </div>
  );
}
