import {
	dirname,
	IndentationText,
	Logger,
	Project,
	QuoteKind,
	relative,
	SyntaxKind,
} from './deps.ts';

const logger = new Logger('Danet-CLI');

export type ComponentType = 'module' | 'controller' | 'service';

export interface GenerateComponentOptions {
	/** Directory the component folder is created in. Defaults to `src`. */
	basePath?: string;
	/** Whether to wire the component into the relevant module. Defaults to true. */
	wire?: boolean;
}

type ModuleArrayProperty = 'controllers' | 'injectables' | 'imports';

/** Splits a name into its lowercased words, regardless of input casing. */
function splitWords(name: string): string[] {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.split(/[\s\-_]+/)
		.filter((word) => word.length > 0)
		.map((word) => word.toLowerCase());
}

export function toPascalCase(name: string): string {
	return splitWords(name)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
}

export function toKebabCase(name: string): string {
	return splitWords(name).join('-');
}

export function buildModuleContent(name: string): string {
	const className = `${toPascalCase(name)}Module`;
	return `import { Module } from '@danet/core';

@Module({})
export class ${className} {}
`;
}

export function buildControllerContent(name: string): string {
	const className = `${toPascalCase(name)}Controller`;
	const route = toKebabCase(name);
	return `import { Controller } from '@danet/core';

@Controller('${route}')
export class ${className} {
}
`;
}

export function buildServiceContent(name: string): string {
	const className = `${toPascalCase(name)}Service`;
	return `import { Injectable } from '@danet/core';

@Injectable()
export class ${className} {}
`;
}

const schematicAliases: Record<string, ComponentType> = {
	module: 'module',
	mo: 'module',
	controller: 'controller',
	co: 'controller',
	service: 'service',
	s: 'service',
};

/** Resolves a schematic name or alias (e.g. `co`) to a ComponentType. */
export function resolveSchematic(schematic: string): ComponentType {
	const type = schematicAliases[schematic.toLowerCase()];
	if (!type) {
		throw new Error(
			`Unknown schematic "${schematic}". Use one of: module (mo), controller (co), service (s).`,
		);
	}
	return type;
}

const contentBuilders: Record<ComponentType, (name: string) => string> = {
	module: buildModuleContent,
	controller: buildControllerContent,
	service: buildServiceContent,
};

async function fileExists(path: string): Promise<boolean> {
	try {
		await Deno.stat(path);
		return true;
	} catch (e) {
		if (e instanceof Deno.errors.NotFound) {
			return false;
		}
		throw e;
	}
}

/** Computes a Deno-style relative module specifier (keeps `.ts`, prefixed `./`). */
function toModuleSpecifier(fromFile: string, toFile: string): string {
	let specifier = relative(dirname(fromFile), toFile).replaceAll('\\', '/');
	if (!specifier.startsWith('.')) {
		specifier = `./${specifier}`;
	}
	return specifier;
}

/**
 * Adds `className` (imported from `generatedFilePath`) to the given array
 * property of the `@Module` decorator in `modulePath`, creating the property
 * if needed. Returns true if the module was edited, false if it was not found.
 */
export async function wireComponentIntoModule(params: {
	modulePath: string;
	generatedFilePath: string;
	className: string;
	arrayProperty: ModuleArrayProperty;
}): Promise<boolean> {
	const { modulePath, generatedFilePath, className, arrayProperty } = params;

	if (!(await fileExists(modulePath))) {
		return false;
	}

	const project = new Project({
		manipulationSettings: {
			indentationText: IndentationText.TwoSpaces,
			quoteKind: QuoteKind.Single,
		},
	});
	const sourceFile = project.addSourceFileAtPath(modulePath);

	const moduleClass = sourceFile.getClasses().find((c) =>
		c.getDecorator('Module')
	);
	const decorator = moduleClass?.getDecorator('Module');
	const argument = decorator?.getArguments()[0]?.asKind(
		SyntaxKind.ObjectLiteralExpression,
	);
	if (!argument) {
		logger.log(
			`Could not find a @Module decorator in ${modulePath}, skipping wiring.`,
		);
		return false;
	}

	const existingProperty = argument.getProperty(arrayProperty)?.asKind(
		SyntaxKind.PropertyAssignment,
	);
	if (existingProperty) {
		const array = existingProperty.getInitializerIfKind(
			SyntaxKind.ArrayLiteralExpression,
		);
		if (!array) {
			logger.log(
				`Property "${arrayProperty}" in ${modulePath} is not an array, skipping wiring.`,
			);
			return false;
		}
		const alreadyPresent = array.getElements().some((element) =>
			element.getText() === className
		);
		if (!alreadyPresent) {
			array.addElement(className);
		}
	} else {
		argument.addPropertyAssignment({
			name: arrayProperty,
			initializer: `[${className}]`,
		});
	}

	const alreadyImported = sourceFile.getImportDeclarations().some((decl) =>
		decl.getNamedImports().some((named) => named.getName() === className)
	);
	if (!alreadyImported) {
		sourceFile.addImportDeclaration({
			namedImports: [className],
			moduleSpecifier: toModuleSpecifier(modulePath, generatedFilePath),
		});
	}

	await sourceFile.save();
	return true;
}

const wiringTargets: Record<
	ComponentType,
	{ classSuffix: string; arrayProperty: ModuleArrayProperty }
> = {
	controller: { classSuffix: 'Controller', arrayProperty: 'controllers' },
	service: { classSuffix: 'Service', arrayProperty: 'injectables' },
	module: { classSuffix: 'Module', arrayProperty: 'imports' },
};

/**
 * Generates a Danet component (module/controller/service) following the
 * Danet-Starter folder convention: `<basePath>/<kebab-name>/<type>.ts`.
 *
 * Unless `wire` is false, it also registers the component in the relevant
 * `@Module`: controllers/services are added to their sibling `module.ts`, and
 * new modules are added to the `imports` of `<basePath>/app.module.ts`.
 *
 * Returns the list of created file paths. Throws if the target file exists.
 */
export async function generateComponent(
	type: ComponentType,
	name: string,
	options: GenerateComponentOptions = {},
): Promise<string[]> {
	const basePath = options.basePath ?? 'src';
	const wire = options.wire ?? true;
	const folderName = toKebabCase(name);
	const folderPath = `${basePath}/${folderName}`;
	const filePath = `${folderPath}/${type}.ts`;

	if (await fileExists(filePath)) {
		throw new Error(`File already exists: ${filePath}`);
	}

	await Deno.mkdir(folderPath, { recursive: true });
	await Deno.writeTextFile(filePath, contentBuilders[type](name));
	logger.log(`Created ${filePath}`);

	if (wire) {
		const { classSuffix, arrayProperty } = wiringTargets[type];
		const className = `${toPascalCase(name)}${classSuffix}`;
		const modulePath = type === 'module'
			? `${basePath}/app.module.ts`
			: `${folderPath}/module.ts`;
		const wired = await wireComponentIntoModule({
			modulePath,
			generatedFilePath: filePath,
			className,
			arrayProperty,
		});
		if (wired) {
			logger.log(`Wired ${className} into ${modulePath}`);
		}
	}

	return [filePath];
}
