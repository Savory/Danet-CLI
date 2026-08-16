# Deno Deploy Publishing Specification

## Purpose

Publish a Danet application to Deno Deploy in a single command, bundling the project and handing the resulting file to `deployctl` without the developer installing or configuring anything first.

## Requirements

### Requirement: Deploy Command

The system SHALL expose a `danet deploy` command that bundles the current project and deploys the resulting bundle to Deno Deploy.

#### Scenario: Deploying a project

- **WHEN** a user runs `danet deploy` with the required options from a Danet project root
- **THEN** the system SHALL bundle the project and then deploy the bundle to Deno Deploy

### Requirement: Deploy Options

The system SHALL accept a required `-p, --project <project>` target project name, a required `-t, --token <token>` Deno Deploy API token, an optional `-e, --entrypoint <entrypoint>` defaulting to `run.ts`, and an optional `-b, --bundle <bundle>` output file name defaulting to `bundle.js`.

#### Scenario: Required options missing

- **WHEN** `--project` or `--token` is not supplied
- **THEN** the system SHALL reject the invocation and report the missing required option instead of deploying

#### Scenario: Defaults applied

- **WHEN** neither `--entrypoint` nor `--bundle` is supplied
- **THEN** the system SHALL bundle `run.ts` into a file named `bundle.js`

### Requirement: Bundle Before Deploy

The system SHALL bundle the project as part of the deploy command, producing the bundle at `./bundle/<bundle>` and using that same file as the deployment entrypoint.

#### Scenario: Bundle produced and deployed

- **WHEN** `danet deploy --project my-app --token <token>` is run
- **THEN** the system SHALL produce `./bundle/bundle.js` and pass that path to the deployment step

### Requirement: Deployctl Provisioning

The system SHALL make `deployctl` available before deploying by installing it globally from `jsr:@deno/deployctl`, overwriting any existing installation so the version used is current.

#### Scenario: Deployctl not installed

- **WHEN** the deploy command runs on a machine where `deployctl` is absent or outdated
- **THEN** the system SHALL install it before invoking the deployment, and its installation output SHALL appear in the terminal

### Requirement: Deployment Invocation

The system SHALL invoke `deployctl deploy` with the target project name, the supplied API token and the bundled file path, streaming the deployment progress to the terminal.

#### Scenario: Deployment runs

- **WHEN** the deployment is invoked
- **THEN** the system SHALL pass `--project <project>`, `--token <token>` and the bundle path to `deployctl deploy`, and the deployment output SHALL be shown to the user

### Requirement: Deployment Error Reporting

The system SHALL surface any error output produced by the deployment tool to the user's standard error stream and stop, rather than reporting a silent success.

#### Scenario: Deployment writes errors

- **WHEN** `deployctl` produces error output
- **THEN** the system SHALL print that output to standard error and end the command without further work
