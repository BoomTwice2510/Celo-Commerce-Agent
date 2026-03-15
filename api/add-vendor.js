// api/add-vendor.js
const { addVendor } = require("../vendorStore");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { pin, name, address, limit } = req.body || {};

  // simple admin pin, hardcoded for now
  if (pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ success: false, error: "Invalid PIN" });
  }

  if (!name || !address) {
    return res.status(400).json({ success: false, error: "Name and address required" });
  }

  try {
    addVendor({ name, address, limit });
    return res.status(200).json({ success: true, vendor: { name, address, limit } });
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
};
