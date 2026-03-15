require("dotenv").config()

const express = require("express")
const cors = require("cors")
const { ethers } = require("ethers")

const parseMessage = require("./parser")
const sendTx = require("./sendTx")
const inrToCelo = require("./convert")
const memory = require("./memory")

const app = express()

app.use(cors())
app.use(express.json())

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

const MAX_PAYMENT = 500 // CELO cap per payment

// =============================
// ROOT ENDPOINT (Vercel preview)
// =============================
app.get("/", (req, res) => {
  res.json({
    agent: "Celo Local Commerce Agent ✅",
    endpoints: {
      pay: "POST /pay {message: 'Pay 10 rupee to vendor'}",
      balance: "GET /balance", 
      payments: "GET /payments"
    }
  })
})

// =============================
// PAYMENT ENDPOINT
// =============================
app.post("/pay", async (req, res) => {
  const text = req.body.message
  if (!text) {
    return res.json({ success: false, error: "Empty message" })
  }

  const parsed = parseMessage(text)
  console.log("Parsed:", parsed)

  if (!parsed) {
    return res.json({
      success: false,
      error: "Could not understand message",
      reply: "Sorry, I could not understand that. Try: 'Pay 1 rupee to ramesh' or 'Show last payment'."
    })
  }

  // =============================
  // QUERY COMMANDS
  // =============================
  if (parsed.type === "query") {
    if (parsed.action === "last_payment") {
      const last = memory.getLastPayment()
      if (!last) {
        return res.json({ success: true, reply: "No payments yet" })
      }
      return res.json({
        success: true,
        reply: `Last payment: ${last.celoSent} CELO to ${last.vendor}`
      })
    }

    if (parsed.action === "total_spent") {
      const total = memory.getTotalSpent()
      return res.json({
        success: true,
        reply: `Total spent: ${total} CELO`
      })
    }

    if (parsed.action === "vendor_total") {
      const total = memory.getVendorTotal(parsed.vendor)
      return res.json({
        success: true,
        reply: `Total paid to ${parsed.vendor}: ${total} CELO`
      })
    }

    return res.json({
      success: false,
      error: "Unknown query type"
    })
  }

  // =============================
  // PAYMENT EXECUTION
  // =============================
  try {
    let amountToSend = parsed.amount

    // INR → CELO conversion
    if (parsed.currency === "inr") {
      amountToSend = await inrToCelo(parsed.amount)
      console.log("Converted CELO:", amountToSend)
    }

    amountToSend = Number(amountToSend)

    if (!amountToSend || amountToSend <= 0) {
      return res.json({
        success: false,
        error: "Invalid payment amount"
      })
    }

    if (amountToSend > MAX_PAYMENT) {
      return res.json({
        success: false,
        error: "Payment exceeds agent limit"
      })
    }

    const balance = await provider.getBalance(wallet.address)
    const celoBalance = Number(ethers.formatEther(balance))
    console.log("Wallet balance:", celoBalance)

    if (celoBalance < amountToSend) {
      return res.json({
        success: false,
        error: "Insufficient wallet balance"
      })
    }

    const vendorTotal = memory.getVendorTotal(parsed.vendor)
    console.log("Vendor total:", vendorTotal)

    if (vendorTotal > 20) {
      return res.json({
        success: false,
        error: "Vendor spending limit reached"
      })
    }

    const txHash = await sendTx(parsed.address, amountToSend)

    memory.savePayment({
      vendor: parsed.vendor,
      celoSent: amountToSend,
      txHash,
      time: Date.now()
    })

    return res.json({
      success: true,
      vendor: parsed.vendor,
      celoSent: amountToSend,
      txHash,
      reply: `Payment sent: ${amountToSend} CELO to ${parsed.vendor}`
    })
  } catch (err) {
    console.error("Transaction error:", err)
    return res.json({
      success: false,
      error: "Transaction failed"
    })
  }
})

// =============================
// WALLET BALANCE API
// =============================
app.get("/balance", async (req, res) => {
  try {
    const balance = await provider.getBalance(wallet.address)
    const celo = Number(ethers.formatEther(balance)).toFixed(4)
    res.json({
      address: wallet.address,
      balance: celo
    })
  } catch {
    res.json({
      error: "Could not fetch balance"
    })
  }
})

// =============================
// PAYMENT HISTORY API
// =============================
app.get("/payments", (req, res) => {
  const data = memory.getAll()
  res.json(data)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Agent running on port ${port}`)
})
