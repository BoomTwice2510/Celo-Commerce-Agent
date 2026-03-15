Celo Commerce Agent 🛍️
AI‑style chat agent that turns natural‑language requests like
“Pay 1 rupee to ramesh” into real CELO payments, with memory, limits, and vendor insights on Celo.

Built for the Build Agents for the Real World – Celo Hackathon V2 and registered as an ERC‑8004 agent.

1. Problem
Local commerce still runs on:

Cash / manual UPI.

Zero memory of past payments.

Users having to remember amounts, vendors, and balances.

There is no simple chat‑first agent that understands natural language, converts from local currency (INR) to CELO, executes the payment on‑chain, and then lets you ask questions like “How much did I pay my milk vendor this week?”.

2. Solution – Celo Commerce Agent
Celo Commerce Agent is a lightweight payment agent for local merchants:

Mobile‑friendly chat interface where users type instructions.

Rule‑based parser that understands a small payment/query DSL via natural language.

Payment rail on Celo (Forno RPC) using an agent‑controlled wallet.

INR → CELO FX via CoinGecko, with per‑payment and per‑vendor safety limits.

Agent memory stored in memory.json, powering analytics:

Last payment

Total spent

Total paid per vendor

QR support for merchant discovery and auto‑filling pay commands.

Simple vendor leaderboard / history in the UI.

The agent focuses on one clear use case: repeat local payments to known vendors, executed reliably instead of over‑engineered “do everything” logic.

3. Features
Chat + Commands
Supported natural‑language patterns (examples):

Pay 1 rupee to ramesh

Pay 0.01 celo to ramesh

Show last payment

Show total spending

How much did I pay ramesh

Under the hood, each message is parsed into:

ts
{
  type: "payment" | "query",
  action?: "last_payment" | "total_spent" | "vendor_total",
  vendor?: string,
  amount?: number,
  currency?: "celo" | "inr",
  address?: string
}
Payments on Celo
Uses ethers + Celo RPC (RPC_URL) to send native CELO from the agent wallet.

INR amounts are converted to CELO using CoinGecko’s simple/price API.

Safety rails:

MAX_PAYMENT = 500 CELO hard cap per payment.

Agent checks wallet balance before sending.

Per‑vendor cap: if total to a vendor exceeds 20 CELO, payment is blocked.

Agent Memory
All executed payments are appended to memory.json:

json
{
  "vendor": "ramesh",
  "celoSent": 0.014599,
  "txHash": "0x...",
  "time": 1773557450366
}
Memory helper functions:

getLastPayment()

getTotalSpent()

getVendorTotal(vendor)

getAll()

These power both chat queries and the simple dashboard.

Dashboard UI
Clean WhatsApp‑style chat bubbles on white background with green/yellow accents.

Balance pill with CELO balance.

Basic activity log and vendor totals fetched from /api/pay + memory.json.

4. Architecture
High‑level:

Frontend: public/index.html

Plain HTML/JS/CSS.

Calls backend at POST /api/pay.

Handles voice input (Web Speech API) and QR scanning (html5‑qrcode).

Backend: Vercel API routes (Node.js)

api/pay.js – main agent endpoint (wraps engine.js).

Core modules:

parser.js – rule‑based intent parsing.

engine.js – orchestrates parse → checks → FX → sendTx → memory.

sendTx.js – uses ethers wallet to send CELO.

convert.js – INR → CELO via CoinGecko.

wallet.js – provider + signer helpers.

memory.js – JSON‑file storage for payments.

vendors.js – vendor → address mapping.

qr.js – helper for reading QR payloads.

5. Backend Endpoint
POST /api/pay
Request:

json
{
  "message": "Pay 1 rupee to ramesh"
}
Successful payment:

json
{
  "success": true,
  "vendor": "ramesh",
  "celoSent": 0.0146,
  "txHash": "0x...",
  "reply": "Payment sent: 0.0146 CELO to ramesh"
}
Query response:

json
{
  "success": true,
  "reply": "Total spent: 0.3356 CELO"
}
Error example:

json
{
  "success": false,
  "error": "Vendor spending limit reached"
}
6. Running Locally
Clone & install

bash
git clone https://github.com/boomtwice2510/celo-commerce-agent.git
cd celo-commerce-agent
npm install
Configure environment

Create .env:

bash
RPC_URL=https://forno.celo.org          # or Celo Sepolia RPC
PRIVATE_KEY=0xYOUR_PRIVATE_KEY          # funded wallet (test funds for dev)
Use a low‑funded wallet; do not use a primary mainnet key.

Start dev server

bash
npm run dev
# App running on http://localhost:3000
Open frontend

Open http://localhost:3000/ in the browser.
Chat UI will call http://localhost:3000/api/pay.

7. Deployment
Frontend + backend: deployed on Vercel.

Live app: https://celo-commerce.vercel.app/

APIs:

POST https://celo-commerce.vercel.app/api/pay

8. ERC‑8004 / Agent Identity
This agent is registered as an ERC‑8004 identity:

Agentscan page:
https://agentscan.info/agents/20e4fdaa-ef25-4df1-8fb6-cf92686238e7

Services:

agentWallet – eip155:42220:0x... (Celo mainnet agent wallet).

This makes the agent discoverable by 8004‑compatible explorers and tools.

9. Sample Flows to Demo
INR payment via chat
User types: Pay 1 rupee to ramesh.

Agent detects amount=1, currency=inr, vendor=ramesh.

Fetches INR→CELO, converts amount.

Checks balances and limits, sends CELO payment.

Replies with Payment sent: X CELO to ramesh plus tx hash (linked in UI).

History query
Input: Show last payment

Agent reads memory.json and responds with last vendor & amount.

Vendor analytics
Input: How much did I pay ramesh

Agent aggregates all payments to ramesh and replies with the total.

QR flow
User scans merchant QR (contains { vendor, address }).

UI pre‑fills Pay <amount> to <vendor> and calls /api/pay.

10. Design Decisions & Future Work
Why Celo?

Fast finality & low fees make high‑frequency agent payments viable.

Mobile‑first focus and stablecoins fit local, small‑ticket commerce.

Limitations / next steps:

Parser is rule‑based; can be upgraded to LLM‑powered intent classification with guardrails.

Memory is a JSON file – can move to SQLite/Postgres for richer analytics.

Vendor discovery is static; future version can use an on‑chain vendor registry / 8004 skills.

Wallet is a hot key; production version should use contract wallet or MPC custody.

11. Repository Structure
text
.
├─ .vercel/              # Vercel deployment metadata
├─ api/
│  ├─ pay.js             # /api/pay endpoint (main agent API)
│  └─ sendTx.js          # Low-level CELO transfer helper for API
├─ lib/
│  └─ wallet.js          # Ethers provider + wallet utils
├─ node_modules/
├─ public/
│  ├─ index.html         # Frontend chat UI (served by Vercel)
│  └─ logo.png           # Agent logo (used in UI + Agentscan)
├─ memory.json           # JSON payment history store
├─ .env                  # Local env vars (RPC_URL, PRIVATE_KEY)
├─ .env.example          # Sample env template
├─ .env.local            # Optional local overrides for dev
├─ .gitignore
├─ convert.js            # INR → CELO conversion logic
├─ engine.js             # Orchestrates parse → checks → sendTx → memory
├─ memory.js             # Helper functions to read/write memory.json
├─ package.json
├─ package-lock.json
├─ parser.js             # Natural language → structured command
├─ qr.js                 # QR payload parser
├─ README.md
├─ vendors.js            # Vendor → address mapping
└─ vercel.json           # Vercel config (routes/builds)
