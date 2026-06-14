import { assertEquals, assertStringIncludes } from './deps_test.ts';
import {
	buildControllerContent,
	buildModuleContent,
	buildServiceContent,
	generateComponent,
	resolveSchematic,
	toKebabCase,
	toPascalCase,
} from './generate-component.ts';

Deno.test('resolveSchematic maps names and aliases to component types', () => {
	assertEquals(resolveSchematic('module'), 'module');
	assertEquals(resolveSchematic('mo'), 'module');
	assertEquals(resolveSchematic('controller'), 'controller');
	assertEquals(resolveSchematic('co'), 'controller');
	assertEquals(resolveSchematic('service'), 'service');
	assertEquals(resolveSchematic('s'), 'service');
	assertEquals(resolveSchematic('CONTROLLER'), 'controller');
});

Deno.test('resolveSchematic throws on an unknown schematic', () => {
	let threw = false;
	try {
		resolveSchematic('widget');
	} catch {
		threw = true;
	}
	assertEquals(threw, true);
});

Deno.test('toPascalCase normalizes various casings', () => {
	assertEquals(toPascalCase('cat'), 'Cat');
	assertEquals(toPascalCase('user-profile'), 'UserProfile');
	assertEquals(toPascalCase('user_profile'), 'UserProfile');
	assertEquals(toPascalCase('userProfile'), 'UserProfile');
	assertEquals(toPascalCase('User Profile'), 'UserProfile');
});

Deno.test('toKebabCase normalizes various casings', () => {
	assertEquals(toKebabCase('cat'), 'cat');
	assertEquals(toKebabCase('UserProfile'), 'user-profile');
	assertEquals(toKebabCase('userProfile'), 'user-profile');
	assertEquals(toKebabCase('user_profile'), 'user-profile');
});

Deno.test('buildModuleContent generates an empty Danet module', () => {
	const content = buildModuleContent('cat');
	assertStringIncludes(content, "import { Module } from '@danet/core';");
	assertStringIncludes(content, '@Module({})');
	assertStringIncludes(content, 'export class CatModule {}');
});

Deno.test('buildModuleContent uses PascalCase class name for multi-word names', () => {
	const content = buildModuleContent('user-profile');
	assertStringIncludes(content, 'export class UserProfileModule {}');
});

Deno.test('buildControllerContent generates a controller with a kebab-case route', () => {
	const content = buildControllerContent('user-profile');
	assertStringIncludes(
		content,
		"import { Controller } from '@danet/core';",
	);
	assertStringIncludes(content, "@Controller('user-profile')");
	assertStringIncludes(content, 'export class UserProfileController');
});

Deno.test('buildServiceContent generates an injectable service', () => {
	const content = buildServiceContent('cat');
	assertStringIncludes(content, "import { Injectable } from '@danet/core';");
	assertStringIncludes(content, '@Injectable()');
	assertStringIncludes(content, 'export class CatService {}');
});

Deno.test('generateComponent writes a module file into its own folder', async () => {
	const base = await Deno.makeTempDir();
	try {
		const created = await generateComponent('module', 'cat', {
			basePath: base,
		});
		const filePath = `${base}/cat/module.ts`;
		assertEquals(created, [filePath]);
		const content = await Deno.readTextFile(filePath);
		assertStringIncludes(content, 'export class CatModule {}');
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent writes a controller file with normalized folder name', async () => {
	const base = await Deno.makeTempDir();
	try {
		const created = await generateComponent('controller', 'UserProfile', {
			basePath: base,
		});
		const filePath = `${base}/user-profile/controller.ts`;
		assertEquals(created, [filePath]);
		const content = await Deno.readTextFile(filePath);
		assertStringIncludes(content, 'export class UserProfileController');
		assertStringIncludes(content, "@Controller('user-profile')");
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent writes a service file', async () => {
	const base = await Deno.makeTempDir();
	try {
		const created = await generateComponent('service', 'cat', {
			basePath: base,
		});
		const filePath = `${base}/cat/service.ts`;
		assertEquals(created, [filePath]);
		const content = await Deno.readTextFile(filePath);
		assertStringIncludes(content, 'export class CatService {}');
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent throws when the target file already exists', async () => {
	const base = await Deno.makeTempDir();
	try {
		await generateComponent('module', 'cat', { basePath: base });
		let threw = false;
		try {
			await generateComponent('module', 'cat', { basePath: base });
		} catch {
			threw = true;
		}
		assertEquals(threw, true);
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent wires a controller into its sibling module', async () => {
	const base = await Deno.makeTempDir();
	try {
		await generateComponent('module', 'cat', { basePath: base });
		await generateComponent('controller', 'cat', { basePath: base });
		const moduleContent = await Deno.readTextFile(`${base}/cat/module.ts`);
		assertStringIncludes(
			moduleContent,
			"import { CatController } from './controller.ts';",
		);
		assertStringIncludes(moduleContent, 'controllers: [CatController]');
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent wires a service into its sibling module injectables', async () => {
	const base = await Deno.makeTempDir();
	try {
		await generateComponent('module', 'cat', { basePath: base });
		await generateComponent('service', 'cat', { basePath: base });
		const moduleContent = await Deno.readTextFile(`${base}/cat/module.ts`);
		assertStringIncludes(
			moduleContent,
			"import { CatService } from './service.ts';",
		);
		assertStringIncludes(moduleContent, 'injectables: [CatService]');
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent wires a new module into the app module imports', async () => {
	const base = await Deno.makeTempDir();
	try {
		await Deno.writeTextFile(
			`${base}/app.module.ts`,
			`import { Module } from '@danet/core';\n\n@Module({})\nexport class AppModule {}\n`,
		);
		await generateComponent('module', 'cat', { basePath: base });
		const appContent = await Deno.readTextFile(`${base}/app.module.ts`);
		assertStringIncludes(
			appContent,
			"import { CatModule } from './cat/module.ts';",
		);
		assertStringIncludes(appContent, 'imports: [CatModule]');
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent appends to an existing array without dropping members', async () => {
	const base = await Deno.makeTempDir();
	try {
		await Deno.mkdir(`${base}/cat`, { recursive: true });
		await Deno.writeTextFile(
			`${base}/cat/module.ts`,
			`import { Module } from '@danet/core';
import { ExistingController } from './existing.ts';

@Module({
  controllers: [ExistingController],
})
export class CatModule {}
`,
		);
		await generateComponent('controller', 'cat', { basePath: base });
		const moduleContent = await Deno.readTextFile(`${base}/cat/module.ts`);
		assertStringIncludes(moduleContent, 'ExistingController');
		assertStringIncludes(moduleContent, 'CatController');
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent skips wiring when no module file exists', async () => {
	const base = await Deno.makeTempDir();
	try {
		const created = await generateComponent('controller', 'cat', {
			basePath: base,
		});
		assertEquals(created, [`${base}/cat/controller.ts`]);
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});

Deno.test('generateComponent does not wire when wire is false', async () => {
	const base = await Deno.makeTempDir();
	try {
		await generateComponent('module', 'cat', { basePath: base });
		await generateComponent('controller', 'cat', {
			basePath: base,
			wire: false,
		});
		const moduleContent = await Deno.readTextFile(`${base}/cat/module.ts`);
		assertEquals(moduleContent.includes('CatController'), false);
	} finally {
		await Deno.remove(base, { recursive: true });
	}
});
