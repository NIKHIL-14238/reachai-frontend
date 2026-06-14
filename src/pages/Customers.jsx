import { useState, useEffect, useCallback } from 'react'
import { Users, Search, ChevronLeft, ChevronRight, ShoppingBag, Mail, Phone, MapPin, Loader2, Megaphone } from 'lucide-react'
import { customerApi } from '../lib/api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchCustomers = useCallback(async (page = 1, searchTerm = '') => {
    setLoading(true)
    try {
      const params = { page, limit: 30 }
      if (searchTerm) params.search = searchTerm
      const res = await customerApi.list(params)
      setCustomers(res.customers)
      setPagination(res.pagination)
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])
  useEffect(() => { const t = setTimeout(() => fetchCustomers(1, search), 300); return () => clearTimeout(t) }, [search, fetchCustomers])

  const viewCustomer = async (id) => { setDetailLoading(true); try { const res = await customerApi.get(id); setSelected(res) } catch (err) { console.error(err) } setDetailLoading(false) }
  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`

  return (
    <div className="flex h-full">
      <div className={`flex-1 flex flex-col ${selected ? 'border-r border-dark-800' : ''}`}>
        <div className="p-6 border-b border-dark-800 bg-dark-900">
          <div className="flex items-center justify-between mb-4">
            <div><h1 className="text-2xl font-bold text-white">Customers</h1><p className="text-sm text-dark-400 mt-0.5">{pagination.total} shoppers in your database</p></div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input type="text" placeholder="Search by name, email, or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
          : customers.length === 0 ? <div className="text-center py-20 text-dark-500"><Users className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="font-medium">No customers found</p></div>
          : <table className="w-full">
              <thead className="bg-dark-900/50 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">City</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Spent</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/50">
                {customers.map((c) => (
                  <tr key={c.id} onClick={() => viewCustomer(c.id)} className={`cursor-pointer hover:bg-dark-800/50 transition-colors ${selected?.id === c.id ? 'bg-brand-500/5' : ''}`}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-bold">{c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div><p className="text-sm font-medium text-white">{c.name}</p><p className="text-xs text-dark-500">{c.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-dark-400">{c.city || '—'}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-white text-right">{formatCurrency(c.total_spent)}</td>
                    <td className="px-6 py-3.5 text-sm text-dark-400 text-right">{c.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-dark-800 bg-dark-900 flex items-center justify-between">
            <span className="text-sm text-dark-400">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => fetchCustomers(pagination.page - 1, search)} disabled={pagination.page <= 1} className="p-2 rounded-lg border border-dark-700 disabled:opacity-30 hover:bg-dark-800 text-dark-400"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchCustomers(pagination.page + 1, search)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg border border-dark-700 disabled:opacity-30 hover:bg-dark-800 text-dark-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="w-96 overflow-auto bg-dark-900">
          {detailLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
          : <div className="p-6">
              <button onClick={() => setSelected(null)} className="text-xs text-dark-500 hover:text-dark-300 mb-4">✕ Close</button>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 text-xl font-bold mx-auto mb-3">{selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                <p className="text-sm text-dark-500">{selected.gender}, {selected.age} years</p>
              </div>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2.5 text-sm text-dark-300"><Mail className="w-4 h-4 text-dark-500" /> {selected.email}</div>
                {selected.phone && <div className="flex items-center gap-2.5 text-sm text-dark-300"><Phone className="w-4 h-4 text-dark-500" /> {selected.phone}</div>}
                {selected.city && <div className="flex items-center gap-2.5 text-sm text-dark-300"><MapPin className="w-4 h-4 text-dark-500" /> {selected.city}</div>}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-dark-800 rounded-lg p-3 text-center"><p className="text-lg font-bold text-white">{formatCurrency(selected.total_spent)}</p><p className="text-xs text-dark-500">Total Spent</p></div>
                <div className="bg-dark-800 rounded-lg p-3 text-center"><p className="text-lg font-bold text-white">{selected.order_count}</p><p className="text-xs text-dark-500">Orders</p></div>
              </div>
              {selected.orders && selected.orders.length > 0 && (
                <div><h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Recent Orders</h3>
                  <div className="space-y-2">{selected.orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="border border-dark-700 rounded-lg p-3">
                      <div className="flex justify-between items-start"><div><p className="text-sm font-medium text-white">{formatCurrency(o.amount)}</p><p className="text-xs text-dark-500 mt-0.5">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                        <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{o.status}</span></div>
                      {o.items && Array.isArray(o.items) && o.items.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{o.items.map((item, idx) => <span key={idx} className="text-[11px] bg-dark-800 text-dark-400 px-2 py-0.5 rounded">{item.name}</span>)}</div>}
                    </div>))}</div></div>)}
            </div>}
        </div>
      )}
    </div>
  )
}
