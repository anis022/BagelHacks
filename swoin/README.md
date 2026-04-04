# Swoin

Cross-border stablecoin payment UI with bridge routing plus a Solana devnet wallet send flow.

## Setup

```bash
cd /home/runner/work/BagelHacks/BagelHacks/swoin
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

- `LIFI_API_KEY` (recommended): enables real LI.FI route quotes.
- `DATABASE_URL` (optional): stores transfers in Postgres; otherwise in-memory.
- `NEXT_PUBLIC_APP_URL` (optional): app base URL.
- `NEXT_PUBLIC_SOLANA_RPC_URL` (optional): Solana RPC endpoint. Default is `https://api.devnet.solana.com`.

## Wallet + devnet flow

- Use Brave with Phantom/Solflare extension (or any supported Solana wallet).
- Connect wallet from navbar or send page.
- On `/send`, when source chain is **Solana**, sending requires a connected wallet.
- The app submits a **devnet** transfer signed by that connected wallet, so funds come out of that wallet.
- Transaction hash and sender wallet are shown on the status page.
