
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
        
        if (! builder.definition.check) {
            $("h1.check").hide();
            $("#check").hide();
        }
        if (! builder.definition.deploy) {
            $("h1.deploy").hide();
            $("#deploy").hide();
        }
        
        builder.on("buildStarted", function () {
            $("#status").text("Building");
            $("#status").addClass("working");
            
            $("#build p").text("Running");
            $("#build pre").text("");
        });
        
        builder.on("buildSucceeded", function (output) {
            $("#status").text("OK");
            $("#status").removeClass("working");
            $("#status").removeClass("error");            
            $("#status").addClass("success");
            
            $("#build p").text(output);
            $("#build p").text("Success");
            $("#build pre").text(output);
        });
        
        builder.on("buildFailed", function (err, output) {
            $("#status").text("ERROR");
            $("#status").removeClass("working");
            $("#status").removeClass("success");
            $("#status").addClass("error");
            
            $("#build p").text(err);
            $("#build pre").text(output);
        });
        
        builder.on("checkStarted", function () {
            $("#status").text("Checking");
            $("#status").addClass("working");
            
            $("#check p").text("Running");
            $("#check pre").text("");
        });
        
        builder.on("checkSucceeded", function (output) {
            $("#status").text("OK");
            $("#status").removeClass("working");
            $("#status").removeClass("error");
            $("#status").addClass("success");
            
            $("#check p").text("Success");
            $("#check pre").text(output);
        });
        
        builder.on("checkFailed", function (err, output) {
            $("#status").text("ERRORR");
            $("#status").removeClass("working");
            $("#status").removeClass("success");
            $("#status").addClass("error");
            
            $("#check p").text(err);
            $("#check pre").text(output);
        });
        
        builder.on("deployStarted", function () {            
            $("#status").text("Deplying");
            $("#status").addClass("working");
            
            $("#deploy p").text("Running");
            $("#deploy pre").text("");
        });
        
        builder.on("deploySucceeded", function (output) {
            $("#status").text("OK");
            $("#status").removeClass("working");
            $("#status").removeClass("error");
            $("#status").addClass("success");
            
            $("#deploy p").text("Success");
            $("#deploy pre").text(output);
        });
        
        builder.on("deployFailed", function (err, output) {
            $("#status").text("ERROR");
            $("#status").removeClass("working");
            $("#status").removeClass("success");
            $("#status").addClass("error");

            $("#deploy p").text(err);
            $("#deploy pre").text(output);
        });
    });
}
