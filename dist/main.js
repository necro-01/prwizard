#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = require("../package.json");
const logger_1 = require("./logger");
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
program
    .version(package_json_1.version || '0.0.0')
    .description(`Elevating Your Development Workflow with PRWizard\'s Review Magic!`);
program
    .command('config')
    .description(`Configure your prwizard with Github token & OpenAI API key:`)
    .action(() => {
    logger_1.logger.info(chalk_1.default.bgGreenBright('Hi'));
});
program.parseAsync(process.argv).then(() => {
    // checkForUpdate(version);
});
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
