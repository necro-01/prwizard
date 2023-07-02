#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = require("../package.json");
const config_command_1 = require("./commands/config.command");
const program = new commander_1.Command();
program
    .version(package_json_1.version || '0.0.0')
    .description(`Elevating Your Development Workflow with PRWizard\'s Review Magic!`);
program
    .command('config')
    .description(`Configure your prwizard with Github token & OpenAI API key.`)
    .action(async () => {
    const configCommand = new config_command_1.ConfigCommand({ commandName: 'config' });
    await configCommand.run();
});
program.parseAsync(process.argv).then(() => {
    // checkForUpdate(version);
});
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
