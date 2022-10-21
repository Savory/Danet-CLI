import { existsSync, Logger, rmdir, toPathString } from './deps.ts';

const logger = new Logger('Danet-CLI');

async function overwriteIfPossibleOrQuit(name) {
	const overwrite: string = prompt(
		`${name} folder already exists, do you want to completely overwrite its content ? (y/N)`,
		'N',
	);
	if (overwrite.toLowerCase() !== 'y') {
		logger.warn(`${name} already exists. Cannot create a new project.`);
		Deno.exit(1);
	}
	logger.log(`Deleting ${name} folder`);
	await rmdir(name, { recursive: true });
}

async function cloneRepositoryAndDeleteGitFolder(name) {
	const repository = `https://github.com/Savory/Danet-Starter.git`;
	logger.log(`Cloning starter project from ${repository} into ${name}`);
	const p = Deno.run({
		cmd: ['git', 'clone', repository, `${name}`],
		stdout: "null",
		stderr: "null"
	});
	const status = await p.status();
	if (!status.success) {
		throw new Error('Clone Failed');
	}
	await rmdir(toPathString(`${name}/.git`), { recursive: true });
}
export async function generateProject(options, name) {
	try {
		if (existsSync(name)) {
			await overwriteIfPossibleOrQuit(name);
		}
		await cloneRepositoryAndDeleteGitFolder(name);
		logger.log(`Danet's project creation done !
  You can run it doing the following commands: cd ${name} && deno task launch-server`);
	} catch (e) {
		logger.error(e.toString());
	}
}
