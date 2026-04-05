import { useState, useRef, useEffect } from 'react'

// ─── Stablecoin Registry ─────────────────────────────────
const STABLECOIN_REGISTRY = {
  USD_PEGGED: ["USDT", "USDC", "USDe", "DAI", "FDUSD", "PYUSD", "FRAX", "TUSD", "GUSD", "USDP"],
  REGIONAL: ["EURC", "QCAD", "MXNT"],
  NETWORKS: ["BASE", "POLYGON", "XRPL", "SOLANA", "ARBITRUM", "ETHEREUM", "TRON", "AVALANCHE"]
}

const FIAT_CURRENCIES = ["USD", "CAD", "BRL", "EUR", "GBP", "MXN", "ARS", "CLP", "COP"]

const DEFAULT_SYSTEM_PROMPT = `Tu es un Agent d'Arbitrage Quantitatif. Ta mission est de détruire les frais bancaires.
Tu reçois une demande de transfert Fiat-to-Fiat. Tu dois trouver la route la moins chère en testant toutes les combinaisons de stablecoins et réseaux.

LOGIQUE D'OPTIMISATION BRUTALE :
1. ANALYSE EXHAUSTIVE : Pour chaque corridor, teste TOUTES les routes possibles :
   - Routes directes : CAD -> USDC -> BRL
   - Routes régionales : CAD -> QCAD -> EURC -> EUR (stablecoins natifs)
   - Routes hybrides : CAD -> USDC (Base) -> bridge -> USDC (Solana) -> BRL
   - Routes XRP : CAD -> XRP -> BRL (liquidité rapide, 3-5 secondes)
   - Routes split : 40% via USDC, 60% via USDT si ça optimise le total

2. CALCUL DU SPREAD RÉEL pour chaque hop :
   - Frais On-Ramp (Banque → Crypto) : typiquement 0.1-1.5%
   - Spread DEX (ex: USDC/EURC sur Curve, Uniswap)
   - Gas/Network fees : Base ~$0.01, Polygon ~$0.01, ETH ~$2-5, Solana ~$0.001, XRPL ~$0.0001
   - Bridge fees : Wormhole, CCTP, LayerZero
   - Frais Off-Ramp (Crypto → Banque) : typiquement 0.1-1.5%

3. AMOUNT SPLITTING : Tu DOIS tester si splitter le montant en 2-3 sous-routes donne un meilleur NET PAYOUT.
   Exemple : 1000 CAD -> BRL
   - Route A (100%): CAD -> USDC -> BRL = 4,850 BRL (0.8% fees)
   - Route B (split): 60% CAD -> USDC -> BRL + 40% CAD -> XRP -> BRL = 4,870 BRL (0.5% fees)
   Si B > A, recommande B.

4. CRITÈRE UNIQUE : Le montant NET PAYOUT final en devise destination.
   Ignore la complexité. Si faire 4 swaps sur 3 réseaux donne 0.05€ de plus, c'est la route gagnante.

5. FORMAT DE RÉPONSE :
   Pour chaque route testée, donne :
   - Le chemin complet avec les montants à chaque étape
   - Les frais détaillés de chaque hop
   - Le NET PAYOUT final
   - Le temps de settlement estimé
   Puis classe les routes du meilleur au pire NET PAYOUT.
   Si un split est optimal, montre la répartition exacte.

REGISTRE DES STABLECOINS DISPONIBLES : ${JSON.stringify(STABLECOIN_REGISTRY)}
DEVISES FIAT SUPPORTÉES : ${JSON.stringify(FIAT_CURRENCIES)}`

const TOOLS = [
  {
    name: "getOnRampQuote",
    description: "Get the price to buy a specific stablecoin with fiat currency. Returns the amount of crypto received after fees.",
    input_schema: {
      type: "object",
      properties: {
        fiat: { type: "string", description: "Source fiat currency (e.g. CAD, USD, EUR)" },
        crypto: { type: "string", description: "Target stablecoin (e.g. USDC, USDT, QCAD, XRP)" },
        network: { type: "string", description: "Blockchain network (e.g. BASE, POLYGON, SOLANA, XRPL)" },
        amount: { type: "number", description: "Amount in fiat currency" },
        provider: { type: "string", description: "On-ramp provider (e.g. MoonPay, Transak, Kraken, Binance)" }
      },
      required: ["fiat", "crypto", "amount"]
    }
  },
  {
    name: "getDexSwapRate",
    description: "Get the exchange rate between two tokens on a specific DEX/network. Returns rate, slippage, and gas cost.",
    input_schema: {
      type: "object",
      properties: {
        fromToken: { type: "string", description: "Source token (e.g. USDC)" },
        toToken: { type: "string", description: "Destination token (e.g. EURC, USDT)" },
        network: { type: "string", description: "Network (BASE, POLYGON, SOLANA, ETHEREUM, ARBITRUM)" },
        amount: { type: "number", description: "Amount of fromToken" },
        dex: { type: "string", description: "DEX to use (Uniswap, Curve, Jupiter, Raydium)" }
      },
      required: ["fromToken", "toToken", "network"]
    }
  },
  {
    name: "getBridgeQuote",
    description: "Get the cost to bridge a token from one network to another.",
    input_schema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Token to bridge (e.g. USDC)" },
        fromNetwork: { type: "string", description: "Source network" },
        toNetwork: { type: "string", description: "Destination network" },
        amount: { type: "number", description: "Amount to bridge" },
        bridge: { type: "string", description: "Bridge protocol (Wormhole, CCTP, LayerZero, Stargate)" }
      },
      required: ["token", "fromNetwork", "toNetwork", "amount"]
    }
  },
  {
    name: "getOffRampQuote",
    description: "Get the price to sell a stablecoin for fiat currency. Returns net fiat amount received after fees.",
    input_schema: {
      type: "object",
      properties: {
        crypto: { type: "string", description: "Source stablecoin (e.g. USDC, USDT, EURC)" },
        fiat: { type: "string", description: "Target fiat currency (e.g. BRL, EUR)" },
        amount: { type: "number", description: "Amount of crypto to sell" },
        network: { type: "string", description: "Network the crypto is on" },
        provider: { type: "string", description: "Off-ramp provider" }
      },
      required: ["crypto", "fiat", "amount"]
    }
  },
  {
    name: "getNetworkGas",
    description: "Get current gas price estimate for a network.",
    input_schema: {
      type: "object",
      properties: {
        network: { type: "string", description: "Network name" },
        txType: { type: "string", description: "Transaction type: swap, bridge, transfer" }
      },
      required: ["network"]
    }
  }
]

// ─── Simulated tool responses (replace with real API calls) ───
function simulateToolCall(name, input) {
  const rng = () => 0.97 + Math.random() * 0.04 // 97-101% efficiency

  switch (name) {
    case 'getOnRampQuote': {
      const feeMap = { MoonPay: 0.015, Transak: 0.012, Kraken: 0.005, Binance: 0.004 }
      const provider = input.provider || 'Kraken'
      const fee = feeMap[provider] || 0.01
      const cryptoAmount = input.amount * (1 - fee) * rng()
      return { provider, fiat: input.fiat, crypto: input.crypto, network: input.network || 'ETHEREUM',
        fiatAmount: input.amount, cryptoReceived: +cryptoAmount.toFixed(4), feePercent: +(fee * 100).toFixed(2),
        feeAmount: +(input.amount * fee).toFixed(2), estimatedTime: '1-5 min' }
    }
    case 'getDexSwapRate': {
      const spread = 0.001 + Math.random() * 0.003
      const gasMap = { BASE: 0.01, POLYGON: 0.01, SOLANA: 0.001, ARBITRUM: 0.02, ETHEREUM: 3.5, XRPL: 0.0001 }
      const rate = (input.fromToken === input.toToken) ? 1 : (0.995 + Math.random() * 0.008)
      const gas = gasMap[input.network] || 0.5
      return { fromToken: input.fromToken, toToken: input.toToken, network: input.network,
        rate: +rate.toFixed(6), spread: +(spread * 100).toFixed(3), gasCostUSD: gas,
        dex: input.dex || 'Uniswap', amountOut: input.amount ? +(input.amount * rate * (1 - spread)).toFixed(4) : null }
    }
    case 'getBridgeQuote': {
      const feeMap = { CCTP: 0, Wormhole: 0.001, LayerZero: 0.0005, Stargate: 0.0006 }
      const bridge = input.bridge || 'CCTP'
      const fee = feeMap[bridge] || 0.001
      const timeMap = { CCTP: '15-20 min', Wormhole: '5-15 min', LayerZero: '2-10 min' }
      return { token: input.token, from: input.fromNetwork, to: input.toNetwork, bridge,
        amountIn: input.amount, amountOut: +(input.amount * (1 - fee)).toFixed(4),
        feePercent: +(fee * 100).toFixed(3), estimatedTime: timeMap[bridge] || '5-20 min' }
    }
    case 'getOffRampQuote': {
      const feeMap = { MoonPay: 0.015, Transak: 0.012, Kraken: 0.005, Binance: 0.004 }
      const provider = input.provider || 'Kraken'
      const fee = feeMap[provider] || 0.01
      const fxRates = { BRL: 4.97, EUR: 0.92, GBP: 0.79, CAD: 1.365, MXN: 17.2 }
      const fxRate = fxRates[input.fiat] || 1
      const fiatOut = input.amount * (1 - fee) * fxRate * rng()
      return { crypto: input.crypto, fiat: input.fiat, provider, cryptoAmount: input.amount,
        fiatReceived: +fiatOut.toFixed(2), feePercent: +(fee * 100).toFixed(2), fxRate, estimatedTime: '1-24 hr' }
    }
    case 'getNetworkGas': {
      const gasMap = { BASE: 0.01, POLYGON: 0.01, SOLANA: 0.001, ARBITRUM: 0.02, ETHEREUM: 3.5, XRPL: 0.0001, TRON: 1.0, AVALANCHE: 0.05 }
      return { network: input.network, gasCostUSD: gasMap[input.network] || 0.5, txType: input.txType || 'swap' }
    }
    default: return { error: 'Unknown tool' }
  }
}

// ─── Claude API caller with tool loop ────────────────────
async function callClaude({ apiKey, systemPrompt, userMessage, tools, onLog, onToolCall }) {
  const messages = [{ role: 'user', content: userMessage }]
  let iteration = 0
  const maxIterations = 15

  while (iteration < maxIterations) {
    iteration++
    onLog('api', `Claude API call #${iteration}...`)

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Claude API ${res.status}: ${err}`)
    }

    const data = await res.json()

    // Collect text and tool_use blocks
    let textContent = ''
    const toolCalls = []

    for (const block of data.content) {
      if (block.type === 'text') textContent += block.text
      if (block.type === 'tool_use') toolCalls.push(block)
    }

    if (textContent) {
      onLog('claude', textContent)
    }

    // If stop_reason is end_turn or no tool calls, we're done
    if (data.stop_reason === 'end_turn' || toolCalls.length === 0) {
      return textContent
    }

    // Process tool calls
    messages.push({ role: 'assistant', content: data.content })

    const toolResults = []
    for (const tc of toolCalls) {
      onLog('tool', `Calling ${tc.name}(${JSON.stringify(tc.input)})`)
      onToolCall(tc.name, tc.input)

      const result = simulateToolCall(tc.name, tc.input)
      onLog('result', `${tc.name} -> ${JSON.stringify(result)}`)

      toolResults.push({
        type: 'tool_result',
        tool_use_id: tc.id,
        content: JSON.stringify(result)
      })
    }

    messages.push({ role: 'user', content: toolResults })
  }

  return 'Max iterations reached.'
}

// ─── Page Component ──────────────────────────────────────
export default function Agent() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claude_api_key') || '')
  const [showKey, setShowKey] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [showPrompt, setShowPrompt] = useState(false)

  const [fromFiat, setFromFiat] = useState('CAD')
  const [toFiat, setToFiat] = useState('BRL')
  const [amount, setAmount] = useState('1000')
  const [customQuery, setCustomQuery] = useState('')

  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [response, setResponse] = useState('')
  const [toolCalls, setToolCalls] = useState([])
  const [logFilter, setLogFilter] = useState('all')

  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  function addLog(type, msg) {
    setLogs(prev => [...prev, { time: new Date().toISOString().split('T')[1].split('.')[0], type, msg }])
  }

  function saveKey(k) {
    setApiKey(k)
    localStorage.setItem('claude_api_key', k)
  }

  async function runAgent() {
    if (!apiKey) { addLog('error', 'Enter your Claude API key first.'); return }

    const query = customQuery || `Optimise ce transfert cross-border :
- Montant : ${amount} ${fromFiat}
- Destination : ${toFiat}
- Objectif : Maximiser le NET PAYOUT en ${toFiat}
- Tu peux splitter le montant sur plusieurs routes si c'est plus optimal
- Teste toutes les combinaisons de stablecoins, réseaux et bridges
- Compare au minimum 5 routes différentes
- Donne le résultat final en ${toFiat} net pour chaque route`

    setRunning(true)
    setLogs([])
    setResponse('')
    setToolCalls([])

    addLog('info', `=== BRUTAL OPTIMIZATION: ${amount} ${fromFiat} -> ${toFiat} ===`)
    addLog('info', `Sending to Claude API with ${TOOLS.length} tools...`)

    try {
      const result = await callClaude({
        apiKey,
        systemPrompt,
        userMessage: query,
        tools: TOOLS,
        onLog: addLog,
        onToolCall: (name, input) => setToolCalls(prev => [...prev, { name, input }])
      })

      setResponse(result)
      addLog('ok', '=== OPTIMIZATION COMPLETE ===')
    } catch (e) {
      addLog('error', e.message)
      setResponse('Error: ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const LOG_COLORS = {
    info: 'text-blue-400', api: 'text-cyan-400', claude: 'text-white',
    tool: 'text-yellow-400', result: 'text-green-400', error: 'text-red-400', ok: 'text-green-500'
  }

  const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.type === logFilter)

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Arbitrage Agent</h1>
        <p className="text-gray-500 text-sm">Claude-powered brutal fee optimizer — splits amounts, tests all stablecoins, finds maximum NET PAYOUT</p>
      </div>

      {/* API Key + System Prompt */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Claude API Key</label>
          <div className="relative">
            <input type={showKey ? 'text' : 'password'} className="input-field font-mono text-xs pr-16"
              placeholder="sk-ant-..." value={apiKey} onChange={e => saveKey(e.target.value)} />
            <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300">
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">&nbsp;</label>
          <button onClick={() => setShowPrompt(!showPrompt)} className="btn-secondary text-xs px-3 py-2">
            {showPrompt ? 'Hide' : 'Edit'} System Prompt
          </button>
        </div>
      </div>

      {showPrompt && (
        <div className="mb-3">
          <textarea className="input-field font-mono text-xs h-48 resize-y" value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)} />
          <button onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)} className="text-xs text-gray-600 hover:text-gray-400 mt-1">
            Reset to default
          </button>
        </div>
      )}

      {/* Transfer config */}
      <div className="flex items-end gap-3 mb-3 flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From (Fiat)</label>
          <select className="input-field w-24" value={fromFiat} onChange={e => setFromFiat(e.target.value)}>
            {FIAT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => { setFromFiat(toFiat); setToFiat(fromFiat) }} className="text-gray-500 hover:text-green-400 text-lg pb-2">&#8644;</button>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To (Fiat)</label>
          <select className="input-field w-24" value={toFiat} onChange={e => setToFiat(e.target.value)}>
            {FIAT_CURRENCIES.filter(c => c !== fromFiat).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount</label>
          <input type="number" className="input-field w-32" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <button onClick={runAgent} disabled={running || !apiKey} className="btn-primary px-6 py-2">
          {running ? 'Agent running...' : 'Run Brutal Optimization'}
        </button>
      </div>

      {/* Custom query */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Custom prompt (optional — override the auto-generated query)</label>
        <textarea className="input-field text-sm h-16 resize-y" value={customQuery} onChange={e => setCustomQuery(e.target.value)}
          placeholder="e.g. Je veux envoyer 5000 CAD au Brésil. Teste un split 60/40 entre USDC et XRP. Compare les frais sur Base vs Solana..." />
      </div>

      {/* Main: Response + Logs */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">

        {/* LEFT: Claude Response */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Agent Response</span>
            {toolCalls.length > 0 && (
              <span className="text-xs text-yellow-400">{toolCalls.length} tool calls made</span>
            )}
          </div>
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg overflow-auto p-4 min-h-0">
            {!response && !running && (
              <div className="h-full flex items-center justify-center text-gray-700 flex-col gap-2">
                <div className="text-3xl">&#129302;</div>
                <div className="text-sm">Enter your API key and click Run</div>
              </div>
            )}
            {running && !response && (
              <div className="h-full flex items-center justify-center flex-col gap-3">
                <div className="text-3xl animate-pulse">&#129302;</div>
                <div className="text-gray-400 text-sm">Agent is thinking and calling tools...</div>
              </div>
            )}
            {response && (
              <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {response}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Logs */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Live Logs</span>
              <span className="text-xs text-gray-600">{logs.length}</span>
            </div>
            <div className="flex items-center gap-1">
              {['all', 'info', 'api', 'tool', 'result', 'claude', 'error'].map(f => (
                <button key={f} onClick={() => setLogFilter(f)}
                  className={`text-xs px-2 py-0.5 rounded ${logFilter === f ? 'bg-gray-700 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div ref={logRef} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg overflow-auto font-mono text-xs p-3 min-h-0">
            {filteredLogs.length === 0 && <div className="text-gray-700 italic">Logs will appear here when the agent runs...</div>}
            {filteredLogs.map((l, i) => (
              <div key={i} className={`${LOG_COLORS[l.type] || 'text-gray-500'} leading-relaxed break-all`}>
                <span className="text-gray-700 mr-2">[{l.time}]</span>
                <span className="text-gray-600 mr-1">[{l.type.toUpperCase()}]</span>
                {l.type === 'claude' ? <span className="text-gray-300">{l.msg.substring(0, 300)}{l.msg.length > 300 ? '...' : ''}</span> : l.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
