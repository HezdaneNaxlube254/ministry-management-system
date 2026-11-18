import { useState, useEffect } from 'react';
import { PersonPicker } from '../components/PersonPicker';

export function Reports() {
  const [schools, setSchools] = useState<any[]>([]);
  const [submitter, setSubmitter] = useState<any>(null);
  const [ministers, setMinisters] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/reports/schools', { credentials: 'include' }).then(res => res.json()).then(data => setSchools(data.schools));
  }, []);
  
  const handleAddMinister = (p: any) => {
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
  };

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-2xl font-bold">Enter Ministration Report</h2>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900">
          🖨️ Download Blank Form
        </button>
      </div>

      {submitted && <p className="text-green-600 mb-4 font-bold bg-green-50 p-3 rounded">✅ Report submitted successfully!</p>}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block font-semibold mb-2">School</label>
          <select name="schoolId" required className="w-full p-2 border rounded">
            <option value="">Select School...</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Your Role</label>
            <input name="role" placeholder="e.g. Facilitator" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Students Present (Count)</label>
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
    </div>
  );
}
