const parse = require("./parser");
const sendTx = require("./sendTx");
const inrToCelo = require("./convert");
const memory = require("./memory");

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

    // =========================
    // PAYMENT
    // =========================
    if (intent.type === "payment") {

      let amount = intent.amount;

      // INR → CELO conversion
      if (intent.currency === "inr") {
        amount = await inrToCelo(amount);
      }

      amount = Number(amount);

      if (!amount || amount <= 0) {
        return { reply: "Invalid payment amount." };
      }

      const txHash = await sendTx(intent.address, amount);

      memory.save({
        vendor: intent.vendor,
        celoSent: amount,
        txHash: txHash,
        time: Date.now()
      });

      return {
        reply: `Paid ${amount} CELO to ${intent.vendor}`,
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
