#!/usr/bin/env node
import { Command } from 'commander';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { version } from '../package.json';
import {checkForUpdate} from "./utils/updateChecker";
import {logger} from "./logger";
import chalk from "chalk";

const program = new Command();

program
    .version(version || '0.0.0')
    .description(`Elevating Your Development Workflow with PRWizard\'s Review Magic!`);

program
    .command('config')
    .description(`Configure your prwizard with Github token & OpenAI API key:`)
    .action(() => {
        logger.info(chalk.bgGreenBright('Hi'));
    });

program.parseAsync(process.argv).then(() => {
    checkForUpdate(version);
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
}