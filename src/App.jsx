import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Target, Megaphone, Sparkles,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Segments from './pages/Segments'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import NewCampaign from './pages/NewCampaign'

// Navigation items for the sidebar
const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/segments', icon: Target, label: 'Segments' },
  { path: '/campaigns', icon: Megaphone, label: 'Campaigns' },
]

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* ---- Sidebar ---- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">ReachAI</h1>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Smart CRM</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-brand-50 to-indigo-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-brand-700">StyleVerse</p>
            <p className="text-[11px] text-brand-500 mt-0.5">Fashion D2C Brand</p>
          </div>
        </div>
      </aside>

      {/* ---- Main Content ---- */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/segments" element={<Segments />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<NewCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
