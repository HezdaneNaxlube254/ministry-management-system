import { useState, useEffect } from 'react';

interface Person { id: number; fullName: string; phone?: string; }

export function PersonPicker({ onSelect, label }: { onSelect: (p: Person) => void, label: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/people/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleAddNew = async (force: boolean) => {
    setWarning(null);
    const res = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: query, phone: newPhone, force })
    });
    if (res.status === 409) {
      const data = await res.json();
      setWarning(data.warning);
    } else if (res.ok) {
      const data = await res.json();
      onSelect(data.person);
      setQuery(''); setResults([]); setNewPhone('');
    }
  };

  return (
    <div className="w-full border p-3 rounded-lg bg-gray-50 mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      
      <input
        type="text" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search registry..." className="w-full p-2 border border-gray-300 rounded-md"
      />
      {loading && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
      
      {!warning && results.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md max-h-40 overflow-y-auto bg-white">
          {results.map(p => (
            <li key={p.id} onClick={() => { onSelect(p); setQuery(''); }} className="p-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between">
              <span>{p.fullName}</span>
              <span className="text-gray-400 text-xs">{p.phone || 'No phone'}</span>
            </li>
          ))}
        </ul>
      )}

      {query && !loading && !warning && results.length === 0 && (
        <div className="mt-3 space-y-2 bg-white p-3 border rounded shadow-sm">
          <p className="text-sm text-orange-600">Not found in registry. Add them?</p>
          <input type="text" placeholder="Phone (e.g. 254712345678)" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full p-2 border rounded text-sm" />
          <button onClick={() => handleAddNew(false)} className="w-full bg-blue-600 text-white py-1 text-sm rounded-md">
            Verify & Register "{query}"
          </button>
        </div>
      )}

      {warning && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
          <p className="text-yellow-800 font-semibold">⚠️ {warning}</p>
          <p className="text-xs text-gray-600 mb-2">Are you sure this is a different person?</p>
          <div className="flex gap-2">
            <button onClick={() => { setWarning(null); }} className="flex-1 bg-gray-200 py-1 rounded">No, let me check</button>
            <button onClick={() => handleAddNew(true)} className="flex-1 bg-yellow-600 text-white py-1 rounded">Yes, add anyway</button>
          </div>
        </div>
      )}
    </div>
  );
}
