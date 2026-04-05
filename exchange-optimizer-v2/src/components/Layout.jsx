import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',           label: 'Dashboard',  icon: 'D' },
  { to: '/optimizer',  label: 'Optimizer',  icon: 'O' },
  { to: '/agent',      label: 'AI Agent',   icon: 'A' },
  { to: '/api-input',  label: 'API Keys',   icon: 'K' },
  { to: '/connectors', label: 'Connectors', icon: 'C' },
]

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="text-sm font-bold text-white">OptiRoute</div>
          <div className="text-xs text-gray-500">Cross-border optimizer</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-green-500/10 text-green-400 font-medium'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`
              }
            >
              <span className="w-5 h-5 bg-gray-800 rounded text-xs flex items-center justify-center font-mono">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-600">v0.2 — Testing Mode</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
