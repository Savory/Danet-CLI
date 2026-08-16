# Bundling Specification

## Purpose

Bundle a Danet application and its dependencies into a single JavaScript file suitable for production distribution or deployment.

## Requirements

### Requirement: Bundle Command

The system SHALL expose a `danet bundle <name>` command, where `<name>` is the mandatory file name of the bundle to produce.

#### Scenario: Bundling with an output name

- **WHEN** a user runs `danet bundle app.js` from a Danet project root
- **THEN** the system SHALL produce a single bundled file named `app.js`

#### Scenario: Name argument omitted

- **WHEN** a user runs `danet bundle` without a name
- **THEN** the system SHALL reject the invocation and report that the `<name>` argument is required

### Requirement: Configurable Entrypoint

The system SHALL bundle starting from the entrypoint given by the `-e, --entrypoint <entrypoint>` option, defaulting to `run.ts`.

#### Scenario: Default entrypoint

- **WHEN** no entrypoint option is passed
- **THEN** the system SHALL bundle `run.ts`

#### Scenario: Custom entrypoint

- **WHEN** a user runs `danet bundle app.js --entrypoint main.ts`
- **THEN** the system SHALL bundle `main.ts` instead of `run.ts`

### Requirement: Bundle Output Directory

The system SHALL write the bundle into a `./bundle` directory relative to the current working directory, as `./bundle/<name>`.

#### Scenario: Bundle written

- **WHEN** `danet bundle app.js` completes
- **THEN** the bundled output SHALL exist at `./bundle/app.js`

### Requirement: Clean Output Directory

The system SHALL start every bundling run from a clean output directory, recursively removing an existing `./bundle` directory and recreating it before writing.

#### Scenario: Previous bundle present

- **WHEN** a `./bundle` directory already exists from a previous run
- **THEN** the system SHALL delete it and its contents, recreate it, and write only the current bundle into it

### Requirement: Bundling Completion

The system SHALL wait for the bundling process to finish before the command returns, so the output file is complete when control returns to the user.

#### Scenario: Command returns

- **WHEN** the `danet bundle` command returns
- **THEN** the bundling subprocess SHALL have terminated and its full output SHALL have been written to the bundle file
