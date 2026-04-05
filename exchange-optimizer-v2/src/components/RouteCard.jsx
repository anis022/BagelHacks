import { useState } from 'react'

const EX_COLORS = {
  kraken:'text-purple-400', binance:'text-yellow-400', coinbase:'text-blue-400',
  shakepay:'text-teal-400', mercadobitcoin:'text-orange-400', stripe:'text-indigo-400',
  raydium:'text-purple-500', fx_baseline:'text-gray-400',
}
const EX_LABELS = {
  kraken:'Kraken', binance:'Binance', coinbase:'Coinbase',
  shakepay:'Shakepay', mercadobitcoin:'Mercado Bitcoin', stripe:'Stripe',
  raydium:'Raydium', fx_baseline:'FX Baseline',
}

export default function RouteCard({ route }) {
  const [open, setOpen] = useState(route.isBest)

  return (
    <div className={`card transition-all ${route.isBest ? 'border-green-700 ring-1 ring-green-800' : ''}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          {route.isBest && <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded">BEST</span>}
          <span className="text-sm font-medium text-gray-300">Route #{route.rank}</span>
          <span className="text-xs text-gray-500">{route.hops} hop{route.hops > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-sm font-semibold ${route.isBest ? 'text-green-400' : 'text-gray-200'}`}>
              {route.amountOut.toFixed(2)} {route.toCurrency}
            </div>
            <div className="text-xs text-gray-500">{route.totalFeesPct.toFixed(3)}% fees</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">{route.totalTimeStr}</div>
          </div>
          <span className="text-gray-500 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Path chips */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-300">{route.fromCurrency}</span>
        {route.path.map((hop, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="text-gray-600 text-xs">-&gt;</span>
            <span className={`text-xs font-semibold ${EX_COLORS[hop.exchange] || 'text-gray-400'}`}>
              {EX_LABELS[hop.exchange] || hop.exchange}
            </span>
            <span className="text-gray-600 text-xs">-&gt;</span>
            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-300">{hop.to}</span>
          </span>
        ))}
      </div>

      {route.savingsVsTraditional > 0 && (
        <div className="mt-2 inline-block bg-green-950 text-green-400 border border-green-800 text-xs px-2 py-0.5 rounded-full">
          Save {route.savingsVsTraditional.toFixed(2)} vs wire transfer
        </div>
      )}

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hop-by-hop breakdown</div>
          {route.path.map((hop, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Hop {i + 1}</span>
                  <span className={`text-xs font-semibold ${EX_COLORS[hop.exchange] || 'text-gray-400'}`}>
                    {EX_LABELS[hop.exchange] || hop.exchange}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{hop.from} -&gt; {hop.to}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div><div className="text-xs text-gray-600">Rate</div><div className="text-xs text-gray-300 font-mono">{hop.rate ? hop.rate.toFixed(4) : 'N/A'}</div></div>
                <div><div className="text-xs text-gray-600">Fee</div><div className="text-xs text-gray-300">{hop.feePct?.toFixed(2) || 0}%</div></div>
                <div><div className="text-xs text-gray-600">Settlement</div><div className="text-xs text-gray-300">{hop.settlementMin}-{hop.settlementMax} min</div></div>
              </div>
              {hop.note && <div className="mt-1.5 text-xs text-yellow-600">{hop.note}</div>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Total fees</div>
              <div className="text-sm font-semibold text-red-400">-{route.totalFeesPct.toFixed(3)}%</div>
              <div className="text-xs text-gray-500">-{route.totalFeesAmount?.toFixed(2)} {route.fromCurrency}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">You receive</div>
              <div className="text-sm font-semibold text-green-400">{route.amountOut?.toFixed(2)} {route.toCurrency}</div>
              <div className="text-xs text-gray-500">in ~{route.totalTimeStr}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
