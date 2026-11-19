import { useState, useEffect } from 'react';
import { PersonPicker } from '../components/PersonPicker';

interface Person { id: number; fullName: string; }

export function Reports() {
  const role = localStorage.getItem('userRole') || '';
  const isFacilitator = role === 'facilitator';
  const [tab, setTab] = useState(isFacilitator ? 'add' : 'view');
  const [schools, setSchools] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [mySchoolId, setMySchoolId] = useState<number | null>(null);
  const [submitter, setSubmitter] = useState<Person | null>(null);
  const [ministers, setMinisters] = useState<Person[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch('/api/reports/schools', { credentials: 'include' }).then(r => r.json()).then(d => setSchools(d.schools || []));
    fetch('/api/reports', { credentials: 'include' }).then(r => r.json()).then(d => {
      setReports(d.reports || []);
      if (d.mySchoolId) setMySchoolId(d.mySchoolId);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAddMinister = (p: Person) => {
    if (ministers.find(m => m.id === p.id)) return alert('Already listed.');
    setMinisters([...ministers, p]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitter) return alert('Select the person submitting.');
    if (ministers.length === 0) return alert('Add at least one minister present.');

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    await fetch('/api/reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({
        schoolId: Number(data.get('schoolId')),
        submittedById: submitter.id,
        submittedBy: submitter.fullName,
        role: data.get('role'),
        studentsPresent: Number(data.get('studentsPresent')),
        ministersPresent: ministers.length,
        topic: data.get('topic'),
        challenges: data.get('challenges'),
        recommendations: data.get('recommendations'),
      })
    });

    setSubmitted(true);
    form.reset();
    setSubmitter(null);
    setMinisters([]);
    setTimeout(() => setSubmitted(false), 3000);
    loadData();
  };

  if (loading) return <div className="text-center p-8 text-gray-500">Loading reports...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex gap-2 mb-6 border-b">
        <button onClick={() => setTab('view')}
          className={`px-4 py-2 font-medium ${tab === 'view' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          View Reports
        </button>
        <button onClick={() => setTab('add')}
          className={`px-4 py-2 font-medium ${tab === 'add' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          + Add Report
        </button>
      </div>

      {tab === 'view' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">School</th>
                  <th className="p-3 text-left">Submitted By</th>
                  <th className="p-3 text-right">Students</th>
                  <th className="p-3 text-right">Ministers</th>
                  <th className="p-3 text-left">Topic</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{r.schoolName}</td>
                    <td className="p-3">{r.submittedBy} <span className="text-xs text-gray-500">({r.role})</span></td>
                    <td className="p-3 text-right font-medium">{r.students}</td>
                    <td className="p-3 text-right">{r.ministers}</td>
                    <td className="p-3 text-gray-600">{r.topic}</td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-500">
                    No reports yet. {isFacilitator ? 'Be the first to submit one.' : ''}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'add' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          {submitted && <div className="bg-green-50 text-green-700 p-3 rounded">✅ Report submitted successfully!</div>}

          <div>
            <label className="block font-semibold mb-2">School</label>
            {isFacilitator && mySchoolId ? (
              <div>
                <select name="schoolId" defaultValue={mySchoolId} disabled className="w-full p-2 border rounded bg-gray-100">
                  {schools.filter(s => s.id === mySchoolId).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <input type="hidden" name="schoolId" value={mySchoolId} />
                <p className="text-xs text-gray-500 mt-1">Your school — locked to your login</p>
              </div>
            ) : (
              <select name="schoolId" required className="w-full p-2 border rounded">
                <option value="">Select School...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Submitted By</label>
            {submitter ? (
              <div className="p-2 bg-green-50 rounded border flex justify-between items-center">
                <span>{submitter.fullName}</span>
                <button type="button" onClick={() => setSubmitter(null)} className="text-sm text-red-600 underline">Change</button>
              </div>
            ) : (
              <PersonPicker label="" onSelect={setSubmitter} />
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Ministers Present</label>
            <ul className="mb-2">
              {ministers.map(m => (
                <li key={m.id} className="flex justify-between bg-gray-50 p-2 border-b text-sm">
                  <span>{m.fullName}</span>
                  <button type="button" onClick={() => setMinisters(ministers.filter(x => x.id !== m.id))} className="text-red-500">Remove</button>
                </li>
              ))}
            </ul>
            <PersonPicker label="" onSelect={handleAddMinister} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Your Role</label>
              <input name="role" placeholder="e.g. Facilitator" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Students Present</label>
              <input name="studentsPresent" type="number" placeholder="0" required className="w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Topic / Activity</label>
            <input name="topic" placeholder="What did you do?" required className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Challenges of the Day</label>
            <textarea name="challenges" rows={3} placeholder="Any difficulties faced..." className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Recommendations</label>
            <textarea name="recommendations" rows={3} placeholder="What should be done better?" className="w-full p-2 border rounded" />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">Submit Report</button>
        </form>
      )}
    </div>
  );
}
