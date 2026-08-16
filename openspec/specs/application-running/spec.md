# Application Running Specification

## Purpose

Run a Danet application from its project root without the developer having to remember the Deno permission flags, in either a file-watching development mode or a plain production mode.

## Requirements

### Requirement: Development Mode Command

The system SHALL expose a `danet develop` command that runs the project's `run.ts` entrypoint with file watching enabled, so the application restarts when source files change.

#### Scenario: Starting in development mode

- **WHEN** a user runs `danet develop` from a Danet project root
- **THEN** the system SHALL start the application with file watching and keep running until the process is stopped

#### Scenario: Sources change while running

- **WHEN** a project source file changes while `danet develop` is running
- **THEN** the running application SHALL be reloaded automatically

### Requirement: Production Mode Command

The system SHALL expose a `danet start` command that runs the project's `run.ts` entrypoint once, without file watching.

#### Scenario: Starting in production mode

- **WHEN** a user runs `danet start` from a Danet project root
- **THEN** the system SHALL run the application without watching files, and SHALL return once the application process ends

### Requirement: Runtime Permissions

The system SHALL grant the running application the network, read, environment and unstable-API permissions it needs, so that no permission flags have to be supplied by the user.

#### Scenario: Application needs network and environment access

- **WHEN** the application is started by either `danet develop` or `danet start`
- **THEN** it SHALL run with network access, filesystem read access, environment variable access and unstable APIs enabled

### Requirement: Console Passthrough

The system SHALL pass the running application's console output through to the user's terminal unmodified.

#### Scenario: Application logs while running

- **WHEN** the application writes to standard output
- **THEN** that output SHALL appear directly in the terminal that invoked the command

### Requirement: Entrypoint Convention

The system SHALL run the project entrypoint `run.ts` resolved from the current working directory, and SHALL take no options or arguments for either running command.

#### Scenario: Invoked outside a Danet project

- **WHEN** `danet develop` or `danet start` is run from a directory that has no `run.ts`
- **THEN** the underlying runtime error SHALL be surfaced to the terminal and no application SHALL start
