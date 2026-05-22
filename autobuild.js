const fs = require("fs-extra");
const path = require("path");
const events = require("events");
const cp = require("child_process");

class Builder extends events.EventEmitter {
  constructor(definition) {
    super();
    this.definition = definition;
    this.building = false;
    this.buildQueued = false;
    this.watchers = [];
  }

  async start() {
    if (this.definition.configure) {
      this.emit("configureStarted");
      try {
        const configureOutput = await execStep(this.definition.base, this.definition.configure, "configure");
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
    if (this.building) {
      this.buildQueued = true;
      return;
    }

    this.building = true;
    this.buildQueued = false;

    try {
      this.emit("buildStarted");
      const buildOutput = await execStep(this.definition.base, this.definition.build, "build");
      this.emit("buildSucceeded", buildOutput);

      if (this.definition.check) {
        this.emit("checkStarted");
        const checkOutput = await execStep(this.definition.base, this.definition.check, "check");
        this.emit("checkSucceeded", checkOutput);
      }

      if (this.definition.deploy) {
        this.emit("deployStarted");
        const deployOutput = await execDeploy(this.definition.base, this.definition.deploy);
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
      if (this.buildQueued) {
        this.build();
      }
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

function execStep(baseDir, def, stage) {
  const cwd = resolveAgainstBase(baseDir, def.cwd);
  return new Promise((resolve, reject) => {
    cp.exec(def.command, { cwd }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join("\n").trim();
      if (error) {
        reject({ stage, error, output });
        return;
      }
      resolve(output);
    });
  });
}

function execDeploy(baseDir, def) {
  if (def.command) {
    return execStep(baseDir, def, "deploy").catch((err) => {
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
