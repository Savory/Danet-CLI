import { Command } from './deps.ts';
import { generateProject } from './generate.ts';

const program = new Command('danet');

program.command('new').arguments('<name:string>')
  .option('--postgres', 'Setup project with postgres code')
  .option('--mongodb', 'Setup project with mongodb code')
  .option('--in-memory', 'Setup project with in-memory code')
  .action(generateProject);

await program.parse(Deno.args);
