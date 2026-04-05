import { useState, useEffect } from 'react'
import { EXCHANGES, loadKeys, saveKeys } from '../lib/storage'

export default function APIInput() {
  const [keys, setKeys] = useState({})
  const [saved, setSaved] = useState(false)
  const [showSecrets, setShowSecrets] = useState({})
  const [tab, setTab] = useState('kraken')

  useEffect(() => { setKeys(loadKeys()) }, [])

  function onChange(ex, field, val) {
    setKeys(prev => ({ ...prev, [ex]: { ...(prev[ex] || {}), [field]: val } }))
    setSaved(false)
  }

  function onSave() {
    saveKeys(keys)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function onClear(ex) {
    setKeys(prev => { const n = { ...prev }; delete n[ex]; return n })
    setSaved(false)
  }

  function isConf(ex) {
    const cfg = EXCHANGES[ex]; const s = keys[ex] || {}
    return cfg.fields.some(f => s[f.key]?.length > 3)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">API Key Manager</h1>
        <p className="text-gray-400 mt-1">Paste your exchange and banking credentials to enable live rate fetching.</p>
        <div className="mt-3 bg-yellow-950/40 border border-yellow-800/50 rounded-lg px-4 py-2.5 text-sm text-yellow-300">
          Keys are stored in browser localStorage — testing use only. Use a server-side vault in production.
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-44 flex-shrink-0 space-y-1">
          {Object.entries(EXCHANGES).map(([id, cfg]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                tab === id ? 'bg-green-500/10 text-green-400 font-medium border border-green-800/50' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}>
              <span className="font-bold" style={{color: cfg.color}}>{cfg.logo}</span>
              <span className="flex-1 truncate">{cfg.label}</span>
              {isConf(id) && <span className="text-green-500 text-xs">●</span>}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex-1">
          {Object.entries(EXCHANGES).map(([id, cfg]) => {
            if (tab !== id) return null
            const stored = keys[id] || {}

            return (
              <div key={id} className="card">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-base font-semibold text-white">{cfg.label}</div>
                    {isConf(id)
                      ? <span className="inline-block mt-0.5 bg-green-950 text-green-400 border border-green-800 text-xs px-2 py-0.5 rounded-full">Connected</span>
                      : <span className="inline-block mt-0.5 bg-yellow-950 text-yellow-400 border border-yellow-800 text-xs px-2 py-0.5 rounded-full">Not configured</span>}
                  </div>
                  <a href={cfg.docs} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline">API Docs</a>
                </div>

                {id === 'plaid' && (
                  <div className="mb-5 bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
                    <p className="text-xs text-blue-400/80">Plaid Link requires a backend to create link tokens. The Client ID is safe for frontend; the Secret must be server-side only. Set env to <code className="bg-blue-950 px-1 rounded">sandbox</code> for testing.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {cfg.fields.map(field => {
                    const sk = id + '_' + field.key
                    const vis = showSecrets[sk]
                    return (
                      <div key={field.key}>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">{field.label}</label>
                        <div className="relative">
                          <input
                            type={field.secret && !vis ? 'password' : 'text'}
                            className="input-field pr-12 font-mono text-sm"
                            placeholder={field.placeholder}
                            value={stored[field.key] || ''}
                            onChange={e => onChange(id, field.key, e.target.value)}
                            autoComplete="off" spellCheck={false}
                          />
                          {field.secret && (
                            <button onClick={() => setShowSecrets(p => ({...p, [sk]: !p[sk]}))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs px-1">
                              {vis ? 'Hide' : 'Show'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-800">
                  <button onClick={onSave} className="btn-primary">{saved ? 'Saved!' : 'Save Keys'}</button>
                  {isConf(id) && <button onClick={() => onClear(id)} className="text-xs text-red-400 hover:text-red-300">Clear keys</button>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
