import { Command } from './deps.ts';
import { generateProject } from './generate.ts';

const program = new Command('danet');

program.command('new').arguments('<name:string>').action(generateProject);

await program.parse(Deno.args);
