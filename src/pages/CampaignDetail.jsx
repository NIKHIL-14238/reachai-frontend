import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, RefreshCw, CheckCircle2, XCircle,
  Eye, MousePointer, Send, Clock,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import { campaignApi } from '../lib/api'

const statusColors = {
  sent: '#94a3b8',
  delivered: '#3b82f6',
  opened: '#10b981',
  clicked: '#6366f1',
  failed: '#ef4444',
  read: '#10b981',
  queued: '#d1d5db',
}

const statusIcons = {
  sent: Send,
  delivered: CheckCircle2,
  opened: Eye,
  read: Eye,
  clicked: MousePointer,
  failed: XCircle,
  queued: Clock,
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const [camRes, logsRes] = await Promise.all([
        campaignApi.get(id),
        campaignApi.logs(id),
      ])
      setCampaign(camRes)
      setLogs(logsRes.logs)
    } catch (err) {
      console.error('Failed to fetch campaign:', err)
    }
    setLoading(false)
    setRefreshing(false)
  }, [id])

  useEffect(() => {
    fetchData()
    // Auto-refresh every 3 seconds if campaign is sending (to show real-time delivery updates)
    const interval = setInterval(() => {
      fetchData()
    }, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    )
  }

  // Calculate stats
  const totalSent = Number(campaign.total_sent) || 0
  const delivered = Number(campaign.total_delivered) || 0
  const opened = Number(campaign.total_opened) || 0
  const clicked = Number(campaign.total_clicked) || 0
  const failed = Number(campaign.total_failed) || 0
  const pending = Math.max(0, totalSent - delivered - failed)

  const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : 0
  const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : 0
  const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : 0

  // Pie chart data
  const pieData = [
    { name: 'Delivered', value: Math.max(0, delivered - opened), fill: statusColors.delivered },
    { name: 'Opened', value: Math.max(0, opened - clicked), fill: statusColors.opened },
    { name: 'Clicked', value: clicked, fill: statusColors.clicked },
    { name: 'Failed', value: failed, fill: statusColors.failed },
    { name: 'Pending', value: pending, fill: '#e2e8f0' },
  ].filter(d => d.value > 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/campaigns')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm text-gray-400 capitalize">{campaign.channel}</span>
              {campaign.segment_name && (
                <span className="text-sm text-gray-400">→ {campaign.segment_name}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                campaign.status === 'completed' ? 'bg-emerald-50 text-emerald-600'
                  : campaign.status === 'sending' ? 'bg-amber-50 text-amber-600'
                  : campaign.status === 'draft' ? 'bg-gray-100 text-gray-600'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {campaign.status === 'sending' && '● '}{campaign.status}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      {totalSent > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Sent', value: totalSent, color: 'text-gray-700', bg: 'bg-gray-50' },
            { label: 'Delivered', value: delivered, sub: `${deliveryRate}%`, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Opened', value: opened, sub: `${openRate}%`, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Clicked', value: clicked, sub: `${clickRate}%`, color: 'text-brand-700', bg: 'bg-brand-50' },
            { label: 'Failed', value: failed, color: 'text-red-700', bg: 'bg-red-50' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.bg}`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {stat.label} {stat.sub && <span className="font-medium">({stat.sub})</span>}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart + Message Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delivery Chart */}
        {totalSent > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                  {d.name}: {d.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Message Template</h3>
          {campaign.subject && (
            <p className="text-xs text-gray-400 mb-1">Subject: {campaign.subject}</p>
          )}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {campaign.message_template}
            </p>
          </div>
          {campaign.sent_at && (
            <p className="text-xs text-gray-400 mt-3">
              Sent on {new Date(campaign.sent_at).toLocaleString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </div>

      {/* Delivery Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Delivery Log ({logs.length} messages)
            </h3>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase">Recipient</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Channel</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Delivered</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const StatusIcon = statusIcons[log.status] || Clock
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-800">{log.customer_name}</p>
                        <p className="text-xs text-gray-400">{log.recipient}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 uppercase font-medium">{log.channel}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: statusColors[log.status] }}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {log.status}
                        </span>
                        {log.failure_reason && (
                          <p className="text-[11px] text-red-400 mt-0.5">{log.failure_reason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {log.delivered_at ? new Date(log.delivered_at).toLocaleTimeString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {log.opened_at ? new Date(log.opened_at).toLocaleTimeString('en-IN') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
