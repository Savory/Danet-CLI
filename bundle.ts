export const bundleProject = async (options: null, name: string) => {
    const p = Deno.run({
        cmd: ['deno', 'bundle', 'run.ts', `./bundle/${name}`]
    })
    await p.status();
}