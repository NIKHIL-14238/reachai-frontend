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

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && (
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-dark-400 mt-0.5">{label}</p>
    </div>
  )
}

const CHART_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fff7ed']

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
    } catch (err) { console.error(err) }
    setLoadingSuggestions(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
  if (!data) return <div className="p-8 text-center text-dark-400"><p className="text-lg font-medium">No data yet</p><p className="text-sm mt-1">Run the seed script to populate demo data.</p></div>

  const { customers, orders, campaigns, segments, revenue_timeline, top_cities } = data
  const formatCurrency = (val) => { const num = Number(val) || 0; if (num >= 100000) return `₹${(num/100000).toFixed(1)}L`; if (num >= 1000) return `₹${(num/1000).toFixed(1)}K`; return `₹${num}` }
  const deliveryRate = campaigns.total_messages_sent > 0 ? ((Number(campaigns.total_delivered) / Number(campaigns.total_messages_sent)) * 100).toFixed(1) + '%' : '—'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-dark-400 mt-0.5">Overview of your customer base and campaign performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Customers" value={Number(customers.total_customers).toLocaleString()} sub={`${customers.new_customers_30d} new`} color="brand" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(customers.total_revenue)} color="green" />
        <StatCard icon={Megaphone} label="Campaigns Sent" value={campaigns.total_campaigns} sub={deliveryRate} color="amber" />
        <StatCard icon={Target} label="Segments" value={segments.total_segments} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-dark-900 rounded-xl border border-dark-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue Timeline</h3>
          {revenue_timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-dark-500 text-center py-10">No revenue data yet</p>}
        </div>

        <div className="bg-dark-900 rounded-xl border border-dark-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Cities</h3>
          {top_cities.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={top_cities} dataKey="count" nameKey="city" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {top_cities.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} /></PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {top_cities.map((city, i) => (
                  <div key={city.city} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} /><span className="text-dark-300">{city.city}</span></div>
                    <span className="font-medium text-white">{city.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-dark-500 text-center py-10">No city data</p>}
        </div>
      </div>

      {Number(campaigns.total_messages_sent) > 0 && (
        <div className="bg-dark-900 rounded-xl border border-dark-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Campaign Delivery Funnel</h3>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Sent', value: campaigns.total_messages_sent, color: 'bg-dark-800 text-dark-300' },
              { label: 'Delivered', value: campaigns.total_delivered, color: 'bg-blue-500/10 text-blue-400' },
              { label: 'Opened', value: campaigns.total_opened, color: 'bg-emerald-500/10 text-emerald-400' },
              { label: 'Clicked', value: campaigns.total_clicked, color: 'bg-brand-500/10 text-brand-400' },
              { label: 'Failed', value: campaigns.total_failed, color: 'bg-red-500/10 text-red-400' },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-4 text-center ${item.color}`}>
                <p className="text-2xl font-bold">{Number(item.value).toLocaleString()}</p>
                <p className="text-xs font-medium mt-1 opacity-70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-dark-900 rounded-xl border border-brand-500/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-brand-400" /><h3 className="text-sm font-semibold text-white">AI Campaign Suggestions</h3></div>
          <button onClick={loadSuggestions} disabled={loadingSuggestions} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
            {loadingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loadingSuggestions ? 'Thinking...' : 'Get Suggestions'}
          </button>
        </div>
        {suggestions ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${s.priority === 'high' ? 'bg-red-500/10 text-red-400' : s.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-dark-700 text-dark-400'}`}>{s.priority}</span>
                  <span className="text-[11px] text-dark-500 font-medium uppercase">{s.channel}</span>
                </div>
                <h4 className="font-semibold text-white text-sm">{s.name}</h4>
                <p className="text-xs text-dark-400 mt-1 leading-relaxed">{s.goal}</p>
                <button onClick={() => navigate('/campaigns/new', { state: { suggestion: s } })} className="mt-3 text-xs font-medium text-brand-400 hover:text-brand-300">Use this idea →</button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-dark-500">Click "Get Suggestions" to let AI analyze your customer data and recommend smart campaigns.</p>}
      </div>
    </div>
  )
}
