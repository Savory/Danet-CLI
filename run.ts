export const runProjectWithWatch: () => void = async () => {
    const command = new Deno.Command("deno", {
        args: ['run', '--watch', '--allow-net', '--allow-read',  '--unstable',  '--allow-env', 'run.ts'],
        stdout: "inherit"
    });
    await command.output();
}

export const runProject: () => void = async () => {
    const command = new Deno.Command("deno", {
        args: ['run', '--allow-net', '--allow-read',  '--unstable',  '--allow-env', 'run.ts'],
        stdout: "inherit"
    });
    await command.output();
}