// parser.js

import { listVendors } from "./vendorStore.js";

function detectVendor(text) {
  const lower = text.toLowerCase();
  const vendors = listVendors(); // [{name, address, limit, ...}]

  for (const v of vendors) {
    if (lower.includes(v.name.toLowerCase())) {
      return v.name;
    }
  }

  return null;
}

export default function parseMessage(text) {
  if (!text) return null;

  text = text.toLowerCase().trim();

  // ===== QUERIES =====

  if (text.includes("last payment")) {
    return { type: "query", action: "last_payment" };
  }

  if (text.includes("total spending") || text.includes("total spent")) {
    return { type: "query", action: "total_spent" };
  }

  if (text.includes("how much") && text.includes("pay")) {
    const vendor = detectVendor(text);
    if (vendor) {
      return { type: "query", action: "vendor_total", vendor };
    }
  }

  // ===== PAYMENTS =====

  const vendor = detectVendor(text);
  if (!vendor) return null;

  const amountMatch = text.match(/(\d+(\.\d+)?)/);
  if (!amountMatch) {
    return {
      type: "error",
      message: "Amount not detected"
    };
  }

  const amount = amountMatch[0];

  let currency = "celo";
  if (text.includes("rupee") || text.includes("rs") || text.includes("inr")) {
    currency = "inr";
  }

  return {
    type: "payment",
    vendor,
    amount,
    currency
  };
}
