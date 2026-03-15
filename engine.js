const parse = require("./parser").default;
const sendTx = require("./sendTx");
const inrToCelo = require("./convert");
const memory = require("./memory");
const { findVendor } = require("./vendorStore");

async function runAgent(message) {
  try {

    const intent = parse(message);

    if (!intent) {
      return { reply: "I couldn't understand that payment." };
    }

    // =========================
    // QUERY
    // =========================
    if (intent.type === "query") {

      if (intent.action === "last_payment") {
        const last = memory.last();

        if (!last) {
          return { reply: "No payments yet." };
        }

        return {
          reply: `Last payment: ${last.celoSent} CELO to ${last.vendor}`
        };
      }

      if (intent.action === "total_spent") {
        const total = memory.total();

        return {
          reply: `Total spent: ${total} CELO`
        };
      }

      if (intent.action === "vendor_total") {
        const total = memory.vendor(intent.vendor);

        return {
          reply: `You paid ${total} CELO to ${intent.vendor}`
        };
      }

      return { reply: "Unknown query." };
    }

    // PAYMENT
if (intent.type === "payment") {
  const vendor = findVendor(intent.vendor);
  if (!vendor) {
    return {
      reply: `I don't know vendor "${intent.vendor}". Ask admin to onboard this shop first.`
    };
  }

  let amount = intent.amount;

  if (intent.currency === "inr") {
    amount = await inrToCelo(amount);
  }

  amount = Number(amount);

  if (!amount || amount <= 0) {
    return { reply: "Invalid payment amount." };
  }

  if (Number(vendor.limit) && amount > Number(vendor.limit)) {
    return {
      reply: `This exceeds the limit for ${vendor.name} (${vendor.limit} CELO).`
    };
  }

  const txHash = await sendTx(vendor.address, amount);

  memory.save({
    vendor: vendor.name,
    celoSent: amount,
    txHash,
    time: Date.now()
  });

  return {
    reply: `Paid ${amount} CELO to ${vendor.name}`,
    txHash
  };
}

    return { reply: "Unknown command." };

  } catch (err) {
    console.error("Agent error:", err);

    return {
      reply: "Something went wrong processing the payment."
    };
  }
}

module.exports = runAgent;
