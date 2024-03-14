import { bundleProject } from "./bundle.ts";

export async function deployToDenoDeploy(options: { project: string, bundle: string, entrypoint: string }) {
    await bundleProject(options, options.bundle);
    await Deno.run({ cmd: ['deno', 'install',  '-Arf', 'jsr:@deno/deployctl'] }).status();
    let projectOptions: string[] = [];
    if (options.project) {
        projectOptions = [`--project`, options.project];
    }
    const p = Deno.run({
        cmd: ['deployctl', 'deploy', ...projectOptions , `--entrypoint`, `${options.bundle}`],
        cwd: './bundle',
    })
    await p.status();
}