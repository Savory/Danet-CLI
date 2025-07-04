
const bundleFolderExists = (folder: string): Promise<boolean> =>
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
		args: [ 'bundle', options.entrypoint],
		stdout: "piped",
	});
	const child = bundleCommand.spawn();

// open a file and pipe the subprocess output to it.
	child.stdout.pipeTo(
		Deno.openSync(`${options.bundlePath}/${name}`, { write: true, create: true }).writable,
	);

	await child.status;
};
