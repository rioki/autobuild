
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

    autobuild index.js autobuild.json --gui 
    
License
-------

Copyright (c) 2012 Sean Farrell

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
