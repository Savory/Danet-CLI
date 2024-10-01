import { bundleProject } from "./bundle.ts";

export async function deployToDenoDeploy(options: { project: string, bundle: string, entrypoint: string }) {
    await bundleProject(options, options.bundle);
    const installCommand = new Deno.Command("deno", {
        args: [ 'install',  '-Arf', 'jsr:@deno/deployctl']
    });
    await installCommand.output();
    let projectOptions: string[] = [];
    if (options.project) {
        projectOptions = [`--project`, options.project];
    }
    const deployCommand = new Deno.Command("deployctl", {
        args: [ 'deployctl', 'deploy', ...projectOptions , `--entrypoint`, `${options.bundle}`]
    });
    await deployCommand.output();
}