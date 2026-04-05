import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EXCHANGES, isConfigured } from '../lib/storage'

const CORRIDORS = [
  { label: 'CAD -> BRL', flag: 'CA -> BR', typical: '3-7%', optimized: '~0.5%' },
  { label: 'USD -> BRL', flag: 'US -> BR', typical: '3-5%', optimized: '~0.4%' },
  { label: 'CAD -> USD', flag: 'CA -> US', typical: '1-2%', optimized: '~0.2%' },
]

export default function Dashboard() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(Object.keys(EXCHANGES).filter(isConfigured).length)
  }, [])

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Cross-Border Stablecoin Optimizer</h1>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Automatically finds the cheapest, fastest path to move money across borders —
          routing through exchanges, DEXs, stablecoins, and banking rails.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
            count > 0 ? 'bg-green-950/40 border-green-800/50 text-green-400' : 'bg-yellow-950/40 border-yellow-800/50 text-yellow-400'
          }`}>
            {count} exchange{count !== 1 ? 's' : ''} configured
          </div>
          {count === 0 && <Link to="/api-input" className="text-xs text-green-500 hover:text-green-400 underline">Add API keys to get started</Link>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link to="/optimizer" className="card hover:border-green-700/60 transition-all group">
          <div className="text-2xl mb-2">&#9889;</div>
          <div className="font-semibold text-white group-hover:text-green-400 transition-colors">Run Optimizer</div>
          <div className="text-sm text-gray-500 mt-1">Find the best route for a transfer</div>
        </Link>
        <Link to="/api-input" className="card hover:border-blue-700/60 transition-all group">
          <div className="text-2xl mb-2">&#128273;</div>
          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">API Key Manager</div>
          <div className="text-sm text-gray-500 mt-1">Connect exchanges, Plaid, Stripe, Raydium</div>
        </Link>
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Supported Corridors</h2>
        <div className="grid grid-cols-3 gap-4">
          {CORRIDORS.map(c => (
            <Link key={c.label} to="/optimizer" className="card hover:border-gray-600 transition-colors">
              <div className="text-sm mb-2 text-gray-400">{c.flag}</div>
              <div className="font-medium text-white text-sm">{c.label}</div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-gray-600">Traditional</span><span className="text-red-400">{c.typical}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-600">OptiRoute</span><span className="text-green-400">{c.optimized}</span></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Connected Exchanges</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(EXCHANGES).map(([id, cfg]) => (
            <Link key={id} to="/api-input" className={`card text-center hover:border-gray-600 transition-colors ${isConfigured(id) ? 'border-green-900/60' : ''}`}>
              <div className="text-xl mb-1 font-bold" style={{color: cfg.color}}>{cfg.logo}</div>
              <div className="text-xs font-medium text-gray-300">{cfg.label}</div>
              <div className="mt-1">{isConfigured(id) ? <span className="text-xs text-green-500">Connected</span> : <span className="text-xs text-gray-700">Not set up</span>}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
