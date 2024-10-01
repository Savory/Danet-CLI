
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
	
	
	const bundleCommand = new Deno.Command("deno", {
        args: [ 'bundle', options.entrypoint, `${options.bundlePath}/${name}`]
    });
	await bundleCommand.output();
};
