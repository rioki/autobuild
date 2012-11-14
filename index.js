#!/usr/bin/env node --harmony

var fs   = require('fs-extra');
var path = require('path');

var ab   = require("./autobuild");
var ui   = require("./ui")

var argv = require('optimist').argv;

if (argv._.length != 1) {
    console.log("You must provide one autobuild definition.")
    return;
}

var defFile = argv._[0];
fs.readFile(defFile, "UTF-8", function (err, data) {
    if (err) throw err;
    
    var def = JSON.parse(data);
    def.base = path.dirname(defFile);
    
    var builder = ab.createBuilder(def);
    
    builder.on("buildStarted", function () {
        console.log("Build Started");
    });
    
    builder.on("buildSucceeded", function (output) {
        console.log("Build Succeeded: ");
        console.log(output);
    });
    
    builder.on("buildFailed", function (err, output) {
        console.log("Build Failed: " + err);
        console.log(output);
    });
    
    builder.on("checkStarted", function () {
        console.log("Check Started");
    });
    
    builder.on("checkSucceeded", function (output) {
        console.log("Check Succeeded: ");
        console.log(output);
    });
    
    builder.on("checkFailed", function (err, output) {
        console.log("Check Failed: " + err);
        console.log(output);
    });
    
    builder.on("deployStarted", function () {
        console.log("Deploy Started");
    });
    
    builder.on("deploySucceeded", function (output) {
        console.log("Deploy Succeeded: ");
        console.log(output);
    });
    
    builder.on("deployFailed", function (err, output) {
        console.log("Deploy Failed: " + err);
        console.log(output);
    });
    
    builder.start();
    
    if (argv.gui) {
        ui.start(builder);
    }
    
});
