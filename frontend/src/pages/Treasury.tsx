import { useState, useEffect } from 'react';

export function Treasury() {
  const [categories, setCategories] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [txType, setTxType] = useState('income');
  const [items, setItems] = useState<{ name: string, amount: number }[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [txnCost, setTxnCost] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reference, setReference] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [parentLink, setParentLink] = useState('');
  const [isBalanceMarker, setIsBalanceMarker] = useState(false);

  const loadData = () => {
    fetch('/api/treasury/categories', { credentials: 'include' }).then(r => r.json()).then(d => setCategories(d.categories || []));
    fetch('/api/treasury', { credentials: 'include' }).then(r => r.json()).then(d => setTransactions(d.transactions || []));
    fetch('/api/reports/schools', { credentials: 'include' }).then(r => r.json()).then(d => setSchools(d.schools || []));
  };

  useEffect(() => { loadData(); }, []);

  const handleAddCategory = async () => {
    if (!newCategory) return;
    await fetch('/api/treasury/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name: newCategory, fieldLabel: newFieldLabel })
    });
    setNewCategory(''); setNewFieldLabel(''); setShowNewCat(false); loadData();
  };

  const handleAddItem = () => {
    if (!itemName || !itemAmount) return;
    setItems([...items, { name: itemName, amount: Number(itemAmount) }]);
    setItemName(''); setItemAmount('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const itemsTotal = items.reduce((sum, i) => sum + i.amount, 0);
  const finalAmount = txType === 'income' ? 0 : itemsTotal + Number(txnCost || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const payload = {
      type: txType,
      amount: txType === 'income' ? Number(data.get('amount')) : finalAmount,
      transactionCost: txType === 'income' ? 0 : Number(txnCost || 0),
      description: data.get('description'),
      category: selectedCat,
      schoolId: data.get('schoolId') ? Number(data.get('schoolId')) : null,
      venue: data.get('venue') || null,
      dynamicField: data.get('dynamicField') || null,
      reference: reference || null,
      counterparty: counterparty || null,
      parentTransactionId: parentLink ? Number(parentLink) : null,
      isBalanceMarker,
      date: data.get('date'),
      items: txType === 'income' ? [] : items,
    };

    const url = editingId ? `/api/treasury/${editingId}` : '/api/treasury';
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    form.reset(); setSelectedCat(''); setItems([]); setTxnCost(''); setEditingId(null);
    setReference(''); setCounterparty(''); setParentLink(''); setIsBalanceMarker(false);
    loadData();
  };

  const handleEditClick = (tx: any) => {
    setEditingId(tx.id); setTxType(tx.type); setSelectedCat(tx.category);
    setItems(tx.items || []); setTxnCost((tx.transactionCost || 0).toString());
    setReference(tx.reference || ''); setCounterparty(tx.counterparty || '');
    setParentLink(tx.parentTransactionId?.toString() || '');
    setIsBalanceMarker(tx.isBalanceMarker || false);
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      (form.elements.namedItem('description') as HTMLInputElement).value = tx.description;
      (form.elements.namedItem('date') as HTMLInputElement).value = new Date(tx.date).toISOString().split('T')[0];
      if (tx.schoolId) (form.elements.namedItem('schoolId') as HTMLSelectElement).value = tx.schoolId.toString();
      if (tx.venue) (form.elements.namedItem('venue') as HTMLInputElement).value = tx.venue;
      if (tx.dynamicField) (form.elements.namedItem('dynamicField') as HTMLInputElement).value = tx.dynamicField;
    }
  };

  const currentCategoryObj = categories.find(c => c.name === selectedCat);
  const isSchoolCategory = selectedCat === 'School Ministration';
  const isVenueCategory = selectedCat === 'Bonding' || selectedCat === 'Fellowship';
  const hasDynamicField = currentCategoryObj?.fieldLabel && !isVenueCategory;

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    const txDate = new Date(t.date);
    const selected = new Date(filterDate);
    if (filterPeriod === 'day') return txDate.toDateString() === selected.toDateString();
    if (filterPeriod === 'week') {
      const start = new Date(selected);
      start.setDate(selected.getDate() - selected.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return txDate >= start && txDate <= end;
    }
    if (filterPeriod === 'month') return txDate.getMonth() === selected.getMonth() && txDate.getFullYear() === selected.getFullYear();
    return true;
  });

  // Running balance: sort ascending by date, accumulate, then reverse for display
  const sortedAsc = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const withRunningBalance = sortedAsc.map(tx => {
    if (tx.isBalanceMarker) {
      runningBalance = tx.amount;
      return { ...tx, runningBalance };
    }
    const delta = tx.type === 'income' ? tx.amount : -(tx.amount + (tx.transactionCost || 0));
    runningBalance += delta;
    return { ...tx, runningBalance };
  });
  const displayTransactions = withRunningBalance.reverse();

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const totalTxnCosts = filteredTransactions.reduce((a, b) => a + (b.transactionCost || 0), 0);
  const balance = income - expenses - totalTxnCosts;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold">{editingId ? 'Edit Transaction' : 'Treasury Ledger'}</h1>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900">🖨️ Print Sheet</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block overflow-hidden">
        {/* FORM */}
        <div className={`bg-white p-6 rounded-lg shadow print:hidden ${editingId ? 'ring-2 ring-blue-500' : ''}`}>
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Editing Transaction' : 'Record Transaction'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isBalanceMarker" checked={isBalanceMarker} onChange={e => setIsBalanceMarker(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="isBalanceMarker" className="text-sm font-medium text-blue-700">Balance Marker (Bal c/f, Bal b/d) — excludes from income/expense totals</label>
            </div>

            <select name="type" value={txType} onChange={(e) => setTxType(e.target.value)} className="w-full p-2 border rounded">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input name="description" placeholder="Description / Source" required className="w-full p-2 border rounded" />

            <div className="border p-3 rounded bg-gray-50">
              <label className="block text-sm font-semibold mb-2">Category</label>
              {!showNewCat ? (
                <div className="flex gap-2">
                  <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} required className="w-full p-2 border rounded">
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowNewCat(true)} className="bg-gray-200 px-3 rounded text-sm font-bold">+ New</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Category Name" className="w-full p-2 border rounded" />
                  <input value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} placeholder="Custom Field Label" className="w-full p-2 border rounded text-sm" />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleAddCategory} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
                    <button type="button" onClick={() => setShowNewCat(false)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {isSchoolCategory && (
              <select name="schoolId" required className="w-full p-2 border rounded bg-blue-50">
                <option value="">Select School...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
            {isVenueCategory && (
              <input name="venue" placeholder="Venue" required className="w-full p-2 border rounded bg-blue-50" />
            )}
            {hasDynamicField && (
              <input name="dynamicField" placeholder={currentCategoryObj.fieldLabel} required className="w-full p-2 border rounded bg-blue-50" />
            )}

            {/* NEW: Reference + Counterparty */}
            <div className="flex gap-2">
              <input value={reference} onChange={e => setReference(e.target.value)} placeholder="Reference (M-Pesa code, receipt no)" className="flex-1 p-2 border rounded text-sm" />
              <input value={counterparty} onChange={e => setCounterparty(e.target.value)} placeholder="Counterparty (payee/payer)" className="flex-1 p-2 border rounded text-sm" />
            </div>

            {/* NEW: Parent link */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Link to Parent Transaction (for "Additional" entries)</label>
              <select value={parentLink} onChange={e => setParentLink(e.target.value)} className="w-full p-2 border rounded text-sm">
                <option value="">None — this is a standalone entry</option>
                {transactions.filter(t => !editingId || t.id !== editingId).slice(0, 50).map(t => (
                  <option key={t.id} value={t.id}>{new Date(t.date).toLocaleDateString()} — {t.description} (KES {t.amount})</option>
                ))}
              </select>
            </div>

            {txType === 'expense' && !isBalanceMarker && (
              <>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Expense Breakdown</h3>
                  <ul className="mb-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex justify-between bg-gray-50 p-2 border-b text-sm">
                        <span>{item.name}</span>
                        <div className="flex gap-3">
                          <span>{item.amount.toLocaleString()}</span>
                          <button type="button" onClick={() => handleRemoveItem(i)} className="text-red-500">×</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item" className="w-full p-2 border rounded text-sm" />
                    <input value={itemAmount} onChange={e => setItemAmount(e.target.value)} type="number" placeholder="Amount" className="w-24 p-2 border rounded text-sm" />
                    <button type="button" onClick={handleAddItem} className="bg-blue-600 text-white px-3 rounded text-sm">Save Row</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Transaction Cost (Expense)</label>
                  <input value={txnCost} onChange={e => setTxnCost(e.target.value)} type="number" placeholder="0" className="w-full p-2 border rounded" />
                </div>

                <div className="bg-blue-50 p-3 rounded text-right">
                  <span className="text-sm text-gray-600">Auto-Calculated Expense: </span>
                  <span className="text-lg font-bold text-blue-700">{finalAmount.toLocaleString()} KES</span>
                </div>
              </>
            )}

            {(txType === 'income' || isBalanceMarker) && (
              <input name="amount" type="number" placeholder={isBalanceMarker ? 'Opening Balance Amount (KES)' : 'Total Amount Received (KES)'} required className="w-full p-2 border rounded" />
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input name="date" type="date" required className="w-full p-2 border rounded" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded">{editingId ? 'Update Transaction' : 'Save Transaction'}</button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); loadData(); }} className="bg-gray-300 px-4 rounded">Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* LEDGER */}
        <div className="bg-white p-6 rounded-lg shadow print:shadow-none print:p-0">
          <div className="bg-blue-50 p-4 rounded-lg mb-4 print:hidden space-y-3">
            <h3 className="font-bold text-blue-900 text-sm">Filter Sheet</h3>
            <div className="grid grid-cols-2 gap-2">
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded text-sm">
                <option value="all">All Cash</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
              <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="p-2 border rounded text-sm">
                <option value="month">By Month</option>
                <option value="week">By Week</option>
                <option value="day">By Day</option>
              </select>
            </div>
            <input type={filterPeriod === 'month' ? 'month' : 'date'} value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
          </div>

          <div className="flex gap-4 mb-4 bg-gray-100 p-3 rounded print:bg-white print:border text-sm">
            <div className="flex-1"><span className="text-xs text-gray-500 block">Income</span><span className="font-bold text-green-600">{income.toLocaleString()}</span></div>
            <div className="flex-1"><span className="text-xs text-gray-500 block">Expense</span><span className="font-bold text-red-600">{expenses.toLocaleString()}</span></div>
            <div className="flex-1"><span className="text-xs text-gray-500 block">Txn Costs</span><span className="font-bold text-orange-600">{totalTxnCosts.toLocaleString()}</span></div>
            <div className="flex-1"><span className="text-xs text-gray-500 block">Balance</span><span className="font-bold text-blue-600">{balance.toLocaleString()}</span></div>
          </div>

          <div className="max-h-96 overflow-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2">Date</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right text-green-700">Cash In</th>
                  <th className="p-2 text-right text-red-700">Cash Out</th>
                  <th className="p-2 text-right text-orange-600">Cost</th>
                  <th className="p-2 text-right text-blue-700">Balance</th>
                  <th className="p-2 text-right print:hidden">Edit</th>
                </tr>
              </thead>
              <tbody>
                {displayTransactions.map(tx => (
                  <tr key={tx.id} className={`border-b hover:bg-gray-50 align-top ${tx.isBalanceMarker ? 'bg-yellow-50 font-semibold' : ''}`}>
                    <td className="p-2 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-2">
                      <div className="font-medium">{tx.isBalanceMarker ? '📌 ' : ''}{tx.description}</div>
                      <div className="text-xs text-gray-500">
                        {tx.category}
                        {tx.venue && ` • ${tx.venue}`}
                        {tx.dynamicField && ` • ${tx.dynamicField}`}
                        {tx.reference && ` • Ref: ${tx.reference}`}
                        {tx.counterparty && ` • ${tx.counterparty}`}
                      </div>
                      {tx.items && tx.items.length > 0 && (
                        <ul className="mt-1 pl-2 border-l-2 border-gray-300">
                          {tx.items.map((item: any) => (
                            <li key={item.id} className="text-xs text-gray-600">– {item.name}: {item.amount.toLocaleString()}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="p-2 text-right text-green-600">{tx.type === 'income' && !tx.isBalanceMarker ? tx.amount.toLocaleString() : '—'}</td>
                    <td className="p-2 text-right text-red-600">{tx.type === 'expense' && !tx.isBalanceMarker ? tx.amount.toLocaleString() : '—'}</td>
                    <td className="p-2 text-right text-orange-600">{tx.transactionCost > 0 ? tx.transactionCost : '—'}</td>
                    <td className="p-2 text-right font-semibold text-blue-700">{tx.runningBalance.toLocaleString()}</td>
                    <td className="p-2 text-right print:hidden">
                      {tx.isLocked ? (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">🔒</span>
                      ) : (
                        <button onClick={() => handleEditClick(tx)} className="text-blue-600 text-xs font-bold underline">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
                {displayTransactions.length === 0 && (
                  <tr><td colSpan={7} className="text-center p-4 text-gray-500">No transactions match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
