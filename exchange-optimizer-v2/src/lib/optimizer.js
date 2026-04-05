/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * OPTIROUTE — ROUTING ENGINE (v0.3 with logging)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from 'axios'

export const CURRENCIES = ['CAD', 'USD', 'BRL', 'EUR', 'USDC', 'USDT', 'BTC', 'ETH', 'SOL']

// ─── Logging system ──────────────────────────────────────
let _logs = []
function log(type, msg, data) {
  const entry = { time: new Date().toISOString().split('T')[1].split('.')[0], type, msg, data }
  _logs.push(entry)
}
export function getLogs() { return _logs }
export function clearLogs() { _logs = [] }

// ─── CONNECTOR: Kraken ────────────────────────────────────
async function fetchKraken() {
  log('fetch', 'Kraken: fetching BTC, ETH, SOL, USDC, USDT vs USD...')
  try {
    const pairs = { XXBTZUSD: ['BTC','USD'], XETHZUSD: ['ETH','USD'], USDCUSD: ['USDC','USD'], USDTZUSD: ['USDT','USD'], SOLUSD: ['SOL','USD'] }
    const res = await axios.get('/api/kraken/0/public/Ticker?pair=' + Object.keys(pairs).join(','))
    const out = {}
    if (res.data?.result) {
      for (const [k, info] of Object.entries(res.data.result)) {
        const p = pairs[k]
        if (p) {
          const bid = parseFloat(info.b[0]), ask = parseFloat(info.a[0])
          out[`${p[0]}_${p[1]}`] = { exchange:'kraken', from:p[0], to:p[1], bid, ask, mid:(bid+ask)/2, spread:((ask-bid)/ask)*100, fee:0.26, settlementMin:1, settlementMax:5, available:true }
          log('rate', `Kraken: ${p[0]}/${p[1]} = ${((bid+ask)/2).toFixed(2)}`, { bid, ask })
        }
      }
    }
    log('ok', `Kraken: ${Object.keys(out).length} pairs loaded`)
    return out
  } catch(e) { log('error', `Kraken FAILED: ${e.message}`); return {} }
}

// ─── CONNECTOR: Binance ───────────────────────────────────
async function fetchBinance() {
  log('fetch', 'Binance: fetching BTC, ETH, SOL, USDC vs USDT/USDC...')
  try {
    const pairs = [
      { s:'BTCUSDT', f:'BTC', t:'USDT' }, { s:'ETHUSDT', f:'ETH', t:'USDT' },
      { s:'SOLUSDT', f:'SOL', t:'USDT' }, { s:'USDCUSDT', f:'USDC', t:'USDT' },
      { s:'BTCUSDC', f:'BTC', t:'USDC' }, { s:'ETHUSDC', f:'ETH', t:'USDC' },
    ]
    const symbols = JSON.stringify(pairs.map(p => p.s))
    const res = await axios.get('/api/binance/api/v3/ticker/bookTicker?symbols=' + symbols)
    const out = {}
    if (Array.isArray(res.data)) {
      for (const tk of res.data) {
        const p = pairs.find(x => x.s === tk.symbol)
        if (p) {
          const bid = parseFloat(tk.bidPrice), ask = parseFloat(tk.askPrice)
          out[`${p.f}_${p.t}`] = { exchange:'binance', from:p.f, to:p.t, bid, ask, mid:(bid+ask)/2, spread:((ask-bid)/ask)*100, fee:0.10, settlementMin:1, settlementMax:3, available:true }
          log('rate', `Binance: ${p.f}/${p.t} = ${((bid+ask)/2).toFixed(2)}`)
        }
      }
    }
    log('ok', `Binance: ${Object.keys(out).length} pairs loaded`)
    return out
  } catch(e) { log('error', `Binance FAILED: ${e.message}`); return {} }
}

// ─── CONNECTOR: Coinbase ──────────────────────────────────
async function fetchCoinbase() {
  log('fetch', 'Coinbase: fetching BTC, ETH, SOL, USDC vs USD...')
  try {
    const pairs = [
      { id:'BTC-USD', f:'BTC', t:'USD' }, { id:'ETH-USD', f:'ETH', t:'USD' },
      { id:'SOL-USD', f:'SOL', t:'USD' }, { id:'USDC-USD', f:'USDC', t:'USD' },
    ]
    const results = await Promise.allSettled(
      pairs.map(p => axios.get('/api/coinbase/v2/prices/' + p.id + '/spot').then(r => ({ p, d: r.data })))
    )
    const out = {}
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value?.d?.data?.amount) {
        const mid = parseFloat(r.value.d.data.amount), p = r.value.p
        out[`${p.f}_${p.t}`] = { exchange:'coinbase', from:p.f, to:p.t, bid:mid*0.9995, ask:mid*1.0005, mid, spread:0.10, fee:0.60, settlementMin:1, settlementMax:5, available:true }
        log('rate', `Coinbase: ${p.f}/${p.t} = ${mid.toFixed(2)}`)
      }
    }
    log('ok', `Coinbase: ${Object.keys(out).length} pairs loaded`)
    return out
  } catch(e) { log('error', `Coinbase FAILED: ${e.message}`); return {} }
}

// ─── CONNECTOR: Mercado Bitcoin ───────────────────────────
async function fetchMercado() {
  log('fetch', 'Mercado Bitcoin: fetching BTC, ETH, USDC, USDT vs BRL...')
  try {
    const syms = [{ s:'BTC', f:'BTC', t:'BRL' }, { s:'ETH', f:'ETH', t:'BRL' }, { s:'USDC', f:'USDC', t:'BRL' }, { s:'USDT', f:'USDT', t:'BRL' }]
    const results = await Promise.allSettled(
      syms.map(p => axios.get('/api/mercado/api/' + p.s + '/ticker/').then(r => ({ p, d: r.data })))
    )
    const out = {}
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value?.d?.ticker) {
        const tk = r.value.d.ticker, p = r.value.p
        const bid = parseFloat(tk.buy), ask = parseFloat(tk.sell)
        out[`${p.f}_${p.t}`] = { exchange:'mercadobitcoin', from:p.f, to:p.t, bid, ask, mid:parseFloat(tk.last), spread:((ask-bid)/ask)*100, fee:0.30, settlementMin:10, settlementMax:60, available:true }
        log('rate', `Mercado: ${p.f}/${p.t} = ${parseFloat(tk.last).toFixed(2)} BRL`)
      }
    }
    log('ok', `Mercado Bitcoin: ${Object.keys(out).length} pairs loaded`)
    return out
  } catch(e) { log('error', `Mercado Bitcoin FAILED: ${e.message}`); return {} }
}

// ─── CONNECTOR: Raydium (Solana DEX) ─────────────────────
async function fetchRaydium() {
  log('fetch', 'Raydium: adding USDC/USDT Solana DEX rate...')
  const out = {
    USDC_USDT: { exchange:'raydium', from:'USDC', to:'USDT', mid:1.0001, bid:0.9999, ask:1.0003, spread:0.04, fee:0.25, settlementMin:0.1, settlementMax:1, available:true }
  }
  log('ok', 'Raydium: USDC/USDT = 1.0001 (Solana, ~0.4s settlement)')
  return out
}

// ─── Baseline FX ─────────────────────────────────────────
const BASELINE_FX = {
  USD_CAD: 1.365, CAD_USD: 0.733,
  USD_BRL: 4.97,  BRL_USD: 0.201,
  USD_EUR: 0.921, EUR_USD: 1.086,
  CAD_BRL: 3.642, BRL_CAD: 0.2745,
}

// ─── Fetch all rates ─────────────────────────────────────
export async function fetchAllRates() {
  log('info', '=== Fetching rates from all exchanges ===')
  const fetchers = [fetchKraken, fetchBinance, fetchCoinbase, fetchMercado, fetchRaydium]
  const results = await Promise.allSettled(fetchers.map(fn => fn()))
  const all = {}

  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const [k, rate] of Object.entries(r.value)) {
        if (!all[k] || (rate.fee < all[k].fee)) all[k] = rate
      }
    }
  }

  // Baseline FX
  log('info', 'Adding baseline FX rates (CAD/USD/BRL/EUR)...')
  for (const [key, mid] of Object.entries(BASELINE_FX)) {
    const [f, t] = key.split('_')
    if (!all[key]) {
      all[key] = { exchange:'fx_baseline', from:f, to:t, mid, bid:mid*0.999, ask:mid*1.001, spread:0.20, fee:0.50, settlementMin:1440, settlementMax:4320, available:true }
      log('rate', `Baseline: ${f}/${t} = ${mid}`)
    }
  }

  // Reverse pairs
  let reverseCount = 0
  for (const [k, rate] of Object.entries({ ...all })) {
    const rev = `${rate.to}_${rate.from}`
    if (!all[rev] && rate.mid) {
      all[rev] = { ...rate, from:rate.to, to:rate.from, mid:1/rate.mid, bid:rate.mid?1/rate.ask:null, ask:rate.mid?1/rate.bid:null }
      reverseCount++
    }
  }
  log('info', `Generated ${reverseCount} reverse pairs`)
  log('ok', `=== Total: ${Object.keys(all).length} rates ready ===`)

  return all
}

// ─── Graph builder ───────────────────────────────────────
function buildGraph(rates) {
  const graph = {}
  let edgeCount = 0
  for (const rate of Object.values(rates)) {
    if (!rate.available || !rate.mid) continue
    if (!graph[rate.from]) graph[rate.from] = []
    graph[rate.from].push({
      to: rate.to,
      edge: rate,
      costPct: (rate.fee || 0) + (rate.spread || 0) / 2,
      timeMin: ((rate.settlementMin || 0) + (rate.settlementMax || 5)) / 2
    })
    edgeCount++
  }
  log('info', `Graph built: ${Object.keys(graph).length} nodes, ${edgeCount} edges`)
  return graph
}

// ─── Cost function ───────────────────────────────────────
function edgeCost(hop, mode) {
  const feeCost = hop.costPct / 100
  const timeScore = Math.min(hop.timeMin / 4320, 1)
  if (mode === 'cost') return feeCost
  if (mode === 'speed') return timeScore * 0.8 + feeCost * 0.2
  return feeCost * 0.5 + timeScore * 0.5
}

// ─── Dijkstra pathfinder ─────────────────────────────────
function findRoutes({ graph, from, to, mode, maxHops = 4, topK = 5 }) {
  log('info', `Pathfinding: ${from} -> ${to} (mode=${mode}, maxHops=${maxHops})`)

  const queue = [{ cost: 0, path: [], currency: from, frac: 1.0, visited: new Set([from]) }]
  const routes = []
  const bestCosts = new Map()
  let explored = 0

  while (queue.length > 0 && routes.length < topK * 3) {
    queue.sort((a, b) => a.cost - b.cost)
    const cur = queue.shift()
    explored++

    if (cur.path.length > maxHops) continue

    if (cur.currency === to && cur.path.length > 0) {
      const pathStr = [from, ...cur.path.map(h => h.to)].join(' -> ')
      const exchanges = cur.path.map(h => h.exchange).join(', ')
      log('route', `FOUND: ${pathStr} via [${exchanges}] | fees=${(cur.cost*100).toFixed(3)}%`, { frac: cur.frac })
      routes.push({ path: cur.path, totalCostPct: cur.cost * 100, frac: cur.frac, hops: cur.path.length })
      if (routes.length >= topK) break
      continue
    }

    const vk = cur.currency + '_' + cur.path.length
    if (bestCosts.has(vk) && bestCosts.get(vk) < cur.cost - 0.0001) continue
    bestCosts.set(vk, cur.cost)

    for (const hop of (graph[cur.currency] || [])) {
      if (hop.to !== to && cur.visited.has(hop.to)) continue
      const hc = edgeCost(hop, mode)
      const newVisited = new Set(cur.visited)
      newVisited.add(hop.to)
      queue.push({
        cost: cur.cost + hc,
        path: [...cur.path, {
          from: cur.currency, to: hop.to, exchange: hop.edge.exchange,
          rate: hop.edge.mid, feePct: hop.edge.fee, spreadPct: hop.edge.spread,
          settlementMin: hop.edge.settlementMin, settlementMax: hop.edge.settlementMax,
          note: hop.edge.note
        }],
        currency: hop.to,
        frac: cur.frac * (1 - hc),
        visited: newVisited
      })
    }
  }

  log('info', `Explored ${explored} states, found ${routes.length} routes`)
  return routes.slice(0, topK)
}

// ─── Main optimizer ──────────────────────────────────────
export async function optimize({ fromCurrency, toCurrency, amount, mode = 'balanced', maxHops = 4, topK = 5 }) {
  clearLogs()
  log('info', `=== OPTIROUTE: ${amount} ${fromCurrency} -> ${toCurrency} ===`)
  log('info', `Mode: ${mode} | Max hops: ${maxHops} | Top K: ${topK}`)

  const t0 = Date.now()
  const rates = await fetchAllRates()
  const graph = buildGraph(rates)
  const rawRoutes = findRoutes({ graph, from: fromCurrency, to: toCurrency, mode, maxHops, topK })

  const enriched = rawRoutes.map((route, idx) => {
    const totalTimeMin = route.path.reduce((sum, h) => sum + ((h.settlementMin + h.settlementMax) / 2), 0)
    const pathStr = [fromCurrency, ...route.path.map(h => h.to)].join(' -> ')

    // Calculate amount at each hop
    let runningAmount = amount
    const hopsWithAmounts = route.path.map(h => {
      const feeHit = runningAmount * ((h.feePct + (h.spreadPct || 0) / 2) / 100)
      const amountAfterFee = runningAmount - feeHit
      const converted = h.rate ? amountAfterFee * h.rate : amountAfterFee
      const hop = { ...h, amountIn: runningAmount, amountOut: converted, feeAmount: feeHit }
      runningAmount = converted
      return hop
    })

    return {
      rank: idx + 1,
      path: hopsWithAmounts,
      pathStr,
      exchanges: [...new Set(route.path.map(h => h.exchange))],
      hops: route.hops,
      fromCurrency, toCurrency,
      amountIn: amount,
      amountOut: amount * route.frac,
      totalFeesPct: route.totalCostPct,
      totalFeesAmount: amount * (route.totalCostPct / 100),
      savingsVsTraditional: amount * 0.05 - amount * (route.totalCostPct / 100),
      totalTimeMin,
      totalTimeStr: fmtTime(totalTimeMin),
      mode,
      isBest: idx === 0
    }
  })

  const latency = Date.now() - t0
  log('ok', `=== Done in ${latency}ms: ${enriched.length} routes returned ===`)

  return { routes: enriched, fetchedAt: new Date().toISOString(), latencyMs: latency, ratesCount: Object.keys(rates).length, graphNodes: Object.keys(graph).length, logs: getLogs() }
}

function fmtTime(m) {
  if (m < 1) return '< 1 min'
  if (m < 60) return Math.round(m) + ' min'
  if (m < 1440) return Math.round(m / 60) + ' hr'
  return Math.round(m / 1440) + ' day' + (Math.round(m / 1440) > 1 ? 's' : '')
}
