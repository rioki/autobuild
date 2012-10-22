
var fs     = require("fs-extra");
var path   = require("path");
var events = require('events');
var async  = require('async');
var cp     = require("child_process");

function Builder(definition) {
    events.EventEmitter.call(this);
    
    this.definition  = definition;
    this.building    = false;
    this.buildQueued = false;
}

Builder.super_ = events.EventEmitter;
Builder.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Builder,
        enumerable: false
    }
});

function regify(patterns) {
    var result = [];
    patterns.forEach(function (pattern) {
        result.push(new RegExp(pattern, "i"));
    });
    return result;
}

this.__defineGetter__("idle", function() {
    return status[BUILD] == IDLE && status[CHECK] == IDLE &&  status[DEPLOY] == IDLE;
});

Builder.prototype.start = function () {
    var self = this;
    
    var dirs     = self.definition.sources.directories;
    var patterns = regify(self.definition.sources.patterns);
    
    var i = dirs.length;
    dirs.forEach(function (dir) {
        fs.readdir(dir, function (err, files) {
            if (err) {
                throw err;
            }
            
            files.forEach(function (file) {
                patterns.forEach(function (pattern) {
                    if (file.match(pattern)) {
                        // TODO path relative to the autobuild.json
                        var fullFile = path.join(dir, file);                        
                        fs.watchFile(fullFile, function () {                            
                            self.build();
                        });
                    }
                });
            });            
        });
    });
}

function execBuild(def, cb) {
    cp.exec(def.command, { cwd: def.cwd }, function (err, stdout, stderr) {
        cb(err, stdout);
    });
}

function execCheck(def, cb) {
    cp.exec(def.command, { cwd: def.cwd }, function (err, stdout, stderr) {
        // REVIEW what about stderr?
        cb(err, stdout);
    });
}

function execDeploy(def, cb) {
    if (def.command) {
        cp.exec(def.command, { cwd: def.cwd }, function (err, stdout, stderr) {
            // REVIEW what about stderr?
            cb(err, stdout);
        });
    }
    else {
        var count = def.files.length;
        def.files.forEach(function (file) {
            var filePath = path.join(def.source, file);
            var targetPath = path.join(def.target, file);
            fs.copy(filePath, targetPath, function (err) {
                if (err) {                             
                    cb(err, "Failed to copy " + file + ".");                    
                }
                else {
                    count--;
                    if (count == 0) {
                        cb(null, "Copied " + def.files + ".");
                    }
                }
            });
        });
    }
}

Builder.prototype.build = function () {
    var self = this;   
    
    if (! self.building) {
        self.building = true;
        self.buildQueued = false;
                
        async.series([
            function (cb) {
                self.emit("buildStarted");
                execBuild(self.definition.build, function (err, output) {
                    if (err) {
                        self.emit("buildFailed", err, output);
                        cb(err);
                    }
                    else {
                        self.emit("buildSucceeded", output);
                        cb(null, output);
                    }
                });
            }, 
            function (cb) {
                // check is optional
                if (self.definition.check) {
                    self.emit("checkStarted");
                    execCheck(self.definition.check, function (err, output) {
                        if (err) {
                        self.emit("checkFailed", err, output);
                        cb(err);
                        }
                        else {
                            self.emit("checkSucceeded", output);
                            cb(null, output);
                        }
                    });
                }
                else {
                    cb(null, null);
                }
            },
            function (cb) {
                // deploy is optional
                if (self.definition.deploy) {
                    self.emit("deployStarted");
                    execDeploy(self.definition.deploy, function (err, output) {
                        if (err) {
                            self.emit("deployFailed", err, output);
                            cb(err);
                        }
                        else {
                            self.emit("deploySucceeded", output);
                            cb(null, output);
                        }
                    });
                }
                else {
                    cb(null, null);
                }
            }
        ], function (err, outputs) {
            self.building = false;
            if (self.buildQueued) {
                self.build();
            }
        });        
    }
    else {
        self.buildQueued = true;
    }    
}

exports.createBuilder = function (def) {
    
    return new Builder(def);
}
