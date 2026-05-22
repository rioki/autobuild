const blessed = require("neo-blessed");

const TASK_ORDER = ["configure", "build", "check", "deploy"];
const TASK_LABEL = { configure: "Configure", build: "Build", check: "Check", deploy: "Deploy" };
const TASK_COLOR = { idle: "gray", running: "blue", success: "green", failed: "red", disabled: "gray" };

exports.start = async function start(builder) {
  const screen = blessed.screen({ smartCSR: true, title: "autobuild" });

  const pipelineBox = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: 5,
    label: " Pipeline ",
    border: "line",
    tags: true,
    padding: { left: 1, right: 1 }
  });

  const pipelineText = blessed.box({
    parent: pipelineBox,
    top: 1,
    left: 0,
    width: "100%-2",
    height: 1,
    tags: true,
    content: ""
  });

  const outputBox = blessed.box({
    parent: screen,
    top: 5,
    left: 0,
    width: "100%",
    height: "100%-6",
    label: " Output ",
    border: "line",
    tags: false,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    mouse: true,
    padding: { left: 1, right: 1 }
  });

  const footer = blessed.box({
    parent: screen,
    bottom: 0,
    left: 1,
    width: "100%-2",
    height: 1,
    style: { fg: "gray" },
    content: "Ctrl+C to quit"
  });

  const taskState = {
    configure: builder.definition.configure ? "idle" : "disabled",
    build: "idle",
    check: builder.definition.check ? "idle" : "disabled",
    deploy: builder.definition.deploy ? "idle" : "disabled"
  };

  function renderPipeline() {
    const parts = TASK_ORDER.map(function (task) {
      const color = TASK_COLOR[taskState[task]];
      return "{" + color + "-fg}[ " + TASK_LABEL[task] + " ]{/}";
    });
    pipelineText.setContent(parts.join("  ->  "));
  }

  function setActiveTask(task) {
    outputBox.setLabel(" Output - " + TASK_LABEL[task] + " ");
  }

  function setOutput(output) {
    outputBox.setContent(output && output.trim() ? output.trim() : "(no output)");
    outputBox.setScrollPerc(100);
  }

  function onTaskStarted(task) {
    taskState[task] = "running";
    setActiveTask(task);
    setOutput("Running...");
    renderPipeline();
    screen.render();
  }

  function onTaskSucceeded(task, output) {
    taskState[task] = "success";
    setActiveTask(task);
    setOutput(output);
    renderPipeline();
    screen.render();
  }

  function onTaskFailed(task, err, output) {
    taskState[task] = "failed";
    setActiveTask(task);
    const errLine = err && err.message ? err.message : String(err);
    const body = output && output.trim() ? output.trim() : "(no output)";
    setOutput(errLine + "\n\n" + body);
    renderPipeline();
    screen.render();
  }

  builder.on("configureStarted", function () { onTaskStarted("configure"); });
  builder.on("configureSucceeded", function (output) { onTaskSucceeded("configure", output); });
  builder.on("configureFailed", function (err, output) { onTaskFailed("configure", err, output); });

  builder.on("buildStarted", function () { onTaskStarted("build"); });
  builder.on("buildSucceeded", function (output) { onTaskSucceeded("build", output); });
  builder.on("buildFailed", function (err, output) { onTaskFailed("build", err, output); });

  builder.on("checkStarted", function () { onTaskStarted("check"); });
  builder.on("checkSucceeded", function (output) { onTaskSucceeded("check", output); });
  builder.on("checkFailed", function (err, output) { onTaskFailed("check", err, output); });

  builder.on("deployStarted", function () { onTaskStarted("deploy"); });
  builder.on("deploySucceeded", function (output) { onTaskSucceeded("deploy", output); });
  builder.on("deployFailed", function (err, output) { onTaskFailed("deploy", err, output); });

  builder.on("watchFailed", function (err, output) {
    setActiveTask("build");
    const errLine = err && err.message ? err.message : String(err);
    setOutput(errLine + "\n\n" + (output || ""));
    screen.render();
  });

  screen.key(["C-c"], function () {
    if (typeof builder.stop === "function") {
      builder.stop();
    }
    footer.setContent("Stopping...");
    screen.render();
    screen.destroy();
    process.exit(0);
  });

  renderPipeline();
  outputBox.setContent("Waiting for first run...");
  screen.render();
};
