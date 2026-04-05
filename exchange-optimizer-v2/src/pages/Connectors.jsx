import { useState, useEffect } from 'react'
import { EXCHANGES, isConfigured } from '../lib/storage'
import { Link } from 'react-router-dom'

export default function Connectors() {
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading] = useState(false)

  async function testAll() {
    setLoading(true)
    const results = {}
    // Test public API pings
    const tests = [
      { id: 'kraken', url: '/api/kraken/0/public/SystemStatus' },
      { id: 'binance', url: '/api/binance/api/v3/ping' },
      { id: 'coinbase', url: '/api/coinbase/v2/time' },
    ]
    await Promise.allSettled(
      tests.map(async ({ id, url }) => {
        try {
          const t0 = Date.now()
          const res = await fetch(url)
          results[id] = { status: res.ok ? 'online' : 'error', latency: Date.now() - t0 }
        } catch { results[id] = { status: 'error' } }
      })
    )
    for (const id of ['shakepay', 'mercadobitcoin', 'stripe', 'raydium', 'plaid']) {
      results[id] = { status: isConfigured(id) ? 'configured' : 'not_configured', note: 'Needs backend proxy for live connection' }
    }
    setStatuses(results)
    setLoading(false)
  }

  useEffect(() => { testAll() }, [])

  function badge(s) {
    if (s === 'online') return <span className="inline-block bg-green-950 text-green-400 border border-green-800 text-xs px-2 py-0.5 rounded-full">Online</span>
    if (s === 'configured') return <span className="inline-block bg-yellow-950 text-yellow-400 border border-yellow-800 text-xs px-2 py-0.5 rounded-full">Configured</span>
    if (s === 'error') return <span className="inline-block bg-red-950 text-red-400 border border-red-800 text-xs px-2 py-0.5 rounded-full">Error</span>
    return <span className="text-xs text-gray-600">Not set up</span>
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Connectors</h1>
          <p className="text-gray-400 mt-1">Status of all exchange and banking integrations.</p>
        </div>
        <button onClick={testAll} disabled={loading} className="btn-secondary">{loading ? 'Testing...' : 'Refresh'}</button>
      </div>
      <div className="grid gap-3">
        {Object.entries(EXCHANGES).map(([id, cfg]) => {
          const st = statuses[id]
          return (
            <div key={id} className="card flex items-center gap-4">
              <span className="text-xl font-bold w-8 text-center" style={{color: cfg.color}}>{cfg.logo}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">{cfg.label}</span>
                  {st && badge(st.status)}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {st?.note || (isConfigured(id) ? 'Credentials stored' : 'No credentials')}
                  {st?.latency ? ` — ${st.latency}ms` : ''}
                </div>
              </div>
              {!isConfigured(id) && <Link to="/api-input" className="text-xs text-green-500 hover:text-green-400">+ Add keys</Link>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
