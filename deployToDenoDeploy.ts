import { bundleProject } from "./bundle.ts";

export async function deployToDenoDeploy(options: { project: string, bundle: string, entrypoint: string, token: string, bundlePath?: string }) {
    await bundleProject(options, options.bundle);
    const installCommand = new Deno.Command("deno", {
        args: [ 'install',  '-Arf', 'jsr:@deno/deployctl'],
        stdout: 'inherit',
    });
    await installCommand.output();
    let projectOptions: string[] = [];
    if (options.project) {
        projectOptions = [`--project`, options.project];
    }
    const deployCommand = new Deno.Command("deployctl", {
        args: ['deploy', ...projectOptions , `--token`, options.token, `${options.bundlePath}/${options.bundle}`],
        stdout: 'inherit'
    });
    const output = await deployCommand.output();
    const stderr = output.stderr;
    if (stderr.length > 0) {
        console.error(new TextDecoder().decode(stderr));
        return;
    }
}