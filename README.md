# Celo Commerce Agent 🛍️

AI‑style chat agent that turns natural‑language requests like  
“Pay 1 rupee to ramesh” into real CELO payments, with memory, limits, and vendor insights on Celo.

Built for the **Build Agents for the Real World – Celo Hackathon V2**.

---

## 1. Problem

Local commerce still runs on:

- Cash / manual UPI.
- Zero memory of past payments.
- Users having to remember amounts, vendors, and balances.

There is no simple **chat‑first agent** that understands natural language, converts from local currency (INR) to CELO, executes the payment on‑chain, and then lets you ask questions like *“How much did I pay my milk vendor this week?”*.

---

## 2. Solution – Celo Commerce Agent

Celo Commerce Agent is a lightweight payment agent for local merchants:

- Chat interface where users type or speak instructions.
- Rule‑based parser that understands a small payment/query DSL via natural language.
- Payment rail on **Celo (Forno RPC)** using a funded hot wallet.
- **INR → CELO FX** via CoinGecko, with per‑payment and per‑vendor safety limits.
- Agent **memory** stored in `memory.json`, powering analytics:
  - Last payment
  - Total spent
  - Total paid per vendor
- QR support for merchant discovery and auto‑filling pay commands.
- Vendor leaderboard + activity feed for a quick overview.

The agent focuses on one clear use case: **repeat local payments to known vendors**, executed reliably instead of over‑engineered “do everything” logic.[web:36][web:37]

---

## 3. Features

### Chat + Commands

Supported natural‑language patterns (examples):

- `Pay 1 rupee to ramesh`
- `Pay 0.01 celo to ramesh`
- `Show last payment`
- `Show total spending`
- `How much did I pay ramesh`

Under the hood, each message is parsed into:

```ts
{
  type: "payment" | "query",
  action?: "last_payment" | "total_spent" | "vendor_total",
  vendor?: string,
  amount?: number,
  currency?: "celo" | "inr",
  address?: string
}
Payments on Celo
Uses ethers + Forno RPC (RPC_URL) to send native CELO.

INR amounts are converted to CELO using CoinGecko’s simple/price API.[file:50][web:37]

Safety rails:

MAX_PAYMENT = 500 CELO hard cap per payment.

Agent checks wallet balance before sending.

Per‑vendor cap: if total to a vendor exceeds 20 CELO, payment is blocked.[file:50]

Agent Memory
All executed payments are appended to memory.json:

json
{
  "vendor": "ramesh",
  "celoSent": 0.014599,
  "txHash": "0x...",
  "time": 1773557450366
}
Memory API functions:

getLastPayment()

getTotalSpent()

getVendorTotal(vendor)

getAll()

This powers the chat queries and the dashboard charts / leaderboard.

Dashboard UI
Clean WhatsApp‑style chat bubbles on white background (only green & yellow accents).

Balance pill with CELO balance.

Agent activity log (latest at top).

Payments bar chart by vendor.

Vendor leaderboard card, highlighted with yellow/green border.

4. Architecture
High‑level:

Frontend: index.html

Plain HTML/JS/CSS, Chart.js for graphs.

Calls backend at POST /pay, GET /balance, GET /payments.

Handles voice input (Web Speech API) and QR scanning (html5-qrcode).

Backend: Node.js + Express (server.js)

POST /pay – main agent endpoint

GET /balance – wallet address & CELO balance

GET /payments – raw memory data

Core modules:

parser.js – rule‑based intent parsing.

sendTx.js – uses ethers wallet to send CELO.

convert.js – INR → CELO via CoinGecko.

memory.js – JSON‑file storage for payments.

vendors.js – vendor → address mapping.

qr.js – helper for reading QR payloads (used in frontend).

5. Backend Endpoints
POST /pay
Request:

json
{
  "message": "Pay 1 rupee to ramesh"
}
Possible responses:

json
// Successful payment
{
  "success": true,
  "vendor": "ramesh",
  "celoSent": 0.0146,
  "txHash": "0x...",
  "reply": "Payment sent: 0.0146 CELO to ramesh"
}
json
// Query
{
  "success": true,
  "reply": "Total spent: 0.3356 CELO"
}
json
// Error
{
  "success": false,
  "error": "Vendor spending limit reached"
}
GET /balance
Returns wallet address and CELO balance:

json
{
  "address": "0x...",
  "balance": "3.8657"
}
GET /payments
Returns array of all payment records from memory.

6. Running Locally
1) Clone & install
bash
git clone https://github.com/<your-username>/celo-commerce-agent.git
cd celo-commerce-agent
npm install
2) Configure environment
Create .env from example:

bash
cp .env.example .env
.env:

text
RPC_URL=https://forno.celo.org   # or Celo Sepolia RPC
PRIVATE_KEY=0xYOUR_PRIVATE_KEY   # funded test wallet
Use a test wallet with limited funds. Do not put a mainnet key here.

3) Start backend
bash
npm run start
# Agent running on port 3000
4) Open frontend
Open index.html directly in a browser, or serve via simple static server (npx serve . etc).

Make sure browser and backend are on the same machine (calls http://localhost:3000/pay).

7. Sample Flows to Demo
INR payment via chat

Input: Pay 1 rupee to ramesh

Agent:

Detects amount=1, currency=inr, vendor=ramesh.

Fetches INR→CELO price, converts amount.

Checks balances and limits, sends CELO payment.

Replies Payment sent: X CELO to ramesh with tx link in UI.

History query

Input: Show last payment

Agent reads memory.json and responds with last vendor & amount.

Vendor analytics

Input: How much did I pay ramesh

Agent aggregates all payments to ramesh and replies with total.

Dashboard updates chart + leaderboard.

QR flow

User scans merchant QR.

QR payload contains { vendor, amount, address }.

UI fills Pay <amount> to <vendor> and calls /pay.

8. Design Decisions & Future Work
Why Celo?

Fast finality & low fees make high‑frequency agent payments viable.[web:37]

Mobile‑first + stablecoin support fits local commerce and small‑ticket payments.[web:37]

Limitations / Next steps:

Parser is currently rule‑based; can be upgraded to LLM‑powered intent classification with guardrails.

Memory is a JSON file – can be replaced by a small database (SQLite/Postgres) with richer analytics.

Vendor discovery is static; can be extended with on‑chain registry / ERC‑8004 skills.[web:36][web:37]

Wallet is a hot key; production version should use contract wallet or MPC custody.

9. Hackathon Links
Hackathon: Build Agents for the Real World – Celo Hackathon V2

Docs: 
Build with AI on Celo
[web:37]

Agent examples: 
AI Agents Examples – Celo Docs
[web:51]

10. Repository Structure
text
.
├─ index.html          # Frontend UI (chat, dashboard, QR)
├─ server.js           # Express backend / main agent API
├─ parser.js           # Natural language → structured command
├─ sendTx.js           # Ethers wallet sending CELO txs
├─ convert.js          # INR → CELO via CoinGecko
├─ memory.js           # JSON-based agent memory
├─ memory.json         # Example payment history
├─ vendors.js          # Vendor → address mapping
├─ qr.js               # QR payload parser (used by frontend)
├─ package.json
├─ .env.example
└─ README.md