#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const ab = require("./autobuild");
const tui = require("./tui");

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length !== 1) {
    console.error("Usage: autobuild <autobuild.json>");
    process.exitCode = 1;
    return;
  }

  const defFile = path.resolve(argv[0]);
  const data = await fs.readFile(defFile, "utf8");
  const def = JSON.parse(data);
  def.base = path.dirname(defFile);

  const builder = ab.createBuilder(def);
  tui.start(builder);
  await builder.start();
}

main().catch(function (err) {
  console.error(err.message);
  process.exitCode = 1;
});
