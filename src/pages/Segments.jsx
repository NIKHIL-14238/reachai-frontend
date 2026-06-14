import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Sparkles, Loader2, Users, Trash2, Eye, Plus, Wand2 } from 'lucide-react'
import { segmentApi, aiApi } from '../lib/api'

export default function Segments() {
  const navigate = useNavigate()
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [nlQuery, setNlQuery] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [previewCustomers, setPreviewCustomers] = useState(null)
  const [saving, setSaving] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [viewSegment, setViewSegment] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => { fetchSegments() }, [])
  const fetchSegments = async () => { try { const res = await segmentApi.list(); setSegments(res.segments) } catch (err) { console.error(err) } setLoading(false) }

  const handleAISegment = async () => {
    if (!nlQuery.trim()) return; setAiLoading(true); setAiResult(null); setPreviewCustomers(null)
    try { const result = await aiApi.segment(nlQuery); setAiResult(result); setSegmentName(result.suggested_name); const preview = await segmentApi.preview(result.filter_query); setPreviewCustomers(preview.customers) }
    catch (err) { setAiResult({ error: err.message }) } setAiLoading(false)
  }

  const handleSaveSegment = async () => {
    if (!aiResult || !segmentName) return; setSaving(true)
    try { await segmentApi.create({ name: segmentName, description: nlQuery, filter_query: aiResult.filter_query, natural_language_query: nlQuery }); setShowCreate(false); setNlQuery(''); setAiResult(null); setPreviewCustomers(null); setSegmentName(''); fetchSegments() }
    catch (err) { console.error(err) } setSaving(false)
  }

  const handleDelete = async (id) => { if (!confirm('Delete this segment?')) return; try { await segmentApi.delete(id); fetchSegments(); if (viewSegment?.id === id) setViewSegment(null) } catch (err) { console.error(err) } }
  const handleView = async (id) => { setViewLoading(true); try { const res = await segmentApi.get(id); setViewSegment(res) } catch (err) { console.error(err) } setViewLoading(false) }

  const presets = ['High-value customers who spent more than ₹10,000','Women from Mumbai under 30','Inactive customers who haven\'t ordered in 90 days','New customers who joined in the last month','VIP customers with more than 5 orders','Male customers from Bangalore or Delhi']

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Segments</h1><p className="text-sm text-dark-400 mt-0.5">Create audience segments using AI-powered natural language</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 flex items-center gap-2"><Plus className="w-4 h-4" /> New Segment</button>
      </div>

      {showCreate && (
        <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-orange-700 px-6 py-4">
            <div className="flex items-center gap-2 text-white"><Sparkles className="w-5 h-5" /><h2 className="font-semibold">AI Segment Builder</h2></div>
            <p className="text-brand-100 text-sm mt-1">Describe your audience in plain English — AI will find the matching customers</p>
          </div>
          <div className="p-6 space-y-4">
            <div><label className="block text-sm font-medium text-dark-300 mb-1.5">Describe your target audience</label>
              <div className="flex gap-2">
                <input type="text" value={nlQuery} onChange={(e) => setNlQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAISegment()} placeholder="e.g. Women from Mumbai who spent more than ₹5,000" className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button onClick={handleAISegment} disabled={aiLoading || !nlQuery.trim()} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}{aiLoading ? 'Analyzing...' : 'Find Audience'}</button>
              </div>
            </div>
            <div><p className="text-xs text-dark-500 font-medium mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">{presets.map((p) => <button key={p} onClick={() => setNlQuery(p)} className="text-xs px-3 py-1.5 bg-dark-800 text-dark-400 rounded-full hover:bg-dark-700 border border-dark-700">{p}</button>)}</div>
            </div>
            {aiResult && !aiResult.error && (
              <div className="border border-brand-500/30 bg-brand-500/5 rounded-lg p-4 space-y-3">
                <span className="text-sm font-semibold text-brand-400">Found {aiResult.customer_count} matching customers</span>
                <div><p className="text-xs text-dark-500 mb-1">Generated filter:</p><code className="text-xs bg-dark-800 px-3 py-2 rounded border border-dark-700 block text-dark-300 font-mono">WHERE {aiResult.filter_query}</code></div>
                <div><label className="block text-xs text-dark-500 mb-1">Segment name:</label><input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)} className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
                {previewCustomers && previewCustomers.length > 0 && <div><p className="text-xs text-dark-500 mb-2">Preview:</p><div className="space-y-1.5">{previewCustomers.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-dark-800 rounded-lg px-3 py-2 text-sm"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 text-[10px] font-bold">{c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><span className="text-dark-200">{c.name}</span><span className="text-dark-500 text-xs">{c.city}</span></div><span className="text-xs text-dark-400">₹{Number(c.total_spent).toLocaleString()}</span></div>))}</div></div>}
                <button onClick={handleSaveSegment} disabled={saving} className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}{saving ? 'Saving...' : `Save Segment (${aiResult.customer_count} customers)`}</button>
              </div>)}
            {aiResult?.error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">{aiResult.error}</div>}
          </div>
        </div>)}

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
      : segments.length === 0 ? <div className="bg-dark-900 rounded-xl border border-dark-800 p-12 text-center"><Target className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400 font-medium">No segments yet</p></div>
      : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{segments.map((seg) => (
          <div key={seg.id} className="bg-dark-900 rounded-xl border border-dark-800 p-5 hover:border-brand-500/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center"><Target className="w-5 h-5 text-brand-400" /></div>
              <div className="flex gap-1">
                <button onClick={() => handleView(seg.id)} className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-500 hover:text-dark-300"><Eye className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(seg.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-white">{seg.name}</h3>
            {seg.natural_language_query && <p className="text-xs text-dark-500 mt-1 italic">"{seg.natural_language_query}"</p>}
            <div className="flex items-center gap-2 mt-3"><Users className="w-3.5 h-3.5 text-dark-500" /><span className="text-sm font-medium text-dark-300">{seg.customer_count} customers</span></div>
            <div className="mt-3 pt-3 border-t border-dark-800 flex justify-between items-center">
              <span className="text-xs text-dark-500">{new Date(seg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <button onClick={() => navigate('/campaigns/new', { state: { segment: seg } })} className="text-xs font-medium text-brand-400 hover:text-brand-300">Create Campaign →</button>
            </div>
          </div>))}</div>}

      {viewSegment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setViewSegment(null)}>
          <div className="bg-dark-900 rounded-xl w-full max-w-lg max-h-[80vh] overflow-auto border border-dark-700" onClick={e => e.stopPropagation()}>
            {viewLoading ? <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></div>
            : <><div className="p-5 border-b border-dark-800"><h2 className="text-lg font-bold text-white">{viewSegment.name}</h2><p className="text-sm text-dark-400 mt-1">{viewSegment.customer_count} customers</p></div>
              <div className="p-5 space-y-2 max-h-96 overflow-auto">{viewSegment.members?.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-800">
                  <div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 text-[10px] font-bold">{m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><p className="text-sm font-medium text-dark-200">{m.name}</p><p className="text-xs text-dark-500">{m.email}</p></div></div><span className="text-xs text-dark-500">{m.city}</span></div>))}</div>
              <div className="p-4 border-t border-dark-800 text-right"><button onClick={() => setViewSegment(null)} className="text-sm text-dark-400 hover:text-dark-200">Close</button></div></>}
          </div>
        </div>)}
    </div>
  )
}
