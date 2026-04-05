import { useState, useRef, useEffect } from 'react'
import { optimize, CURRENCIES } from '../lib/optimizer'

const MODES = [
  { id: 'cost',     label: 'Lowest Cost',  desc: 'Minimize fees' },
  { id: 'speed',    label: 'Fastest',       desc: 'Prioritize speed' },
  { id: 'balanced', label: 'Balanced',      desc: 'Mix of cost & speed' },
]

const PRESETS = [
  { label: 'CAD -> BRL',   from: 'CAD',  to: 'BRL',  amount: 1000 },
  { label: 'USD -> BRL',   from: 'USD',  to: 'BRL',  amount: 1000 },
  { label: 'CAD -> USDC',  from: 'CAD',  to: 'USDC', amount: 1000 },
  { label: 'USDC -> USDT', from: 'USDC', to: 'USDT', amount: 5000 },
  { label: 'BTC -> BRL',   from: 'BTC',  to: 'BRL',  amount: 0.1 },
]

const EX_COLORS = {
  kraken:'#8b5cf6', binance:'#eab308', coinbase:'#3b82f6',
  shakepay:'#14b8a6', mercadobitcoin:'#f97316', stripe:'#818cf8',
  raydium:'#a855f7', fx_baseline:'#6b7280',
}
const EX_NAMES = {
  kraken:'Kraken', binance:'Binance', coinbase:'Coinbase',
  shakepay:'Shakepay', mercadobitcoin:'Mercado Bitcoin', stripe:'Stripe',
  raydium:'Raydium', fx_baseline:'FX Baseline',
}

const LOG_COLORS = {
  info: 'text-blue-400', fetch: 'text-cyan-400', rate: 'text-gray-500',
  ok: 'text-green-400', error: 'text-red-400', route: 'text-yellow-400',
}

export default function Optimizer() {
  const [from, setFrom] = useState('CAD')
  const [to, setTo] = useState('BRL')
  const [amount, setAmount] = useState('1000')
  const [mode, setMode] = useState('balanced')
  const [maxHops, setMaxHops] = useState(4)
  const [topK, setTopK] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])
  const [showLogs, setShowLogs] = useState(true)
  const [logFilter, setLogFilter] = useState('all')
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  async function run() {
    if (!from || !to || from === to) { setError('Pick different currencies.'); return }
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return }
    setLoading(true); setError(null); setResult(null); setLogs([])
    try {
      const res = await optimize({ fromCurrency: from, toCurrency: to, amount: Number(amount), mode, maxHops, topK })
      setLogs(res.logs || [])
      if (!res.routes.length) setError('No routes found. Try increasing max hops or adding more exchange API keys.')
      else setResult(res)
    } catch (e) { setError('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.type === logFilter)

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Route Optimizer</h1>
        <p className="text-gray-500 text-sm mt-0.5">Find the cheapest path to move money cross-border via stablecoins</p>
      </div>

      {/* Top bar: transfer config */}
      <div className="flex items-end gap-3 mb-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <select className="input-field w-28" value={from} onChange={e => setFrom(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => { setFrom(to); setTo(from) }} className="text-gray-500 hover:text-green-400 text-lg pb-2">&#8644;</button>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <select className="input-field w-28" value={to} onChange={e => setTo(e.target.value)}>
            {CURRENCIES.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount</label>
          <input type="number" className="input-field w-32" value={amount} min="0.001" step="any" onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mode</label>
          <select className="input-field w-32" value={mode} onChange={e => setMode(e.target.value)}>
            {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hops</label>
          <input type="number" className="input-field w-16" value={maxHops} min={1} max={6} onChange={e => setMaxHops(Number(e.target.value))} />
        </div>
        <button onClick={run} disabled={loading} className="btn-primary px-6 py-2">
          {loading ? 'Running...' : 'Find Routes'}
        </button>
        {/* Presets */}
        <div className="flex gap-1 ml-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setFrom(p.from); setTo(p.to); setAmount(String(p.amount)) }}
              className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2 mb-3">{error}</div>}

      {/* Main content: Routes + Logs */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">

        {/* LEFT: Routes */}
        <div className="overflow-auto pr-2">
          {!result && !loading && (
            <div className="h-full flex items-center justify-center text-gray-700 flex-col gap-2">
              <div className="text-4xl">&#8635;</div>
              <div className="text-sm">Select currencies and click Find Routes</div>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center flex-col gap-3">
              <div className="text-3xl animate-spin">&#8635;</div>
              <div className="text-gray-400 text-sm">Polling exchanges & building graph...</div>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              {/* Summary bar */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
                  <div className="text-lg font-bold text-green-400">{result.routes.length}</div>
                  <div className="text-xs text-gray-600">Routes</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
                  <div className="text-lg font-bold text-blue-400">{result.ratesCount}</div>
                  <div className="text-xs text-gray-600">Rates</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
                  <div className="text-lg font-bold text-purple-400">{result.graphNodes}</div>
                  <div className="text-xs text-gray-600">Nodes</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-800">
                  <div className="text-lg font-bold text-gray-300">{result.latencyMs}ms</div>
                  <div className="text-xs text-gray-600">Time</div>
                </div>
              </div>

              {/* Route cards */}
              {result.routes.map(route => (
                <RouteResult key={route.rank} route={route} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Logs panel */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Live Logs</span>
              <span className="text-xs text-gray-600">{logs.length} entries</span>
            </div>
            <div className="flex items-center gap-1">
              {['all', 'info', 'fetch', 'rate', 'route', 'error'].map(f => (
                <button key={f} onClick={() => setLogFilter(f)}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${logFilter === f ? 'bg-gray-700 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                  {f}
                </button>
              ))}
              <button onClick={() => setShowLogs(!showLogs)} className="text-xs text-gray-600 hover:text-gray-400 ml-2">
                {showLogs ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {showLogs && (
            <div ref={logRef} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg overflow-auto font-mono text-xs p-3 min-h-0">
              {filteredLogs.length === 0 && (
                <div className="text-gray-700 italic">Run the optimizer to see logs here...</div>
              )}
              {filteredLogs.map((l, i) => (
                <div key={i} className={`${LOG_COLORS[l.type] || 'text-gray-500'} leading-relaxed`}>
                  <span className="text-gray-700 mr-2">[{l.time}]</span>
                  <span className="text-gray-600 mr-1">[{l.type.toUpperCase()}]</span>
                  {l.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Route Result Card ───────────────────────────────────
function RouteResult({ route }) {
  const [open, setOpen] = useState(route.isBest)

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${route.isBest ? 'border-green-700 ring-1 ring-green-900' : 'border-gray-800'}`}>

      {/* Header — click to expand */}
      <div className="p-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {route.isBest && <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded">BEST</span>}
            <span className="text-sm text-gray-400">Route #{route.rank}</span>
            <span className="text-xs text-gray-600">{route.hops} hop{route.hops > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-lg font-bold ${route.isBest ? 'text-green-400' : 'text-gray-200'}`}>
              {route.amountOut.toFixed(2)} {route.toCurrency}
            </span>
            <span className="text-gray-600">{open ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* Visual pipeline */}
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {/* Start */}
          <div className="flex-shrink-0 bg-gray-800 rounded-lg px-3 py-2 text-center">
            <div className="text-xs text-gray-500">Send</div>
            <div className="text-sm font-bold text-white">{route.amountIn} {route.fromCurrency}</div>
          </div>

          {route.path.map((hop, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              {/* Arrow with exchange label */}
              <div className="flex flex-col items-center mx-1">
                <div className="text-xs font-semibold px-1 rounded" style={{color: EX_COLORS[hop.exchange] || '#6b7280'}}>
                  {EX_NAMES[hop.exchange] || hop.exchange}
                </div>
                <div className="text-gray-600 text-xs">&#8594;</div>
                <div className="text-xs text-red-400/70">-{hop.feePct?.toFixed(1)}%</div>
              </div>

              {/* Currency node */}
              <div className={`bg-gray-800 rounded-lg px-3 py-2 text-center ${i === route.path.length - 1 ? 'ring-1 ring-green-800' : ''}`}>
                <div className="text-xs text-gray-500">{i === route.path.length - 1 ? 'Receive' : 'Step ' + (i+1)}</div>
                <div className={`text-sm font-bold ${i === route.path.length - 1 ? 'text-green-400' : 'text-gray-200'}`}>
                  {hop.amountOut ? hop.amountOut.toFixed(2) : '?'} {hop.to}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className="text-red-400">-{route.totalFeesPct.toFixed(2)}% total fees</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">~{route.totalTimeStr} settlement</span>
          {route.savingsVsTraditional > 0 && (
            <>
              <span className="text-gray-600">|</span>
              <span className="text-green-400">Save {route.savingsVsTraditional.toFixed(2)} {route.fromCurrency} vs wire</span>
            </>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-gray-800 p-4 space-y-2 bg-gray-950/50">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hop Details</div>
          {route.path.map((hop, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-3 flex items-center gap-4">
              <div className="w-16 flex-shrink-0">
                <div className="text-xs text-gray-600">Hop {i+1}</div>
                <div className="text-xs font-bold" style={{color: EX_COLORS[hop.exchange] || '#6b7280'}}>
                  {EX_NAMES[hop.exchange] || hop.exchange}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs">
                <div><span className="text-gray-600">Pair</span><div className="text-gray-300 font-mono">{hop.from}/{hop.to}</div></div>
                <div><span className="text-gray-600">Rate</span><div className="text-gray-300 font-mono">{hop.rate ? hop.rate.toFixed(4) : 'N/A'}</div></div>
                <div><span className="text-gray-600">Fee</span><div className="text-red-400">{hop.feePct?.toFixed(2)}%</div></div>
                <div><span className="text-gray-600">In</span><div className="text-gray-300">{hop.amountIn?.toFixed(2)} {hop.from}</div></div>
                <div><span className="text-gray-600">Out</span><div className="text-green-400">{hop.amountOut?.toFixed(2)} {hop.to}</div></div>
              </div>
              <div className="text-xs text-gray-600 text-right w-20">
                {hop.settlementMin}-{hop.settlementMax} min
              </div>
            </div>
          ))}

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="text-xs text-gray-600">Total fees</div>
              <div className="text-sm font-bold text-red-400">-{route.totalFeesPct.toFixed(3)}%</div>
              <div className="text-xs text-gray-600">-{route.totalFeesAmount.toFixed(2)} {route.fromCurrency}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="text-xs text-gray-600">You receive</div>
              <div className="text-sm font-bold text-green-400">{route.amountOut.toFixed(2)} {route.toCurrency}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="text-xs text-gray-600">Settlement</div>
              <div className="text-sm font-bold text-gray-300">~{route.totalTimeStr}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
