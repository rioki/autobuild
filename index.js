#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const ab = require("./autobuild");

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

  builder.on("buildStarted", function () {
    console.log("Build Started");
  });

  builder.on("buildSucceeded", function (output) {
    console.log("Build Succeeded:");
    console.log(output);
  });

  builder.on("buildFailed", function (err, output) {
    console.log("Build Failed: " + err.message);
    console.log(output);
  });

  builder.on("checkStarted", function () {
    console.log("Check Started");
  });

  builder.on("checkSucceeded", function (output) {
    console.log("Check Succeeded:");
    console.log(output);
  });

  builder.on("checkFailed", function (err, output) {
    console.log("Check Failed: " + err.message);
    console.log(output);
  });

  builder.on("deployStarted", function () {
    console.log("Deploy Started");
  });

  builder.on("deploySucceeded", function (output) {
    console.log("Deploy Succeeded:");
    console.log(output);
  });

  builder.on("deployFailed", function (err, output) {
    console.log("Deploy Failed: " + err.message);
    console.log(output);
  });

  builder.start();
}

main().catch(function (err) {
  console.error(err.message);
  process.exitCode = 1;
});
