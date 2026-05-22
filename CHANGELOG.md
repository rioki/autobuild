# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-22

### Added
- Added a mandatory terminal UI built with `neo-blessed`.
- Added a pipeline view with task states for configure/build/check/deploy/run.
- Added a one-time optional `configure` step that runs on startup.
- Added an optional `run` step with manual trigger via `Ctrl+R`.
- Added live task output streaming into the TUI output pane.
- Added modernized CLI entrypoint and package metadata.

### Changed
- Modernized runtime requirements to Node.js 18+.
- Reworked command execution flow with async/await and improved task sequencing.
- Updated task output handling to preserve stdout/stderr ordering more like a console.
- Updated documentation to describe TUI behavior and pipeline semantics.
- Refreshed dependency versions for current Node.js compatibility.

### Removed
- Removed legacy GUI mode and all related asset files.
- Removed obsolete dependencies (`appjs`, `optimist`, `async`).
- Removed outdated GUI implementation and static UI assets.

## [0.0.2] - 2012-11-15

### Changed
- Fixed command line options in README example usage.
- Removed an outdated Known Issues entry from documentation.
- Added `MIT` license and repository metadata to `package.json`.
- Locked `appjs` to version `0.0.19` (Fixes #1).
- Removed invalid `flags` entry from `package.json`.
- Updated package version to `0.0.2`.

## [0.0.1] - 2012-11-14

### Added
- Initial release of Autobuild.
- Added the `autobuild` executable entrypoint.

### Changed
- Improved and cleaned up the original UI implementation.
- Improved README documentation.
- Fixed CLI behavior for the initial release.

[0.0.1]: https://github.com/rioki/autobuild/commits/v0.0.1
[0.0.2]: https://github.com/rioki/autobuild/compare/v0.0.1...v0.0.2
[0.1.0]: https://github.com/rioki/autobuild/compare/v0.0.2...v0.1.0
