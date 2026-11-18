import { useEffect, useState } from 'react';

export function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    fetch('/api/reports', { credentials: 'include' }).then(r => r.json()).then(d => setReports(d.reports || []));
    fetch('/api/treasury', { credentials: 'include' }).then(r => r.json()).then(d => {
      const income = (d.transactions || []).filter((t: any) => t.type === 'income').reduce((a: number, b: any) => a + b.amount, 0);
      setTotalIncome(income);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Income</p>
          <p className="text-2xl font-bold">KES {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Ministration Reports</p>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
      </div>
    </div>
  );
}
