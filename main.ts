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
	.option('--postgres', 'Setup project with postgres code')
	.option('--mongodb', 'Setup project with mongodb code')
	.option('--in-memory', 'Setup project with in-memory code')
	.action(generateProject);

program.command('develop').action(runProjectWithWatch);

program.command('start').action(runProject);

program.command('bundle').arguments('<name:string>').action(bundleProject);

await program.parse(Deno.args);
