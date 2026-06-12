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
    } catch (err) {
      console.error('Failed to fetch customers:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1, search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchCustomers])

  const viewCustomer = async (id) => {
    setDetailLoading(true)
    try {
      const res = await customerApi.get(id)
      setSelected(res)
    } catch (err) {
      console.error('Failed to fetch customer:', err)
    }
    setDetailLoading(false)
  }

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`

  return (
    <div className="flex h-full">
      {/* Customer List */}
      <div className={`flex-1 flex flex-col ${selected ? 'border-r border-gray-200' : ''}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-500 mt-0.5">{pagination.total} shoppers in your database</p>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No customers found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Spent</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => viewCustomer(c.id)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selected?.id === c.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{c.city || '—'}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900 text-right">{formatCurrency(c.total_spent)}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-600 text-right">{c.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchCustomers(pagination.page - 1, search)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchCustomers(pagination.page + 1, search)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Panel */}
      {selected && (
        <div className="w-96 overflow-auto bg-white">
          {detailLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="p-6">
              {/* Close button */}
              <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 mb-4">✕ Close</button>
              
              {/* Profile */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold mx-auto mb-3">
                  {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                <p className="text-sm text-gray-400">{selected.gender}, {selected.age} years</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" /> {selected.email}
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {selected.phone}
                  </div>
                )}
                {selected.city && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" /> {selected.city}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selected.total_spent)}</p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selected.order_count}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
              </div>

              {/* Order History */}
              {selected.orders && selected.orders.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Recent Orders
                  </h3>
                  <div className="space-y-2">
                    {selected.orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(o.amount)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-[11px] font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                            {o.status}
                          </span>
                        </div>
                        {o.items && Array.isArray(o.items) && o.items.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {o.items.map((item, idx) => (
                              <span key={idx} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {item.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication History */}
              {selected.communications && selected.communications.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Message History
                  </h3>
                  <div className="space-y-2">
                    {selected.communications.slice(0, 5).map((comm) => (
                      <div key={comm.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600 uppercase">{comm.channel}</span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            comm.status === 'delivered' ? 'bg-blue-50 text-blue-600'
                              : comm.status === 'opened' ? 'bg-emerald-50 text-emerald-600'
                              : comm.status === 'clicked' ? 'bg-brand-50 text-brand-600'
                              : comm.status === 'failed' ? 'bg-red-50 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {comm.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
