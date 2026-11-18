import { useState, useEffect } from 'react';

export function FinancialReports() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    fetch('/api/treasury', { credentials: 'include' }).then(r => r.json()).then(d => setTransactions(d.transactions));
  }, []);

  // Basic grouping logic (can be expanded for weekly)
  const grouped: any = {};
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    const key = filter === 'month' 
      ? d.toLocaleString('default', { month: 'long', year: 'numeric' })
      : `Week of ${new Date(d.setDate(d.getDate() - d.getDay())).toLocaleDateString()}`;
    
    if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
    if (tx.type === 'income') grouped[key].income += tx.amount;
    else grouped[key].expense += tx.amount;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-3xl print:shadow-none">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <div className="flex gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2">
            <option value="month">Monthly View</option>
            <option value="week">Weekly View</option>
          </select>
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900">
            🖨️ Print Report
          </button>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3">Period</th>
            <th className="p-3 text-right text-green-600">Total Income</th>
            <th className="p-3 text-right text-red-600">Total Expenses</th>
            <th className="p-3 text-right text-blue-600">Net Balance</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(grouped).map(period => (
            <tr key={period} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{period}</td>
              <td className="p-3 text-right text-green-600">{grouped[period].income.toLocaleString()}</td>
              <td className="p-3 text-right text-red-600">{grouped[period].expense.toLocaleString()}</td>
              <td className="p-3 text-right font-bold text-blue-600">{(grouped[period].income - grouped[period].expense).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
