import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Target, Megaphone, Zap,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Segments from './pages/Segments'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import NewCampaign from './pages/NewCampaign'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/segments', icon: Target, label: 'Segments' },
  { path: '/campaigns', icon: Megaphone, label: 'Campaigns' },
]

export default function App() {
  return (
    <div className="flex h-screen bg-dark-950">
      <aside className="w-60 bg-dark-900 border-r border-dark-800 flex flex-col">
        <div className="p-5 border-b border-dark-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">ReachAI</h1>
              <p className="text-[10px] text-dark-400 font-medium tracking-widest uppercase">CRM Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200 border border-transparent'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-800">
          <div className="bg-dark-800/50 rounded-lg p-3 border border-dark-700/50">
            <p className="text-xs font-bold text-brand-400">StyleVerse</p>
            <p className="text-[10px] text-dark-500 mt-0.5">Fashion D2C Brand</p>
          </div>
        </div>
      </aside>

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
