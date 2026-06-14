#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run --allow-sys

import { Command } from './deps.ts';
import { generateProject } from './generate.ts';
import { generateComponent, resolveSchematic } from './generate-component.ts';
import { runProject, runProjectWithWatch } from './run.ts';
import { bundleProject } from './bundle.ts';
import { deployToDenoDeploy } from './deployToDenoDeploy.ts';

const program = new Command().name('danet')
	.description('Danet CLI Interface')
	.meta('deno', Deno.version.deno)
	.meta('v8', Deno.version.v8)
	.meta('typescript', Deno.version.typescript);

program.command('new').arguments('<name:string>')
	.description('Generate a new project')
	.option('--postgres', 'Setup project with postgres code')
	.option('--mongodb', 'Setup project with mongodb code')
	.option('--in-memory', 'Setup project with in-memory code')
	.action(generateProject);

program.command('generate <schematic:string> <name:string>')
	.alias('g')
	.description(
		`Generate a Danet component (module/controller/service) in its own folder.
Schematics: module (mo), controller (co), service (s).`,
	)
	.option(
		'-p, --path <path:string>',
		'Directory the component folder is created in.',
		{
			default: 'src',
		},
	)
	.option(
		'--skip-import',
		'Do not register the component in its module.',
	)
	.action(
		async (
			options: { path: string; skipImport?: boolean },
			schematic: string,
			name: string,
		) => {
			const type = resolveSchematic(schematic);
			await generateComponent(type, name, {
				basePath: options.path,
				wire: !options.skipImport,
			});
		},
	);

program.command('develop')
	.description('Run project in development mode with HotReload')
	.action(runProjectWithWatch);

program.command('start')
	.description('Run project in production mode')
	.action(runProject);

program.command('bundle')
	.description('Bundle project into a single file')
	.option('-e, --entrypoint <entrypoint:string>', 'Your danet entry file', {
		default: 'run.ts',
	})
	.arguments('<name:string>').action(bundleProject);

program.command('deploy').description('Deploy your project to Deno Deploy')
	.option('-p, --project <project:string>', 'Deno deploy project name.', {
		required: true,
	})
	.option('-e, --entrypoint <entrypoint:string>', 'Bundle entrypoint file', {
		default: 'run.ts',
	})
	.option(
		'-b <bundle:string>, --bundle <bundle:string>',
		'Bundle output file name, also used as deployctl entrypoint',
		{ default: 'bundle.js' },
	)
	.option('-t --token <token:string>', 'Deno Deploy API token.', {
		required: true,
	})
	.action(deployToDenoDeploy);

await program.parse(Deno.args);
