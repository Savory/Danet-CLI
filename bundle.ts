export const bundleProject = async (options: { entrypoint: string }, name: string) => {
    await Deno.remove("./bundle", { recursive: true });
    await Deno.mkdir('./bundle');
    const p = Deno.run({
        cmd: ['deno', 'bundle', options.entrypoint, `./bundle/${name}`]
    })
    await p.status();
}