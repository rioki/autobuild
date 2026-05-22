const os = require("os");

const CLEAR = "\x1b[2J\x1b[H";

function createSection(enabled) {
  return {
    enabled,
    state: enabled ? "idle" : "disabled",
    output: ""
  };
}

exports.start = function start(builder) {
  const state = {
    projectName: builder.definition.name || "Autobuild",
    status: "Watching for changes",
    lastUpdate: new Date(),
    configure: createSection(Boolean(builder.definition.configure)),
    build: createSection(true),
    check: createSection(Boolean(builder.definition.check)),
    deploy: createSection(Boolean(builder.definition.deploy))
  };

  let shuttingDown = false;

  function render() {
    const lines = [];
    lines.push("Autobuild TUI");
    lines.push("=============");
    lines.push("Project: " + state.projectName);
    lines.push("Status : " + state.status);
    lines.push("Updated: " + state.lastUpdate.toLocaleTimeString());
    lines.push("");
    lines.push(renderSection("Configure", state.configure));
    lines.push("");
    lines.push(renderSection("Build", state.build));
    lines.push("");
    lines.push(renderSection("Check", state.check));
    lines.push("");
    lines.push(renderSection("Deploy", state.deploy));
    lines.push("");
    lines.push("Press Ctrl+C to quit.");

    process.stdout.write(CLEAR + lines.join(os.EOL) + os.EOL);
  }

  function updateStatus(status) {
    state.status = status;
    state.lastUpdate = new Date();
    render();
  }

  builder.on("buildStarted", function () {
    state.build.state = "running";
    state.build.output = "";
    updateStatus("Running build");
  });

  builder.on("configureStarted", function () {
    state.configure.state = "running";
    state.configure.output = "";
    updateStatus("Running configure");
  });

  builder.on("configureSucceeded", function (output) {
    state.configure.state = "success";
    state.configure.output = output;
    updateStatus("Configure succeeded; watching for changes");
  });

  builder.on("configureFailed", function (err, output) {
    state.configure.state = "failed";
    state.configure.output = formatFailure(err, output);
    updateStatus("Configure failed; watching for changes");
  });

  builder.on("watchFailed", function (err, output) {
    const message = formatFailure(err, output);
    state.status = "Watcher setup issue";
    state.lastUpdate = new Date();
    state.build.output = message;
    render();
  });

  builder.on("buildSucceeded", function (output) {
    state.build.state = "success";
    state.build.output = output;
    updateStatus("Build succeeded");
  });

  builder.on("buildFailed", function (err, output) {
    state.build.state = "failed";
    state.build.output = formatFailure(err, output);
    updateStatus("Build failed");
  });

  builder.on("checkStarted", function () {
    state.check.state = "running";
    state.check.output = "";
    updateStatus("Running check");
  });

  builder.on("checkSucceeded", function (output) {
    state.check.state = "success";
    state.check.output = output;
    updateStatus("Check succeeded");
  });

  builder.on("checkFailed", function (err, output) {
    state.check.state = "failed";
    state.check.output = formatFailure(err, output);
    updateStatus("Check failed");
  });

  builder.on("deployStarted", function () {
    state.deploy.state = "running";
    state.deploy.output = "";
    updateStatus("Running deploy");
  });

  builder.on("deploySucceeded", function (output) {
    state.deploy.state = "success";
    state.deploy.output = output;
    updateStatus("Deploy succeeded");
  });

  builder.on("deployFailed", function (err, output) {
    state.deploy.state = "failed";
    state.deploy.output = formatFailure(err, output);
    updateStatus("Deploy failed");
  });

  process.on("SIGINT", function () {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    if (typeof builder.stop === "function") {
      builder.stop();
    }
    process.stdout.write("\nStopped autobuild.\n");
    process.exit(0);
  });

  render();
};

function renderSection(title, section) {
  if (!section.enabled) {
    return title + ": disabled";
  }

  const summary = title + ": " + section.state;
  const output = summarizeOutput(section.output);
  if (!output) {
    return summary;
  }
  return summary + "\n  " + output.replace(/\n/g, "\n  ");
}

function summarizeOutput(output) {
  if (!output) {
    return "";
  }

  const trimmed = output.trim();
  if (!trimmed) {
    return "";
  }

  const lines = trimmed.split(/\r?\n/);
  const lastLines = lines.slice(-8);
  return lastLines.join("\n");
}

function formatFailure(err, output) {
  const message = err && err.message ? err.message : String(err);
  const commandOutput = output ? output.trim() : "";
  if (!commandOutput) {
    return message;
  }
  return message + "\n" + commandOutput;
}
