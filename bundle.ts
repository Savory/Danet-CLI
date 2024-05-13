
const bundleFolderExists = (folder: string) =>
	Deno.stat(folder)
		.then(() => true)
		.catch(() => false);

export const bundleProject = async (
	options: { entrypoint: string, bundlePath?: string},
	name: string,
) => {
    if (!bundlePath)
        bundlePath = './bundle';
	if (await bundleExists(bundlePath)) {
		await Deno.remove(bundlePath, { recursive: true });
	}

	await Deno.mkdir(bundlePath);
	const p = Deno.run({
		cmd: ['deno', 'bundle', options.entrypoint, `${bundlePath}/${name}`],
	});
	await p.status();
};
