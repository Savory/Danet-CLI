import * as esbuild from "npm:esbuild@0.20.2";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.0";



const bundleFolderExists = (folder: string) =>
	Deno.stat(folder)
		.then(() => true)
		.catch(() => false);

export const bundleProject = async (
	options: { entrypoint: string, bundlePath?: string},
	name: string,
) => {
    if (!options.bundlePath)
        options.bundlePath = './bundle';
	if (await bundleFolderExists(options.bundlePath)) {
		await Deno.remove(options.bundlePath, { recursive: true });
	}

	await Deno.mkdir(options.bundlePath);

	await esbuild.build({
		plugins: [...denoPlugins({ loader: 'native'})],
		entryPoints: [options.entrypoint],
		outfile: `${options.bundlePath}/${name}`,
		bundle: true,
		format: "esm",
		tsconfig: "tsconfig.json",
	});

	esbuild.stop();
};
