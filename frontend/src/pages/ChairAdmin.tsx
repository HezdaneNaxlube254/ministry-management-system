import { useState, useEffect } from 'react';

export function ChairAdmin() {
  const [tab, setTab] = useState('accounts');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [pendingTargets, setPendingTargets] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('facilitator');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');

  const loadAll = () => {
    fetch('/api/admin/accounts', { credentials: 'include' }).then(r => r.json()).then(d => setAccounts(d.accounts || []));
    fetch('/api/admin/schools', { credentials: 'include' }).then(r => r.json()).then(d => setSchools(d.schools || []));
    fetch('/api/admin/targets/pending', { credentials: 'include' }).then(r => r.json()).then(d => setPendingTargets(d.targets || []));
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/accounts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ username: newUsername, role: newRole, displayName: newDisplayName || newUsername }),
    });
    if (res.ok) {
      setNewUsername(''); setNewDisplayName(''); loadAll();
    } else {
      const err = await res.json(); alert(err.error);
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!confirm('Reset password to ministry2026?')) return;
    const res = await fetch(`/api/admin/accounts/${id}/reset-password`, { method: 'PUT', credentials: 'include' });
    const data = await res.json();
    alert(data.message);
  };

  const handleToggleAccount = async (id: number) => {
    await fetch(`/api/admin/accounts/${id}/toggle`, { method: 'PUT', credentials: 'include' });
    loadAll();
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/schools', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name: newSchoolName, code: newSchoolCode }),
    });
    if (res.ok) {
      setNewSchoolName(''); setNewSchoolCode(''); loadAll();
    } else {
      const err = await res.json(); alert(err.error);
    }
  };

  const handleApprove = async (id: number) => {
    await fetch(`/api/admin/targets/${id}/approve`, { method: 'PUT', credentials: 'include' });
    loadAll();
  };

  const handleReject = async (id: number) => {
    await fetch(`/api/admin/targets/${id}/reject`, { method: 'PUT', credentials: 'include' });
    loadAll();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex gap-2 mb-6 border-b">
        {['accounts', 'schools', 'targets'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'targets' && pendingTargets.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingTargets.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Create Account</h3>
            <form onSubmit={handleCreateAccount} className="space-y-3 bg-gray-50 p-4 rounded">
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username (e.g., kamulu-sec)" required className="w-full p-2 border rounded" />
              <input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} placeholder="Display Name (optional)" className="w-full p-2 border rounded" />
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full p-2 border rounded">
                <option value="facilitator">Facilitator</option>
                <option value="secretary">Secretary</option>
                <option value="treasurer">Treasurer</option>
                <option value="prayer-sec">Prayer Secretary</option>
                <option value="dad">Dad</option>
                <option value="mum">Mum</option>
                <option value="os">OS</option>
                <option value="patron">Patron</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Create (default password: ministry2026)</button>
            </form>
          </div>
          <div>
            <h3 className="font-bold mb-3">All Accounts ({accounts.length})</h3>
            <div className="max-h-96 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(a => (
                    <tr key={a.id} className="border-t">
                      <td className="p-2 font-mono">{a.username}</td>
                      <td className="p-2">{a.role}</td>
                      <td className="p-2"><span className={a.isActive ? 'text-green-600' : 'text-red-600'}>{a.isActive ? '● Active' : '● Inactive'}</span></td>
                      <td className="p-2 text-right space-x-2">
                        <button onClick={() => handleResetPassword(a.id)} className="text-xs bg-yellow-200 px-2 py-1 rounded">Reset</button>
                        <button onClick={() => handleToggleAccount(a.id)} className="text-xs bg-gray-200 px-2 py-1 rounded">{a.isActive ? 'Deactivate' : 'Activate'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Add School</h3>
            <form onSubmit={handleCreateSchool} className="space-y-3 bg-gray-50 p-4 rounded">
              <input value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} placeholder="School Name" required className="w-full p-2 border rounded" />
              <input value={newSchoolCode} onChange={e => setNewSchoolCode(e.target.value)} placeholder="Code (e.g., kamulu-sec)" required className="w-full p-2 border rounded" />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Add School</button>
            </form>
          </div>
          <div>
            <h3 className="font-bold mb-3">All Schools ({schools.length})</h3>
            <ul className="border rounded divide-y">
              {schools.map(s => (
                <li key={s.id} className="p-2 flex justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-gray-500 font-mono">{s.code}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'targets' && (
        <div>
          <h3 className="font-bold mb-3">Pending Target Approvals ({pendingTargets.length})</h3>
          {pendingTargets.length === 0 ? (
            <p className="text-gray-500">No pending approvals.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Account ID</th>
                  <th className="p-2 text-left">Metric</th>
                  <th className="p-2 text-left">Target</th>
                  <th className="p-2 text-left">Submitted</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {pendingTargets.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2">{t.accountId}</td>
                    <td className="p-2">{t.metricName}</td>
                    <td className="p-2 font-bold">{t.targetValue}</td>
                    <td className="p-2 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 text-right space-x-2">
                      <button onClick={() => handleApprove(t.id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded">Approve</button>
                      <button onClick={() => handleReject(t.id)} className="bg-red-600 text-white text-xs px-2 py-1 rounded">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
