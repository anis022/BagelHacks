const STORAGE_KEY = 'optiroute_keys'

export const EXCHANGES = {
  kraken: {
    label: 'Kraken', logo: 'K', color: '#5741d9',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Your Kraken API key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Your Kraken private key', secret: true }
    ],
    docs: 'https://docs.kraken.com/rest/'
  },
  binance: {
    label: 'Binance', logo: 'B', color: '#F0B90B',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Your Binance API key' },
      { key: 'apiSecret', label: 'Secret Key', placeholder: 'Your Binance secret key', secret: true }
    ],
    docs: 'https://binance-docs.github.io/apidocs/'
  },
  coinbase: {
    label: 'Coinbase', logo: 'C', color: '#1652F0',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Your Coinbase API key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Your Coinbase secret', secret: true },
      { key: 'passphrase', label: 'Passphrase', placeholder: 'Your API passphrase', secret: true }
    ],
    docs: 'https://docs.cdp.coinbase.com/'
  },
  shakepay: {
    label: 'Shakepay', logo: 'S', color: '#00D4AA',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Your Shakepay API key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Your Shakepay secret', secret: true }
    ],
    docs: 'https://shakepay.github.io/developer-documentation/'
  },
  mercadobitcoin: {
    label: 'Mercado Bitcoin', logo: 'M', color: '#F7941D',
    fields: [
      { key: 'apiKey', label: 'API ID', placeholder: 'Your MB tapi-id' },
      { key: 'apiSecret', label: 'API MAC', placeholder: 'Your MB tapi-mac secret', secret: true }
    ],
    docs: 'https://www.mercadobitcoin.com.br/trade-api/'
  },
  stripe: {
    label: 'Stripe', logo: '$', color: '#635BFF',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', placeholder: 'pk_live_...' },
      { key: 'secretKey', label: 'Secret Key', placeholder: 'sk_live_...', secret: true }
    ],
    docs: 'https://stripe.com/docs/api'
  },
  raydium: {
    label: 'Raydium (Solana)', logo: 'R', color: '#9945FF',
    fields: [
      { key: 'walletAddress', label: 'Wallet Address', placeholder: 'Your Solana wallet public key' },
      { key: 'rpcEndpoint', label: 'RPC Endpoint', placeholder: 'https://api.mainnet-beta.solana.com' }
    ],
    docs: 'https://raydium.io/swap/'
  },
  plaid: {
    label: 'Plaid (Banking)', logo: 'P', color: '#00D4FF',
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'Your Plaid client_id' },
      { key: 'secret', label: 'Secret', placeholder: 'Your Plaid secret key', secret: true },
      { key: 'env', label: 'Environment', placeholder: 'sandbox | development | production' }
    ],
    docs: 'https://plaid.com/docs/'
  }
}

export function loadKeys() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

export function saveKeys(keys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function isConfigured(id) {
  const all = loadKeys()
  const cfg = EXCHANGES[id]
  if (!cfg || !all[id]) return false
  return cfg.fields.some(f => all[id][f.key]?.length > 3)
}

export function getConfiguredList() {
  return Object.keys(EXCHANGES).filter(isConfigured)
}
