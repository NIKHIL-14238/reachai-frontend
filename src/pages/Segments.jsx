import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, Sparkles, Loader2, Users, Trash2, Eye, Plus, Wand2,
} from 'lucide-react'
import { segmentApi, aiApi } from '../lib/api'

export default function Segments() {
  const navigate = useNavigate()
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  // AI segment builder state
  const [nlQuery, setNlQuery] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [previewCustomers, setPreviewCustomers] = useState(null)
  const [saving, setSaving] = useState(false)
  const [segmentName, setSegmentName] = useState('')

  // View segment detail
  const [viewSegment, setViewSegment] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    try {
      const res = await segmentApi.list()
      setSegments(res.segments)
    } catch (err) {
      console.error('Failed to fetch segments:', err)
    }
    setLoading(false)
  }

  // ---- AI Segment Builder ----
  // This is the main AI-native feature:
  // User types natural language → AI converts to SQL → Preview → Save
  const handleAISegment = async () => {
    if (!nlQuery.trim()) return
    setAiLoading(true)
    setAiResult(null)
    setPreviewCustomers(null)

    try {
      // Step 1: AI converts natural language → SQL filter
      const result = await aiApi.segment(nlQuery)
      setAiResult(result)
      setSegmentName(result.suggested_name)

      // Step 2: Preview matching customers
      const preview = await segmentApi.preview(result.filter_query)
      setPreviewCustomers(preview.customers)
    } catch (err) {
      console.error('AI segment failed:', err)
      setAiResult({ error: err.message })
    }
    setAiLoading(false)
  }

  const handleSaveSegment = async () => {
    if (!aiResult || !segmentName) return
    setSaving(true)
    try {
      await segmentApi.create({
        name: segmentName,
        description: nlQuery,
        filter_query: aiResult.filter_query,
        natural_language_query: nlQuery,
      })
      setShowCreate(false)
      setNlQuery('')
      setAiResult(null)
      setPreviewCustomers(null)
      setSegmentName('')
      fetchSegments()
    } catch (err) {
      console.error('Failed to save segment:', err)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this segment?')) return
    try {
      await segmentApi.delete(id)
      fetchSegments()
      if (viewSegment?.id === id) setViewSegment(null)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const handleView = async (id) => {
    setViewLoading(true)
    try {
      const res = await segmentApi.get(id)
      setViewSegment(res)
    } catch (err) {
      console.error('Failed to load segment:', err)
    }
    setViewLoading(false)
  }

  // Preset query suggestions for quick use
  const presets = [
    'High-value customers who spent more than ₹10,000',
    'Women from Mumbai under 30',
    'Inactive customers who haven\'t ordered in 90 days',
    'New customers who joined in the last month',
    'VIP customers with more than 5 orders',
    'Male customers from Bangalore or Delhi',
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create audience segments using AI-powered natural language</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Segment
        </button>
      </div>

      {/* AI Segment Builder */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-semibold">AI Segment Builder</h2>
            </div>
            <p className="text-brand-100 text-sm mt-1">
              Describe your audience in plain English — AI will find the matching customers
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Natural language input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Describe your target audience
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISegment()}
                  placeholder="e.g. Women from Mumbai who spent more than ₹5,000"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleAISegment}
                  disabled={aiLoading || !nlQuery.trim()}
                  className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {aiLoading ? 'Analyzing...' : 'Find Audience'}
                </button>
              </div>
            </div>

            {/* Quick presets */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => { setNlQuery(preset); }}
                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 border border-gray-100 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Result */}
            {aiResult && !aiResult.error && (
              <div className="border border-brand-100 bg-brand-50/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-700">
                    🎯 Found {aiResult.customer_count} matching customers
                  </span>
                </div>

                {/* Generated SQL (educational - shows what AI created) */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Generated filter:</p>
                  <code className="text-xs bg-white px-3 py-2 rounded border border-gray-200 block text-gray-700 font-mono">
                    WHERE {aiResult.filter_query}
                  </code>
                </div>

                {/* Segment name */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Segment name:</label>
                  <input
                    type="text"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Preview of matched customers */}
                {previewCustomers && previewCustomers.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Preview (showing {Math.min(previewCustomers.length, 5)}):</p>
                    <div className="space-y-1.5">
                      {previewCustomers.slice(0, 5).map((c) => (
                        <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-[10px] font-bold">
                              {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-gray-800">{c.name}</span>
                            <span className="text-gray-400 text-xs">{c.city}</span>
                          </div>
                          <span className="text-xs text-gray-500">₹{Number(c.total_spent).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={handleSaveSegment}
                  disabled={saving}
                  className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                  {saving ? 'Saving...' : `Save Segment (${aiResult.customer_count} customers)`}
                </button>
              </div>
            )}

            {/* Error state */}
            {aiResult?.error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-600">
                {aiResult.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Segments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : segments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No segments yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first audience segment using the AI builder above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <div key={seg.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleView(seg.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(seg.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900">{seg.name}</h3>
              {seg.natural_language_query && (
                <p className="text-xs text-gray-400 mt-1 italic">"{seg.natural_language_query}"</p>
              )}

              <div className="flex items-center gap-2 mt-3">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">{seg.customer_count} customers</span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(seg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                <button
                  onClick={() => navigate('/campaigns/new', { state: { segment: seg } })}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Create Campaign →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Segment Detail Modal */}
      {viewSegment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setViewSegment(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {viewLoading ? (
              <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" /></div>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">{viewSegment.name}</h2>
                  {viewSegment.natural_language_query && (
                    <p className="text-sm text-gray-400 mt-0.5 italic">"{viewSegment.natural_language_query}"</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{viewSegment.customer_count} customers</p>
                </div>
                <div className="p-5 space-y-2 max-h-96 overflow-auto">
                  {viewSegment.members?.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-[10px] font-bold">
                          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{m.city}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100 text-right">
                  <button onClick={() => setViewSegment(null)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
