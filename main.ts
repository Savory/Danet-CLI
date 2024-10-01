#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run --allow-sys

import { Command } from './deps.ts';
import { generateProject } from './generate.ts';
import { runProject, runProjectWithWatch } from "./run.ts";
import { bundleProject } from "./bundle.ts";
import { deployToDenoDeploy } from './deployToDenoDeploy.ts';

const program = new Command().name('danet')
			.description('Danet CLI Interface')
			.meta("deno", Deno.version.deno)
			.meta("v8", Deno.version.v8)
			.meta("typescript", Deno.version.typescript)

program.command('new').arguments('<name:string>')
	.description('Generate a new project')
	.option('--postgres', 'Setup project with postgres code')
	.option('--mongodb', 'Setup project with mongodb code')
	.option('--in-memory', 'Setup project with in-memory code')
	.action(generateProject);

program.command('develop')
	.description('Run project in development mode with HotReload')
	.action(runProjectWithWatch);

program.command('start')
	.description('Run project in production mode')
	.action(runProject);

program.command('bundle')
	.description('Bundle project into a single file')
	.option('-e, --entrypoint <entrypoint:string>', "Your danet entry file", {
		default: 'run.ts',
	  })
	.arguments('<name:string>').action(bundleProject);

program.command('deploy').description('Deploy your project to Deno Deploy').option('-p, --project <project:string>', 'Deno deploy project name.', { required: true })
.option('-e, --entrypoint <entrypoint:string>', 'Bundle entrypoint file', {
	default: 'run.ts',
  })
  .option('-b <bundle:string>, --bundle <bundle:string>', 'Bundle output file name, also used as deployctl entrypoint', { default: 'bundle.js' }).action(deployToDenoDeploy);

await program.parse(Deno.args);
