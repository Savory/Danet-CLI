export const bundleProject = async (options: null, name: string) => {
    await Deno.mkdir('./bundle');
    const p = Deno.run({
        cmd: ['deno', 'bundle', 'run.ts', `./bundle/${name}`]
    })
    await p.status();
}