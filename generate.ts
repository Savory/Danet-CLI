import {
	ClassDeclaration,
	Directory,
	existsSync,
	IndentationText,
	Logger,
	Project,
	ResolutionHosts,
	rm,
	rmdir,
	SourceFile,
	StructureKind,
	toPathString,
} from './deps.ts';
const logger = new Logger('Danet-CLI');

export async function generateProject(options: GenerateOption, name: string) {
	try {
		if (existsSync(name)) {
			await overwriteIfPossibleOrQuit(name);
		}
		await cloneRepositoryAndDeleteGitFolder(name);
		await setupDatabaseCode(options, name);
		logger.log(`Danet's project creation done !
  You can run it with the following commands: cd ${name} && deno task launch-server
  Tests can be run with: deno task test`);
	} catch (e) {
		logger.error(e.toString());
	}
}

interface GenerateOption {
	mongodb?: boolean;
	postgres?: boolean;
	inMemory?: boolean;
}

const capitalize = (myString: string) => {
	return myString.charAt(0).toUpperCase() + myString.slice(1);
};

const possibleDatabases = ['mongodb', 'postgres', 'in-memory'];

async function setupDatabaseCode(
	options: GenerateOption,
	projectDirectory: string,
) {
	const databaseName: string = getDatabaseFromOptionOrAskUser(options);
	await deleteOtherDatabaseCode(databaseName, projectDirectory);
	if (databaseName !== 'in-memory') {
		await modifyModulesWithDatabaseService(databaseName, projectDirectory);
	} else {
		logger.log('Keeping code as is due to in-memory being selected');
		await rmdir(toPathString(`${projectDirectory}/src/database`), {
			recursive: true,
		});
		logger.log('Deleting database folder');
	}
}

function getDatabaseFromOptionOrAskUser(options: GenerateOption) {
	let database = '';
	if (!options.mongodb && !options.postgres && !options.inMemory) {
		database = askWhichDBUserWants();
	} else if (options.mongodb) {
		database = 'mongodb';
	} else if (options.postgres) {
		database = 'postgres';
	} else {
		database = 'in-memory';
	}
	return database;
}

function modifyDatabaseModule(baseDirectory, databaseName: string) {
	const dbDirectory: Directory = baseDirectory?.getDirectory('src/database');
	const dbModuleFile: SourceFile = dbDirectory?.getSourceFile('module.ts');
	const importDeclaration = dbModuleFile.getImportDeclarations()[1];
	importDeclaration.remove();
	dbModuleFile.addImportDeclaration({
		defaultImport: `{ ${capitalize(databaseName)}Service }`,
		moduleSpecifier: `./${databaseName}.service.ts`,
	});
	const DatabaseClass: ClassDeclaration = dbModuleFile?.getClassOrThrow(
		'DatabaseModule',
	);
	const ModuleDeclaration = DatabaseClass.getDecorators().find((d) =>
		d.getName() === 'Module'
	);
	const moduleDeclarationArgument = ModuleDeclaration.getArguments()[0];
	const argumentProperties = moduleDeclarationArgument.getProperties();
	const moduleInjectables = argumentProperties.find((p) =>
		p.getName() === 'injectables'
	);
	moduleInjectables.set(
		{
			name: 'injectables',
			kind: StructureKind.PropertyAssignment,
			initializer: `[new TokenInjector(${
				capitalize(databaseName)
			}Service, DATABASE)]`,
		},
	);
	logger.log(
		`Declaration and export of ${
			capitalize(databaseName)
		}Service from DatabaseModule`,
	);
}

function modifyTodoModule(baseDirectory, databaseName: string) {
	const dbDirectory: Directory = baseDirectory?.getDirectory('src/todo');
	const todoModule: SourceFile = dbDirectory?.getSourceFile('module.ts');
	const importDeclaration = todoModule.getImportDeclarations()[4];
	importDeclaration.remove();
	todoModule.addImportDeclaration({
		defaultImport: `{ ${capitalize(databaseName)}Repository }`,
		moduleSpecifier: `./${databaseName}-repository.ts`,
	});
	todoModule.addImportDeclaration({
		defaultImport: `{ DatabaseModule }`,
		moduleSpecifier: `../database/module.ts`,
	});
	const DatabaseClass: ClassDeclaration = todoModule?.getClassOrThrow(
		'TodoModule',
	);
	const ModuleDeclaration = DatabaseClass.getDecorators().find((d) =>
		d.getName() === 'Module'
	);
	const moduleDeclarationArgument = ModuleDeclaration.getArguments()[0];
	const argumentProperties = moduleDeclarationArgument.getProperties();
	moduleDeclarationArgument.addProperty({
		name: 'imports',
		kind: StructureKind.PropertyAssignment,
		initializer: `[DatabaseModule]`,
	});
	const moduleInjectables = argumentProperties.find((p) =>
		p.getName() === 'injectables'
	);
	moduleInjectables.set(
		{
			name: 'injectables',
			kind: 32,
			initializer: `[new TokenInjector(${
				capitalize(databaseName)
			}Repository, USER_REPOSITORY), TodoService]`,
		},
	);
	logger.log(
		`Declaration and injection of ${
			capitalize(databaseName)
		}Repository in TodoModule`,
	);
}

async function modifyModulesWithDatabaseService(
	databaseName: string,
	projectDirectory: string,
) {
	const project = new Project({
		resolutionHost: ResolutionHosts.deno,
		indentationText: IndentationText.TwoSpaces,
	});
	project.addSourceFilesAtPaths(`${projectDirectory}/**/*.ts`);
	const baseDirectory = project.getDirectory(`${projectDirectory}`);
	modifyDatabaseModule(baseDirectory, databaseName);
	modifyTodoModule(baseDirectory, databaseName);
	await project.save();
}

async function deleteOtherDatabaseCode(
	databaseName: string,
	projectDirectory: string,
) {
	for (const dbName of possibleDatabases) {
		if (dbName !== databaseName) {
			if (dbName !== 'in-memory') {
				await rm(`${projectDirectory}/src/database/${dbName}.service.ts`);
			}
			await rm(`${projectDirectory}/src/todo/${dbName}-repository.ts`);
		}
	}
}

function askWhichDBUserWants() {
	let database = '';
	while (!possibleDatabases.includes(database)) {
		database = prompt(
			`What database provider do you want to use ? (mongodb/postgres/in-memory)`,
			'mongodb',
		) as string;
	}
	return database;
}

async function overwriteIfPossibleOrQuit(name: string) {
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

async function cloneRepositoryAndDeleteGitFolder(name: string) {
	const repository = `https://github.com/Savory/Danet-Starter.git`;
	logger.log(`Cloning starter project from ${repository} into ${name}`);
	const p = Deno.run({
		cmd: ['git', 'clone', repository, `${name}`],
		stdout: 'null',
		stderr: 'null',
	});
	const status = await p.status();
	if (!status.success) {
		throw new Error('Clone Failed');
	}
	await rmdir(toPathString(`${name}/.git`), { recursive: true });
}
