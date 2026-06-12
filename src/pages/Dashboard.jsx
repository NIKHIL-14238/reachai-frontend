import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, ShoppingBag, Megaphone, Target, TrendingUp,
  ArrowUpRight, Sparkles, Loader2, IndianRupee,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { analyticsApi, aiApi } from '../lib/api'

// Reusable stat card component
function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

const CHART_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff']

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.overview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const res = await aiApi.suggest()
      setSuggestions(res.suggestions)
    } catch (err) {
      console.error('Failed to load suggestions:', err)
    }
    setLoadingSuggestions(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">No data yet</p>
        <p className="text-sm mt-1">Run the seed script to populate demo data.</p>
      </div>
    )
  }

  const { customers, orders, campaigns, segments, revenue_timeline, top_cities } = data

  const formatCurrency = (val) => {
    const num = Number(val) || 0
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
    return `₹${num}`
  }

  const deliveryRate = campaigns.total_messages_sent > 0
    ? ((Number(campaigns.total_delivered) / Number(campaigns.total_messages_sent)) * 100).toFixed(1) + '%'
    : '—'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your customer base and campaign performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Customers" value={Number(customers.total_customers).toLocaleString()} sub={`${customers.new_customers_30d} new`} color="brand" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(customers.total_revenue)} color="green" />
        <StatCard icon={Megaphone} label="Campaigns Sent" value={campaigns.total_campaigns} sub={deliveryRate} color="amber" />
        <StatCard icon={Target} label="Segments" value={segments.total_segments} color="rose" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue Timeline</h3>
          {revenue_timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No revenue data yet</p>
          )}
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Cities</h3>
          {top_cities.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={top_cities} dataKey="count" nameKey="city" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {top_cities.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {top_cities.map((city, i) => (
                  <div key={city.city} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                      <span className="text-gray-700">{city.city}</span>
                    </div>
                    <span className="font-medium text-gray-900">{city.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No city data</p>
          )}
        </div>
      </div>

      {/* Campaign Performance */}
      {Number(campaigns.total_messages_sent) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign Delivery Funnel</h3>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Sent', value: campaigns.total_messages_sent, color: 'bg-gray-100 text-gray-700' },
              { label: 'Delivered', value: campaigns.total_delivered, color: 'bg-blue-50 text-blue-700' },
              { label: 'Opened', value: campaigns.total_opened, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Clicked', value: campaigns.total_clicked, color: 'bg-brand-50 text-brand-700' },
              { label: 'Failed', value: campaigns.total_failed, color: 'bg-red-50 text-red-700' },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-4 text-center ${item.color}`}>
                <p className="text-2xl font-bold">{Number(item.value).toLocaleString()}</p>
                <p className="text-xs font-medium mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Campaign Suggestions */}
      <div className="bg-gradient-to-r from-brand-50 via-indigo-50 to-violet-50 rounded-xl border border-brand-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-semibold text-gray-900">AI Campaign Suggestions</h3>
          </div>
          <button
            onClick={loadSuggestions}
            disabled={loadingSuggestions}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {loadingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loadingSuggestions ? 'Thinking...' : 'Get Suggestions'}
          </button>
        </div>

        {suggestions ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    s.priority === 'high' ? 'bg-red-50 text-red-600'
                      : s.priority === 'medium' ? 'bg-amber-50 text-amber-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.priority}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium uppercase">{s.channel}</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{s.name}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.goal}</p>
                <button
                  onClick={() => navigate('/campaigns/new', { state: { suggestion: s } })}
                  className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Use this idea →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Click "Get Suggestions" to let AI analyze your customer data and recommend smart campaigns.
          </p>
        )}
      </div>
    </div>
  )
}
