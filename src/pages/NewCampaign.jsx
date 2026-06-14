import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Sparkles, Loader2, Send, Mail, MessageSquare, Smartphone, Radio, Wand2 } from 'lucide-react'
import { segmentApi, campaignApi, aiApi } from '../lib/api'

const channels = [
  { id: 'email', label: 'Email', icon: Mail, desc: 'Best for detailed messages' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, desc: '160 char limit' },
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone, desc: 'Conversational reach' },
  { id: 'rcs', label: 'RCS', icon: Radio, desc: 'Rich interactive messages' },
]

export default function NewCampaign() {
  const navigate = useNavigate()
  const location = useLocation()
  const suggestion = location.state?.suggestion
  const preselectedSegment = location.state?.segment
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [name, setName] = useState(suggestion?.name || '')
  const [segmentId, setSegmentId] = useState(preselectedSegment?.id || '')
  const [channel, setChannel] = useState(suggestion?.channel || 'email')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [campaignGoal, setCampaignGoal] = useState(suggestion?.goal || '')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { segmentApi.list().then(res => { setSegments(res.segments); if (preselectedSegment) setSegmentId(String(preselectedSegment.id)) }).catch(console.error).finally(() => setLoading(false)) }, [preselectedSegment])

  const handleAIDraft = async () => {
    if (!campaignGoal.trim()) return; setAiLoading(true)
    try { const selectedSeg = segments.find(s => String(s.id) === String(segmentId)); const result = await aiApi.message({ campaign_goal: campaignGoal, segment_description: selectedSeg?.natural_language_query || selectedSeg?.name || '', channel, brand_name: 'StyleVerse', tone: 'friendly and youthful' }); if (result.subject) setSubject(result.subject); if (result.message) setMessage(result.message) }
    catch (err) { console.error(err) } setAiLoading(false)
  }

  const handleSend = async () => {
    if (!name || !segmentId || !message) return; setSending(true)
    try { const campaign = await campaignApi.create({ name, segment_id: parseInt(segmentId), channel, subject: channel === 'email' ? subject : undefined, message_template: message }); await campaignApi.send(campaign.id); navigate(`/campaigns/${campaign.id}`) }
    catch (err) { console.error(err); alert('Failed: ' + err.message) } setSending(false)
  }

  const handleSaveDraft = async () => {
    if (!name || !segmentId || !message) return
    try { await campaignApi.create({ name, segment_id: parseInt(segmentId), channel, subject: channel === 'email' ? subject : undefined, message_template: message }); navigate('/campaigns') }
    catch (err) { console.error(err) }
  }

  const selectedSeg = segments.find(s => String(s.id) === String(segmentId))

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/campaigns')} className="p-2 rounded-lg hover:bg-dark-800"><ArrowLeft className="w-5 h-5 text-dark-400" /></button>
        <div><h1 className="text-2xl font-bold text-white">New Campaign</h1><p className="text-sm text-dark-400 mt-0.5">Set up and launch a personalized campaign</p></div>
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
      : <div className="space-y-5">
          <div className="bg-dark-900 rounded-xl border border-dark-800 p-5">
            <label className="block text-sm font-semibold text-white mb-1.5">Campaign Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Sale for VIP Customers" className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>

          <div className="bg-dark-900 rounded-xl border border-dark-800 p-5">
            <label className="block text-sm font-semibold text-white mb-1.5">Target Segment</label>
            {segments.length === 0 ? <div className="text-center py-4"><p className="text-sm text-dark-500">No segments yet.</p><button onClick={() => navigate('/segments')} className="text-sm text-brand-400 hover:text-brand-300 mt-1">Create a segment first →</button></div>
            : <select value={segmentId} onChange={(e) => setSegmentId(e.target.value)} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select a segment...</option>
                {segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s.customer_count} customers)</option>)}
              </select>}
          </div>

          <div className="bg-dark-900 rounded-xl border border-dark-800 p-5">
            <label className="block text-sm font-semibold text-white mb-3">Channel</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{channels.map(ch => {
              const Icon = ch.icon; const isActive = channel === ch.id
              return <button key={ch.id} onClick={() => setChannel(ch.id)} className={`p-3 rounded-lg border-2 text-left transition-all ${isActive ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700 hover:border-dark-600'}`}>
                <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-brand-400' : 'text-dark-500'}`} />
                <p className={`text-sm font-medium ${isActive ? 'text-brand-300' : 'text-dark-300'}`}>{ch.label}</p>
                <p className="text-[11px] text-dark-500 mt-0.5">{ch.desc}</p></button>})}</div>
          </div>

          <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600/20 to-orange-600/10 p-4 border-b border-dark-800">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-400" /><h3 className="text-sm font-semibold text-white">AI Message Composer</h3></div>
              <p className="text-xs text-dark-400 mt-1">Describe your campaign goal and let AI draft the message</p>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-dark-400 mb-1.5">Campaign goal</label>
                <div className="flex gap-2"><input type="text" value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)} placeholder="e.g. Re-engage dormant customers with a 20% off coupon" className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <button onClick={handleAIDraft} disabled={aiLoading || !campaignGoal.trim()} className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 shrink-0">{aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}Draft</button></div></div>
              {channel === 'email' && <div><label className="block text-xs font-medium text-dark-400 mb-1.5">Subject line</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. We miss you! Here's 20% off" className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>}
              <div><label className="block text-xs font-medium text-dark-400 mb-1.5">Message {channel === 'sms' && `(${message.length}/160)`}</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Type your message... Use {{name}} for personalization.`} rows={6} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                <p className="text-[11px] text-dark-500 mt-1">Use {"{{name}}"} to personalize</p></div>
            </div>
          </div>

          {message && selectedSeg && <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
            <p className="text-xs text-dark-500 mb-2 uppercase tracking-wider font-medium">Preview</p>
            {subject && <p className="text-sm font-medium text-dark-300 mb-1">Subject: {subject}</p>}
            <p className="text-sm leading-relaxed text-dark-200 whitespace-pre-wrap">{message.replace(/\{\{name\}\}/gi, 'Ananya Sharma')}</p>
            <p className="text-xs text-dark-500 mt-3">Sending via {channel.toUpperCase()} to {selectedSeg.customer_count} customers in "{selectedSeg.name}"</p>
          </div>}

          <div className="flex gap-3 justify-end">
            <button onClick={handleSaveDraft} disabled={!name || !segmentId || !message} className="px-5 py-2.5 border border-dark-700 text-dark-300 text-sm font-medium rounded-lg hover:bg-dark-800 disabled:opacity-30">Save Draft</button>
            <button onClick={handleSend} disabled={sending || !name || !segmentId || !message} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Campaign</>}</button>
          </div>
        </div>}
    </div>
  )
}
