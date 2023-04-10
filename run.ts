export const runProjectWithWatch = async () => {
    const p = Deno.run({
        cmd: ['deno', 'run', '--watch', '--allow-net', '--allow-read',  '--unstable',  '--allow-env', 'run.ts']
    })
    await p.status();
}

export const runProject = async () => {
    const p = Deno.run({
        cmd: ['deno', 'run', '--allow-net', '--allow-read',  '--unstable',  '--allow-env', 'run.ts']
    })
    await p.status();
}