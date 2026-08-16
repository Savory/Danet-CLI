# Component Generation Specification

## Purpose

Scaffold individual Danet building blocks — modules, controllers and services — inside an existing project, following the Danet folder convention and registering them in the relevant `@Module` decorator.

## Requirements

### Requirement: Generate Command And Schematics

The system SHALL expose a `danet generate <schematic> <name>` command, aliased as `danet g`, accepting the schematics `module` (alias `mo`), `controller` (alias `co`) and `service` (alias `s`), matched case-insensitively.

#### Scenario: Generating with a full schematic name

- **WHEN** a user runs `danet generate controller cat`
- **THEN** the system SHALL generate a controller component named `cat`

#### Scenario: Generating with an alias

- **WHEN** a user runs `danet g co cat` or `danet g CONTROLLER cat`
- **THEN** the system SHALL treat the schematic as `controller`

#### Scenario: Unknown schematic

- **WHEN** a user passes a schematic that is not one of the supported names or aliases, such as `widget`
- **THEN** the system SHALL fail with an error naming the unknown schematic and listing the supported ones: `module (mo), controller (co), service (s)`

### Requirement: Component File Layout

The system SHALL create each component in its own folder as `<path>/<kebab-name>/<type>.ts`, where `<path>` defaults to `src` and is overridable with the `-p, --path <path>` option, creating any missing directories.

#### Scenario: Default path

- **WHEN** a user runs `danet g service cat` from a project root
- **THEN** the system SHALL create `src/cat/service.ts` and report the created file path

#### Scenario: Custom path

- **WHEN** a user runs `danet g module cat --path modules`
- **THEN** the system SHALL create `modules/cat/module.ts`

### Requirement: Name Normalization

The system SHALL accept component names in any casing and normalize them, using kebab-case for the folder name and controller route and PascalCase for the generated class name.

#### Scenario: Mixed-casing name

- **WHEN** a user runs `danet g co user-profile`, `danet g co userProfile` or `danet g co UserProfile`
- **THEN** the system SHALL in every case create `src/user-profile/controller.ts` declaring `class UserProfileController` decorated with `@Controller('user-profile')`

### Requirement: Generated Component Content

The system SHALL generate each component with the minimal Danet boilerplate for its type, importing the required decorator from `@danet/core` and exporting a class named `<PascalName><Type>`.

#### Scenario: Module generated

- **WHEN** a module named `cat` is generated
- **THEN** the file SHALL import `Module` from `@danet/core` and export `class CatModule {}` decorated with an empty `@Module({})`

#### Scenario: Controller generated

- **WHEN** a controller named `cat` is generated
- **THEN** the file SHALL import `Controller` from `@danet/core` and export `class CatController` decorated with `@Controller('cat')`

#### Scenario: Service generated

- **WHEN** a service named `cat` is generated
- **THEN** the file SHALL import `Injectable` from `@danet/core` and export `class CatService {}` decorated with `@Injectable()`

### Requirement: Existing File Protection

The system SHALL never overwrite an existing component file, and SHALL fail with an error naming the conflicting path instead.

#### Scenario: Target file already exists

- **WHEN** a user generates a component whose target file already exists
- **THEN** the system SHALL fail with `File already exists: <path>` and leave the existing file unchanged

### Requirement: Automatic Module Wiring

The system SHALL, by default, register each generated component in the relevant `@Module` decorator: a controller in the `controllers` array of its sibling `<path>/<kebab-name>/module.ts`, a service in the `injectables` array of that same sibling module, and a module in the `imports` array of `<path>/app.module.ts`. The system SHALL also add the matching named import using a relative Deno module specifier that keeps the `.ts` extension.

#### Scenario: Wiring into an existing module

- **WHEN** a controller `cat` is generated next to an existing `src/cat/module.ts`
- **THEN** the system SHALL add `CatController` to the module's `controllers` array, add `import { CatController } from './controller.ts';`, and report that the class was wired into the module

#### Scenario: Array property missing or already populated

- **WHEN** the target array property does not exist in the `@Module` argument
- **THEN** the system SHALL create it initialized with the new class, and SHALL append to it without removing existing members when it already exists, and SHALL make no change when the class is already listed

#### Scenario: New module wired into the app module

- **WHEN** a module `cat` is generated and `<path>/app.module.ts` exists
- **THEN** the system SHALL add `CatModule` to that file's `imports` array and import it from `./cat/module.ts`

### Requirement: Wiring Opt-Out And Tolerant Skipping

The system SHALL skip wiring without failing when the target module cannot be used, and SHALL let the user disable wiring entirely with the `--skip-import` flag. In all cases the component file SHALL still be created.

#### Scenario: Skip-import flag passed

- **WHEN** a user runs `danet g controller cat --skip-import`
- **THEN** the system SHALL create the controller file and leave the sibling module untouched

#### Scenario: Target module unusable

- **WHEN** the target module file does not exist, contains no `@Module`-decorated class, or has the target property set to something other than an array
- **THEN** the system SHALL report that wiring is skipped and complete successfully with the component file created
