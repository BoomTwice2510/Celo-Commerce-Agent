// memory.js

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "memory.json");

function load() {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(entry) {
  const all = load();
  all.push(entry);
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
}

function last() {
  const all = load();
  return all[all.length - 1] || null;
}

function total() {
  const all = load();
  return all.reduce((sum, x) => sum + Number(x.celoSent || 0), 0);
}

function vendor(name) {
  const all = load();
  const n = name.toLowerCase();
  return all
    .filter(x => (x.vendor || "").toLowerCase() === n)
    .reduce((sum, x) => sum + Number(x.celoSent || 0), 0);
}

module.exports = { load, save, last, total, vendor };
