import { Command } from './deps.ts';
import { generateProject } from './generate.ts';

const program = new Command('danet');

program.command('new <name>').action(generateProject);

program.parse(Deno.args);
