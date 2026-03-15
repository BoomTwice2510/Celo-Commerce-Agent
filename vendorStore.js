// vendorStore.js
let vendors = [
  { name: "ramesh", address: "0x1f410eb28bec2247f617e6b86b10350d77dc9679", limit: 20 }
];

function normalize(name) {
  return name.trim().toLowerCase();
}

function addVendor({ name, address, limit }) {
  const n = normalize(name);
  const existing = vendors.find(v => v.name === n);
  if (existing) throw new Error("Vendor already exists");

  vendors.push({
    name: n,
    address: address.trim(),
    limit: Number(limit) || 20
  });
}

function findVendor(name) {
  const n = normalize(name);
  return vendors.find(v => v.name === n) || null;
}

function listVendors() {
  return vendors;
}

module.exports = { addVendor, findVendor, listVendors };
