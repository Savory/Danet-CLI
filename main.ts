import { Command, HelpCommand } from './deps.ts';
import { generateProject } from './generate.ts';
import { runProject, runProjectWithWatch } from "./run.ts";
import { bundleProject } from "./bundle.ts";

const program = new Command().name('danet')
			.description('Danet CLI Interface')
			.meta("deno", Deno.version.deno)
			.meta("v8", Deno.version.v8)
			.meta("typescript", Deno.version.typescript)
			.command("help", new HelpCommand().global());

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
	.arguments('<name:string>').action(bundleProject);

await program.parse(Deno.args);
