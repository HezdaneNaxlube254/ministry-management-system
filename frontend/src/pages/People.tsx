import { useState, useEffect } from 'react';

export function People() {
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/people/search?q=', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setPeople(d.results));
  }, []);

  const handleWhatsApp = (phone: string, name: string) => {
    if (!phone) return alert('No phone number saved for ' + name);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Member Registry</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Joined</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {people.map(p => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="p-2 font-medium">{p.fullName}</td>
              <td className="p-2 text-sm text-gray-500">{p.phone || '-'}</td>
              <td className="p-2 text-sm text-gray-500">{new Date(p.joinedAt).toLocaleDateString()}</td>
              <td className="p-2 text-center">
                <button onClick={() => handleWhatsApp(p.phone, p.fullName)} className="p-2 bg-green-500 rounded-full hover:bg-green-600 text-white inline-flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.102-.069-.285-.09-.649-.207-1.109-.402-1.954-.844-3.223-2.801-3.319-2.93-.096-.13-.789-1.048-.789-2.003 0-.955.5-1.424.677-1.622.177-.198.387-.246.517-.246.13 0 .26.002.371.007.117.005.273-.044.427.328.159.385.544 1.332.592 1.429.048.097.08.21.015.339-.066.13-.099.21-.198.328-.099.118-.208.265-.297.354-.099.099-.203.207-.087.405.117.198.517.86 1.111 1.393.763.682 1.408.893 1.605.992.198.099.315.083.43-.05.117-.132.5-.578.633-.775.133-.197.267-.165.45-.099.183.066 1.16.548 1.36.648.198.099.33.148.377.23.048.082.048.478-.096.883z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.986-1.308C8.447 21.515 10.152 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.294c-1.635 0-3.153-.502-4.415-1.356l-.316-.197-3.273.858.873-3.188-.215-.332C3.714 14.748 3.25 13.417 3.25 12c0-4.825 3.925-8.75 8.75-8.75s8.75 3.925 8.75 8.75-3.925 8.75-8.75 8.75z"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
