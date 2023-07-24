#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = require("../package.json");
const config_command_1 = require("./commands/config.command");
const review_command_1 = require("./commands/review.command");
const commit_command_1 = require("./commands/commit.command");
const pr_review_command_1 = require("./commands/pr-review.command");
const program = new commander_1.Command();
program
    .version(package_json_1.version || '0.0.0')
    .description(`Elevating Your Development Workflow with PRWizard's Review Magic!`);
program
    .command('config')
    .description(`Configure your prwizard with Github token & OpenAI API key.`)
    .action(async () => {
    const configCommand = new config_command_1.ConfigCommand({ commandName: 'config' });
    await configCommand.run();
});
program
    .command('pr <repository> <pull_request>')
    .description(`Review a pull request.`)
    .action(async (pullRequestReviewArgs) => {
    const pullRequestReviewCommand = new pr_review_command_1.PullRequestReviewCommand({ commandName: 'pr-review' });
    await pullRequestReviewCommand.run(pullRequestReviewArgs);
});
program
    .command('review')
    .description(`Review your local changes or a specific file.`)
    .option('-f, --filename <filename>', 'filename to review', '')
    .option('-d, --directory <directory>', 'directory of the file to review', '.')
    .action(async (localReviewArgs) => {
    const localReviewCommand = new review_command_1.ReviewCommand({ commandName: 'local-review' });
    await localReviewCommand.run(localReviewArgs);
});
program
    .command('commit')
    .description('Autogenerate commit message & commit selected files.')
    .action(async () => {
    const commitCommand = new commit_command_1.CommitCommand({ commandName: 'commit' });
    await commitCommand.run();
});
program.parseAsync(process.argv).then(() => {
    // checkForUpdate(version);
});
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
