
Autobuild
=========

Autbuild is continous integration on the developer PC.

Example
-------

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
            "workingDir": "./build",
            "command": "make"
        },
        "check": {
            "workingDir": "./build",
            "command": "make check"
        },
        "deploy": {
            "workingDir": "./build",
            "command": "make install"
        }
    }
    
The following example shows the autobuild definition for a Visual C++ 6 project.

autobuild.json

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
            "workingDir": "y:\\CRAP_SRC\\_equ",
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
    