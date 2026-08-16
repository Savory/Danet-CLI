# Graph Report - Danet-CLI  (2026-08-16)

## Corpus Check
- Corpus is ~3,622 words - fits in a single context window. You may not need a graph.

## Summary
- 107 nodes · 159 edges · 8 communities
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Component Generation
- Publishing and CLI Overview
- Project Scaffolding
- Deno Manifest and Import Map
- Schematics and Module Wiring
- Build Run and Deploy Commands
- Formatter Configuration
- Graphify Conventions

## God Nodes (most connected - your core abstractions)
1. `Danet CLI` - 8 edges
2. `danet generate command` - 8 edges
3. `Automatic module wiring` - 8 edges
4. `toPascalCase()` - 7 edges
5. `generateComponent()` - 7 edges
6. `graphify knowledge graph` - 6 edges
7. `bundleProject()` - 5 edges
8. `imports` - 5 edges
9. `toKebabCase()` - 5 edges
10. `generateProject()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `deno publish` --conceptually_related_to--> `jsr:@danet/cli package`  [INFERRED]
  .github/workflows/main.yml → README.md
- `deployToDenoDeploy()` --calls--> `bundleProject()`  [EXTRACTED]
  deployToDenoDeploy.ts → bundle.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Deno/JSR publish pipeline** — _github_workflows_main_publish_job, _github_workflows_main_setup_deno, _github_workflows_main_deno_publish, _github_workflows_main_oidc_id_token_permission, readme_jsr_danet_cli_package [INFERRED 0.85]
- **Component scaffolding and wiring flow** — readme_generate_command, readme_module_schematic, readme_controller_schematic, readme_service_schematic, readme_danet_folder_convention, readme_automatic_module_wiring, readme_skip_import_option [EXTRACTED 1.00]
- **Project bootstrap to deploy lifecycle** — readme_new_command, readme_database_provider_selection, readme_develop_command, readme_start_command, readme_deploy_command, readme_deno_deploy [EXTRACTED 1.00]

## Communities (8 total, 0 thin omitted)

### Community 0 - "Component Generation"
Cohesion: 0.19
Nodes (18): buildControllerContent(), buildModuleContent(), buildServiceContent(), ComponentType, contentBuilders, fileExists(), generateComponent(), GenerateComponentOptions (+10 more)

### Community 1 - "Publishing and CLI Overview"
Cohesion: 0.14
Nodes (18): deno publish, OIDC id-token write permission, publish job, Publish Workflow, denoland/setup-deno (canary), Danet CLI, Database provider selection, Deno (+10 more)

### Community 2 - "Project Scaffolding"
Cohesion: 0.22
Nodes (14): askWhichDBUserWants(), capitalize(), cloneRepositoryAndDeleteGitFolder(), deleteOtherDatabaseCode(), GenerateOption, generateProject(), getDatabaseFromOptionOrAskUser(), logger (+6 more)

### Community 3 - "Deno Manifest and Import Map"
Cohesion: 0.15
Nodes (12): exports, imports, @cliffy/command, @danet/core, @std/path, @ts-morph/ts-morph, license, name (+4 more)

### Community 4 - "Schematics and Module Wiring"
Cohesion: 0.22
Nodes (13): root app.module.ts, Automatic module wiring, controller schematic (co), @danet/core, Danet folder convention, Danet framework, danet generate command, @Module decorator (+5 more)

### Community 5 - "Build Run and Deploy Commands"
Cohesion: 0.38
Nodes (6): bundleFolderExists(), bundleProject(), deployToDenoDeploy(), program, runProject(), runProjectWithWatch()

### Community 6 - "Formatter Configuration"
Cohesion: 0.22
Nodes (9): exclude, fmt, files, options, singleQuote, useTabs, coverage/, doc/ (+1 more)

### Community 7 - "Graphify Conventions"
Cohesion: 0.38
Nodes (7): GRAPH_REPORT.md, graphify explain, graphify knowledge graph, graphify path, graphify query, graphify update, graphify wiki index

## Knowledge Gaps
- **33 isolated node(s):** `name`, `version`, `exports`, `singleQuote`, `useTabs` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Danet CLI` connect `Publishing and CLI Overview` to `Schematics and Module Wiring`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `danet generate command` connect `Schematics and Module Wiring` to `Publishing and CLI Overview`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `version`, `exports` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Publishing and CLI Overview` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._