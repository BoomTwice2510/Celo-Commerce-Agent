// vendorStore.js
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "vendors.json");

function loadVendors() {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    // default seed
    return [
      {
        name: "ramesh",
        address: "0x1f410eb28bec2247f617e6b86b10350d77dc9679",
        limit: 20
      }
    ];
  }
}

function saveVendors(vendors) {
  fs.writeFileSync(FILE, JSON.stringify(vendors, null, 2));
}

function normalize(name) {
  return name.trim().toLowerCase();
}

function addVendor({ name, address, limit }) {
  const vendors = loadVendors();
  const n = normalize(name);
  const existing = vendors.find(v => v.name === n);
  if (existing) throw new Error("Vendor already exists");

  vendors.push({
    name: n,
    address: address.trim(),
    limit: Number(limit) || 20
  });

  saveVendors(vendors);
}

function findVendor(name) {
  const vendors = loadVendors();
  const n = normalize(name);
  return vendors.find(v => v.name === n) || null;
}

function listVendors() {
  return loadVendors();
}

module.exports = { addVendor, findVendor, listVendors };
