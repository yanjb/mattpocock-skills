#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkgPath = path.join(root, "package.json");
const marketPath = path.join(root, ".claude-plugin", "marketplace.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const market = JSON.parse(fs.readFileSync(marketPath, "utf8"));

const next = pkg.version;
if (!next) {
  console.error("package.json has no version");
  process.exit(1);
}

let changed = false;
if (market.version !== next) {
  market.version = next;
  changed = true;
}
for (const plugin of market.plugins ?? []) {
  if (plugin.version !== next) {
    plugin.version = next;
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(marketPath, JSON.stringify(market, null, 2) + "\n");
  console.log(`synced marketplace.json version -> ${next}`);
} else {
  console.log(`marketplace.json already at ${next}`);
}
