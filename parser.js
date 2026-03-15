const vendors = require("./vendors")

function detectVendor(text) {
  let vendor = null
  Object.keys(vendors).forEach(v => {
    if (text.includes(v)) vendor = v
  })
  return vendor
}

function parseMessage(text) {
  if (!text) return null

  text = text.toLowerCase().trim()

  // ========= QUERIES =========

  if (text.includes("last payment")) {
    return { type: "query", action: "last_payment" }
  }

  if (text.includes("total spending") || text.includes("total spent")) {
    return { type: "query", action: "total_spent" }
  }

  // "how much did i pay <vendor>"
  if (text.includes("how much") && text.includes("pay")) {
    const vendor = detectVendor(text)
    if (vendor) {
      return { type: "query", action: "vendor_total", vendor }
    }
  }

  // ========= PAYMENTS =========

  const amountMatch = text.match(/(\d+(\.\d+)?)/)
  let amount = "1"
  if (amountMatch) amount = amountMatch[0]

  let currency = "celo"
  if (text.includes("rupee") || text.includes("rs") || text.includes("inr")) {
    currency = "inr"
  }

  const vendor = detectVendor(text)
  if (!vendor) return null

  return {
    type: "payment",
    amount,
    currency,
    vendor,
    address: vendors[vendor]
  }
}

module.exports = parseMessage
