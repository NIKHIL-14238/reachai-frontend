import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Megaphone, Plus, Loader2, Send, Eye, CheckCircle2,
  AlertCircle, Clock, Mail, MessageSquare, Smartphone,
} from 'lucide-react'
import { campaignApi } from '../lib/api'

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Smartphone,
  rcs: Smartphone,
}

const statusStyles = {
  draft: 'bg-gray-100 text-gray-600',
  sending: 'bg-amber-50 text-amber-600',
  sent: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  failed: 'bg-red-50 text-red-600',
}

const statusIcons = {
  draft: Clock,
  sending: Loader2,
  sent: Send,
  completed: CheckCircle2,
  failed: AlertCircle,
}

export default function Campaigns() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    campaignApi.list()
      .then(res => setCampaigns(res.campaigns))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and send personalized campaigns to your segments</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No campaigns yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first campaign to start reaching your customers</p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="mt-4 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((cam) => {
            const ChannelIcon = channelIcons[cam.channel] || Mail
            const StatusIcon = statusIcons[cam.status] || Clock
            const totalSent = Number(cam.total_sent) || 0
            const deliveryRate = totalSent > 0 ? ((Number(cam.total_delivered) / totalSent) * 100).toFixed(1) : 0
            const openRate = Number(cam.total_delivered) > 0 ? ((Number(cam.total_opened) / Number(cam.total_delivered)) * 100).toFixed(1) : 0

            return (
              <div
                key={cam.id}
                onClick={() => navigate(`/campaigns/${cam.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-200 cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center">
                      <ChannelIcon className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cam.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {cam.segment_name && (
                          <span className="text-xs text-gray-400">
                            → {cam.segment_name} ({cam.audience_size || '?'} customers)
                          </span>
                        )}
                        <span className="text-xs text-gray-400 capitalize">{cam.channel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${statusStyles[cam.status] || statusStyles.draft}`}>
                      <StatusIcon className={`w-3 h-3 ${cam.status === 'sending' ? 'animate-spin' : ''}`} />
                      {cam.status}
                    </span>
                  </div>
                </div>

                {/* Stats row - only show if campaign has been sent */}
                {totalSent > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-5 gap-4">
                    {[
                      { label: 'Sent', value: totalSent },
                      { label: 'Delivered', value: cam.total_delivered, pct: deliveryRate },
                      { label: 'Opened', value: cam.total_opened, pct: openRate },
                      { label: 'Clicked', value: cam.total_clicked },
                      { label: 'Failed', value: cam.total_failed },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <p className="text-lg font-bold text-gray-800">{Number(stat.value).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {stat.label}
                          {stat.pct ? ` (${stat.pct}%)` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-3 text-xs text-gray-400">
                  {cam.sent_at
                    ? `Sent ${new Date(cam.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                    : `Created ${new Date(cam.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                  }
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
