const fs = require("fs-extra");
const path = require("path");
const events = require("events");
const cp = require("child_process");

let scriptCommandAvailable;

class Builder extends events.EventEmitter {
  constructor(definition) {
    super();
    this.definition = definition;
    this.building = false;
    this.running = false;
    this.buildQueued = false;
    this.runQueued = false;
    this.watchers = [];
  }

  async start() {
    if (this.definition.configure) {
      this.emit("configureStarted");
      try {
        const configureOutput = await execStep(this.definition.base, this.definition.configure, "configure", (stream, chunk) => {
          this.emit("taskOutput", { task: "configure", stream, chunk });
        });
        this.emit("configureSucceeded", configureOutput);
      } catch (err) {
        this.emit("configureFailed", err.error, err.output);
      }
    }

    const dirs = this.definition.sources.directories;
    const patterns = regify(this.definition.sources.patterns);

    dirs.forEach((dir) => {
      const fullDir = resolveAgainstBase(this.definition.base, dir);
      fs.readdir(fullDir, (err, files) => {
        if (err) {
          this.emit("watchFailed", err, "Failed to read source directory: " + fullDir);
          return;
        }

        files.forEach((file) => {
          if (!matchesAnyPattern(file, patterns)) {
            return;
          }

          const fullFile = path.join(fullDir, file);
          const watcher = fs.watch(fullFile, () => {
            this.build();
          });
          this.watchers.push(watcher);
        });
      });
    });

    this.build();
  }

  stop() {
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];
  }

  async build() {
    if (this.building || this.running) {
      this.buildQueued = true;
      return;
    }

    this.building = true;
    this.buildQueued = false;

    try {
      this.emit("buildStarted");
      const buildOutput = await execStep(this.definition.base, this.definition.build, "build", (stream, chunk) => {
        this.emit("taskOutput", { task: "build", stream, chunk });
      });
      this.emit("buildSucceeded", buildOutput);

      if (this.definition.check) {
        this.emit("checkStarted");
        const checkOutput = await execStep(this.definition.base, this.definition.check, "check", (stream, chunk) => {
          this.emit("taskOutput", { task: "check", stream, chunk });
        });
        this.emit("checkSucceeded", checkOutput);
      }

      if (this.definition.deploy) {
        this.emit("deployStarted");
        const deployOutput = await execDeploy(this.definition.base, this.definition.deploy, (stream, chunk) => {
          this.emit("taskOutput", { task: "deploy", stream, chunk });
        });
        this.emit("deploySucceeded", deployOutput);
      }
    } catch (err) {
      if (err.stage === "build") {
        this.emit("buildFailed", err.error, err.output);
      } else if (err.stage === "check") {
        this.emit("checkFailed", err.error, err.output);
      } else if (err.stage === "deploy") {
        this.emit("deployFailed", err.error, err.output);
      }
    } finally {
      this.building = false;
      this.drainQueue();
    }
  }

  async run() {
    if (!this.definition.run) {
      return;
    }

    if (this.building || this.running) {
      this.runQueued = true;
      return;
    }

    this.running = true;
    this.runQueued = false;

    try {
      this.emit("runStarted");
      const runOutput = await execStep(this.definition.base, this.definition.run, "run", (stream, chunk) => {
        this.emit("taskOutput", { task: "run", stream, chunk });
      });
      this.emit("runSucceeded", runOutput);
    } catch (err) {
      this.emit("runFailed", err.error, err.output);
    } finally {
      this.running = false;
      this.drainQueue();
    }
  }

  drainQueue() {
    if (this.building || this.running) {
      return;
    }
    if (this.buildQueued) {
      this.buildQueued = false;
      this.build();
      return;
    }
    if (this.runQueued) {
      this.runQueued = false;
      this.run();
    }
  }
}

function regify(patterns) {
  return patterns.map((pattern) => new RegExp(pattern, "i"));
}

function matchesAnyPattern(file, patterns) {
  return patterns.some((pattern) => pattern.test(file));
}

function resolveAgainstBase(baseDir, maybeRelativePath) {
  if (path.isAbsolute(maybeRelativePath)) {
    return maybeRelativePath;
  }
  return path.resolve(baseDir, maybeRelativePath);
}

function execStep(baseDir, def, stage, onOutput) {
  const cwd = resolveAgainstBase(baseDir, def.cwd);
  return new Promise((resolve, reject) => {
    const command = shouldUsePseudoTerminal() ? wrapWithScript(def.command) : def.command;
    const child = cp.spawn(command, { cwd, shell: true });
    let mergedOutput = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      mergedOutput += text;
      if (onOutput) {
        onOutput("stdout", text);
      }
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      mergedOutput += text;
      if (onOutput) {
        onOutput("stderr", text);
      }
    });

    child.on("error", (error) => {
      const output = mergedOutput.trim();
      reject({ stage, error, output });
    });

    child.on("close", (code) => {
      const output = mergedOutput.trim();
      if (code !== 0) {
        const error = new Error("Command failed with exit code " + code);
        reject({ stage, error, output });
        return;
      }
      resolve(output);
    });
  });
}

function shouldUsePseudoTerminal() {
  if (scriptCommandAvailable !== undefined) {
    return scriptCommandAvailable;
  }

  try {
    const probe = cp.spawnSync("script", ["-q", "-c", "true", "/dev/null"], { stdio: "ignore" });
    scriptCommandAvailable = probe.status === 0;
  } catch (err) {
    scriptCommandAvailable = false;
  }

  return scriptCommandAvailable;
}

function wrapWithScript(command) {
  return "script -q -e -c " + shellQuote(command) + " /dev/null";
}

function shellQuote(value) {
  return "'" + String(value).replace(/'/g, "'\\''") + "'";
}

function execDeploy(baseDir, def, onOutput) {
  if (def.command) {
    return execStep(baseDir, def, "deploy", onOutput).catch((err) => {
      err.stage = "deploy";
      throw err;
    });
  }

  return new Promise((resolve, reject) => {
    let pending = def.files.length;
    if (pending === 0) {
      resolve("No files configured for deploy.");
      return;
    }

    def.files.forEach((file) => {
      const filePath = resolveAgainstBase(baseDir, path.join(def.source, file));
      const targetPath = resolveAgainstBase(baseDir, path.join(def.target, file));

      fs.copy(filePath, targetPath, (err) => {
        if (err) {
          reject({ stage: "deploy", error: err, output: "Failed to copy " + file + "." });
          return;
        }
        pending -= 1;
        if (pending === 0) {
          resolve("Copied " + def.files.join(", ") + ".");
        }
      });
    });
  });
}

exports.createBuilder = function (def) {
  return new Builder(def);
};
