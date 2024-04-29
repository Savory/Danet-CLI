const bundlePath = './bundle';

function bundleExists() {
	try {
		Deno.statSync(bundlePath);
		return true;
	} catch (_e) {
		return false;
	}
}

export const bundleProject = async (
	options: { entrypoint: string },
	name: string,
) => {
	if (bundleExists()) {
		await Deno.remove(bundlePath, { recursive: true });
	}
	await Deno.mkdir(bundlePath);
	const p = Deno.run({
		cmd: ['deno', 'bundle', options.entrypoint, `${bundlePath}/${name}`],
	});
	await p.status();
};
