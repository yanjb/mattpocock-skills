#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const marketPath = path.join(root, ".claude-plugin", "marketplace.json");
const pluginPath = path.join(root, ".claude-plugin", "plugin.json");
const pkgPath = path.join(root, "package.json");

const errors = [];

function read(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    errors.push(`${path.relative(root, p)}: ${e.message}`);
    return null;
  }
}

const market = read(marketPath);
const plugin = read(pluginPath);
const pkg = read(pkgPath);

if (market) {
  for (const f of ["name", "owner", "plugins"]) {
    if (!(f in market)) errors.push(`marketplace.json missing required field: ${f}`);
  }
  if (market.owner && typeof market.owner.name !== "string") {
    errors.push("marketplace.json owner.name must be a string");
  }
  if (!Array.isArray(market?.plugins)) {
    errors.push("marketplace.json plugins must be an array");
  } else {
    for (const [i, p] of market.plugins.entries()) {
      if (!p?.name) errors.push(`plugins[${i}].name missing`);
      if (!p?.source) errors.push(`plugins[${i}].source missing`);
      if (p?.version && pkg?.version && p.version !== pkg.version) {
        errors.push(`plugins[${i}].version (${p.version}) != package.json version (${pkg.version})`);
      }
    }
  }
  if (market.version && pkg?.version && market.version !== pkg.version) {
    errors.push(`marketplace.json version (${market.version}) != package.json version (${pkg.version})`);
  }
}

if (plugin?.name && market?.plugins?.length && !market.plugins.some((p) => p.name === plugin.name)) {
  errors.push(`plugin.json name "${plugin.name}" not found in marketplace.json plugins`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("marketplace.json + plugin.json OK");
