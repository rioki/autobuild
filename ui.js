
exports.start = function (builder) {
    var appjs = require("appjs");
    appjs.serveFilesFrom(__dirname + "/assets");
    var window = appjs.createWindow({width: 800, height: 600, alpha: false});
    
    window.on("create", function(){
        window.frame.show();
    });
    
    window.on("ready", function() {  
        window.require = require;
        window.process = process;
        window.module = module;

        window.addEventListener("keydown", function(e){
            // show chrome devtools on f12 or commmand+option+j
            if (e.keyIdentifier === "F12" || e.keyCode === 74 && e.metaKey && e.altKey) {
            window.frame.openDevTools();
            }
        });    
        
        var $ = window.$;
        $("h1").text(builder.definition.name);
        
        $("#status").text("Idle");
        $("#status").addClass("undet");
        
        $("#build").addClass("undet");
        $("#build p").text("Not run yet.");
        
        if (builder.definition.check) {
            $("#check").addClass("undet");            
            $("#check p").text("Not run yet.");
        }
        else {
            $("#check").hide();
        }
        if (builder.definition.deploy) {
            $("#deploy").addClass("undet");
            $("#deploy p").text("Not run yet.");
        }
        else {
            $("#deploy").hide();
        }
        
        builder.on("buildStarted", function () {
            $("#status").text("Building");
            $("#status").removeClass();
            $("#status").addClass("working");
            
            $("#build").removeClass();
            $("#build").addClass("working");
            $("#build p").text("Running");
            $("#build pre").text("");
        });
        
        builder.on("buildSucceeded", function (output) {
            $("#status").text("Success");
            $("#status").removeClass();
            $("#status").addClass("success");
            
            $("#build").removeClass();
            $("#build").addClass("success");
            $("#build p").text(output);
            $("#build p").text("Success");
            $("#build pre").text(output);
        });
        
        builder.on("buildFailed", function (err, output) {
            $("#status").text("Error");
            $("#status").removeClass();
            $("#status").addClass("error");
            
            $("#build").removeClass();
            $("#build").addClass("error");
            $("#build p").text(err);
            $("#build pre").text(output);
        });
        
        builder.on("checkStarted", function () {
            $("#status").text("Checking");
            $("#status").removeClass();
            $("#status").addClass("working");
            
            $("#check").removeClass();
            $("#check").addClass("working");
            $("#check p").text("Running");
            $("#check pre").text("");
        });
        
        builder.on("checkSucceeded", function (output) {
            $("#status").text("Success");
            $("#status").removeClass();
            $("#status").addClass("success");
            
            $("#check").removeClass();
            $("#check").addClass("success");
            $("#check p").text("Success");
            $("#check pre").text(output);
        });
        
        builder.on("checkFailed", function (err, output) {
            $("#status").text("Error");
            $("#status").removeClass();
            $("#status").addClass("error");
            
            $("#check").removeClass();
            $("#check").addClass("error");
            $("#check p").text(err);
            $("#check pre").text(output);
        });
        
        builder.on("deployStarted", function () {
            $("#status").text("Deploying");
            $("#status").removeClass();
            $("#status").addClass("working");
            
            $("#deploy").removeClass();
            $("#deploy").addClass("working");
            $("#deploy p").text("Running");
            $("#deploy pre").text("");
        });
        
        builder.on("deploySucceeded", function (output) {
            $("#status").text("Success");
            $("#status").removeClass();
            $("#status").addClass("success");
            
            $("#deploy").removeClass();
            $("#deploy").addClass("success");
            $("#deploy p").text("Success");
            $("#deploy pre").text(output);
        });
        
        builder.on("deployFailed", function (err, output) {
            $("#status").text("Error");
            $("#status").removeClass();
            $("#status").addClass("error");
            
            $("#deploy").removeClass();
            $("#deploy").addClass("error");
            $("#deploy p").text(err);
            $("#deploy pre").text(output);
        });
    });
}
