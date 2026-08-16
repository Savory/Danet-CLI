# Project Scaffolding Specification

## Purpose

Create a new, ready-to-run Danet application on disk from the official starter template, tailored to the database provider the developer wants to use.

## Requirements

### Requirement: New Project Command

The system SHALL expose a `danet new <name>` command that takes a mandatory project name and creates a project directory of that name in the current working directory.

#### Scenario: Creating a project by name

- **WHEN** a user runs `danet new my-danet-project`
- **THEN** the system SHALL create a `my-danet-project` directory containing a runnable Danet application

#### Scenario: Name argument omitted

- **WHEN** a user runs `danet new` without a name
- **THEN** the system SHALL reject the invocation and report that the `<name>` argument is required

### Requirement: Existing Directory Confirmation

The system SHALL prompt the user before touching a directory that may already exist, and SHALL only delete that directory when the user explicitly confirms.

#### Scenario: User confirms overwrite

- **WHEN** the system prompts `<name> folder may already exists, do you want to completely overwrite its content ? (y/N)` and the user answers `y` (case-insensitive)
- **THEN** the system SHALL recursively remove the existing `<name>` directory before scaffolding, and SHALL continue silently when no such directory exists

#### Scenario: User declines overwrite

- **WHEN** the user accepts the default answer `N` or answers anything other than `y`
- **THEN** the system SHALL leave the existing directory untouched and proceed to the scaffolding step

### Requirement: Starter Template Cloning

The system SHALL populate the new project by cloning the Danet starter repository at `https://github.com/Savory/Danet-Starter.git` into the target directory using `git`, and SHALL remove the cloned `.git` directory so the project starts with no version-control history.

#### Scenario: Clone succeeds

- **WHEN** the clone completes successfully
- **THEN** the system SHALL delete `<name>/.git` recursively and continue with database setup

#### Scenario: Clone fails

- **WHEN** the `git clone` invocation exits unsuccessfully
- **THEN** the system SHALL abort scaffolding and report a `Clone Failed` error instead of continuing

### Requirement: Database Provider Selection

The system SHALL support exactly three database providers — `mongodb`, `postgres` and `in-memory` — selectable non-interactively through the `--mongodb`, `--postgres` and `--in-memory` flags, and interactively when no such flag is given.

#### Scenario: Provider given as a flag

- **WHEN** a user runs `danet new my-project --postgres`
- **THEN** the system SHALL use `postgres` without prompting

#### Scenario: No provider flag given

- **WHEN** none of `--mongodb`, `--postgres` or `--in-memory` is passed
- **THEN** the system SHALL prompt `What database provider do you want to use ? (mongodb/postgres/in-memory)` with `mongodb` as the default, and SHALL repeat the prompt until the answer is one of the three supported providers

### Requirement: Database Code Tailoring

The system SHALL keep only the generated code belonging to the selected provider, deleting the starter's service and repository files of every other provider from the new project.

#### Scenario: Unselected provider files removed

- **WHEN** `mongodb` is selected
- **THEN** the system SHALL delete `src/database/postgres.service.ts`, `src/todo/postgres-repository.ts` and `src/todo/in-memory-repository.ts` from the new project

#### Scenario: Persistent provider wired into modules

- **WHEN** `mongodb` or `postgres` is selected
- **THEN** the system SHALL rewrite the project's `src/database/module.ts` so the provider's service is imported and declared as the `DATABASE` token injectable, and rewrite `src/todo/module.ts` so the provider's repository is imported, `DatabaseModule` is added to `imports`, and the repository is injected under the `USER_REPOSITORY` token alongside `TodoService`

#### Scenario: In-memory provider selected

- **WHEN** `in-memory` is selected
- **THEN** the system SHALL leave the starter's module code unchanged and report that the code is kept as is

### Requirement: Scaffolding Outcome Reporting

The system SHALL report the outcome of scaffolding on the console, telling the user how to run and test the new project on success, and reporting the failure without a stack trace on error.

#### Scenario: Successful scaffolding

- **WHEN** the project has been created and its database code tailored
- **THEN** the system SHALL print a completion message instructing the user to run `cd <name> && danet develop` and to run tests with `deno task test`

#### Scenario: Scaffolding fails

- **WHEN** any step of scaffolding throws
- **THEN** the system SHALL log the error message through the CLI logger and terminate the command without leaving an unhandled exception
