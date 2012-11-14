
Autobuild
=========

Autbuild is continous integration on the developer PC.

The main idea behind autobuild is, instead of hitting build, check and deploy
in your IDE or command line, autobuild will to that for you. You change a file
everything gets built, checked and deployed. What build, check and deploy means
is up to you, you specify it in a JSON file. 

Examples
--------

The following example shows the autobuild definition for a make file oriented
project.

autobuild.json:

    {
        "name": "My Project",
        "sources": {
            "directories": [
                "./include",
                "./src",
                "./src/extra",
            ],
            "patterns": [".cpp", ".h"]
        },
        "build": {            
            "cwd": "./build",
            "command": "make"
        },
        "check": {
            "cwd": "./build",
            "command": "make check"
        },
        "deploy": {
            "cwd": "./build",
            "command": "make install"
        }
    }
    
The following example shows the autobuild definition for a Visual C++ 6 project.

autobuild.json:

    {
        "name": "Custom Requirements Assesment Program",
        "sources": {
            "directories": [
                "y:\\CRAP_SRC\\_inc",
                "y:\\CRAP_SRC\\crap",
                "y:\\CRAP_SRC\\utils",
            ],
            "patterns": [".cpp", ".cc", ".h", ".hpp"],
        },
        "build": {
            "cwd": "y:\\CRAP_SRC\\_equ",
            "command": "msdev.exe crap.dsw /MAKE \\"ALL - RELEASE\\""
        },
        "deploy": {
            "source": "y:\\CRAP_DO\\win23\\release",
            "target": "C:\\Program Files\\Crap",
            "files": [
                "crap.exe",
                "crap.pdb",
                "utils.dll",
                "utils.pdb"
            ]
        }
    }

Installation
------------

Autobuild uses node, you need a proper installation of node (including npm).

The easiest way to install it is with npm:

    npm install -g autobuild

Usage
-----

You can either invoke it as a command line utility

    autobuild autobuild.json
  
or with a user interface

    autobuild index.js --gui autobuild.json

Known Issues
============

* On windows not the user interface may not work because of some odd appjs shenanigans.
  When you get the error "Error: CEF location not found" that is it. 
