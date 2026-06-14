<p align="center">
  <img src="https://user-images.githubusercontent.com/38007824/205580360-fa032554-5e9e-4266-8ec9-c78ca9a233bc.svg" width="250" alt="Danet Logo" />
</p>


[![CI](https://github.com/Sorikairox/Danet/actions/workflows/run-tests.yml/badge.svg)](https://github.com/Sorikairox/Danet/actions/workflows/run-tests.yml)
[![codecov](https://codecov.io/gh/Savory/Danet/branch/main/graph/badge.svg?token=R6WXVC669Z)](https://codecov.io/gh/Savory/Danet)
![Made for Deno](https://img.shields.io/badge/made%20for-Deno-6B82F6?style=flat-square)

A command-line interface tool that helps you to initialize your Danet applications.

In the future, it will assist in multiple ways, including scaffolding the project, serving it in development mode, and building and bundling the application for production distribution. It embodies best-practice architectural patterns to encourage well-structured apps.

## Installation

Installing Deno packages as a commands is simple. You can install them under any name you want. For simplicity's sake, we install our danet-cli under the name `danet`.

```bash
$ deno install --global -A -n danet jsr:@danet/cli
```

## Basic workflow

Once installed, you can invoke CLI commands directly from your OS command line through the `danet` command. See the available `danet` commands by entering the following:

```bash
$ danet --help
```

To create, run a new basic Danet project, go to the folder that should be the parent of your new project, and run the following commands:

```bash
$ danet new my-danet-project
$ cd my-danet-project
$ danet develop //run with file watching
$ danet start  //run without file watching
```

In your browser, open [http://localhost:3000](http://localhost:3000) to see the new application running.

## Generating components

Once inside a project, you can scaffold modules, controllers and services with the `generate` command (aliased as `g`), similar to the NestJS CLI:

```bash
$ danet generate <schematic> <name>
$ danet g <schematic> <name>
```

Available schematics (with aliases):

| Schematic    | Alias | Generates                          | Class created          |
| ------------ | ----- | ---------------------------------- | ---------------------- |
| `module`     | `mo`  | `src/<name>/module.ts`             | `<Name>Module`         |
| `controller` | `co`  | `src/<name>/controller.ts`         | `<Name>Controller`     |
| `service`    | `s`   | `src/<name>/service.ts`            | `<Name>Service`        |

Each component is created in its own folder following the Danet folder convention. The name is normalized, so `danet g co user-profile`, `danet g co userProfile` and `danet g co UserProfile` all produce the folder `user-profile` and the class `UserProfileController`.

```bash
$ danet g module cat        # src/cat/module.ts        -> class CatModule
$ danet g controller cat    # src/cat/controller.ts    -> class CatController
$ danet g service cat       # src/cat/service.ts       -> class CatService
```

### Automatic module wiring

By default, generated components are automatically registered in the relevant `@Module`:

- a **controller** is added to the `controllers` array of its sibling `src/<name>/module.ts`;
- a **service** is added to the `injectables` array of its sibling `src/<name>/module.ts`;
- a **module** is added to the `imports` array of your root `src/app.module.ts`.

For example, after running the three commands above, `src/cat/module.ts` becomes:

```typescript
import { Module } from '@danet/core';
import { CatController } from './controller.ts';
import { CatService } from './service.ts';

@Module({
  controllers: [CatController],
  injectables: [CatService],
})
export class CatModule {}
```

Wiring is skipped (without error) when the target module file cannot be found. To opt out of wiring entirely, pass `--skip-import`:

```bash
$ danet g controller cat --skip-import
```

### Options

```bash
Usage: danet generate <schematic> <name>

Options:

  -p, --path <path>  - Directory the component folder is created in.   (Default: "src")
  --skip-import      - Do not register the component in its module.
```

## Database Options

When creating a new project, Danet CLI will ask you what database provider you want to use between `mongodb`, `postgres` and `in-memory` and will generate all the required code.

The only thing left if you use `mongodb` or `postgres` will be to set environment variables or put them in a `.env` file in your project's root folder.

However, if you need it to be less interactive, you can pass the followings options when calling `danet new` :

- `--mongodb`
- `--postgres`
- `--in-memory`

## Deploy to Deno Deploy

As easy as :
```bash
danet deploy
```

Here are the options: 
```bash
Usage: danet deploy

Description:

  Deploy your project to Deno Deploy

Options:

  -h, --help                      - Show this help.                                                                                    
  -p, --project     <project>     - Deno deploy project name. If no value is given, Deno deploy will generate a                        
                                    random name                                                                                        
  -e, --entrypoint  <entrypoint>  - Bundle entrypoint file                                                       (Default: "run.ts")   
  -b, --bundle      <bundle>      - Bundle output file name, also used as deployctl entrypoint                   (Default: "bundle.js")

Commands:

  help  [command]  - Show this help or the help of a sub-command.
```
