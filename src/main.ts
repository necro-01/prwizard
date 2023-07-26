#!/usr/bin/env node
import { Command } from 'commander';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { version } from '../package.json';
import { ConfigCommand } from "./commands/config.command";
import { ReviewArgs } from "./interfaces";
import { ReviewCommand } from "./commands/review.command";
import { CommitCommand } from "./commands/commit.command";
import { PullRequestReviewCommand } from "./commands/pr-review.command";
import { checkForUpdate } from "./utils/updateChecker";

const program = new Command();

program
    .version(version || '0.0.0')
    .description(`Elevating Your Development Workflow with PRWizard's Review Magic!`);

program
    .command('config')
    .description(`Configure your prwizard with Github token & OpenAI API key`)
    .action(async () => {
        const configCommand = new ConfigCommand({ commandName: 'config' });
        await configCommand.run();
    });

program
    .command('pr <repository> <pull_request>')
    .description(`Review a pull request`)
    .action(async (repository: string, pullRequest: string) => {
        const pullRequestReviewCommand = new PullRequestReviewCommand({ commandName: 'pr-review' });
        await pullRequestReviewCommand.run({fullRepository: repository, pullRequest});
    });

program
    .command('review')
    .description(`Review your local changes or a specific file`)
    .option('-f, --filename <filename>', 'filename to review', '')
    .option('-d, --directory <directory>', 'directory of the file to review', '.')
    .action(async (localReviewArgs: ReviewArgs) => {
        const localReviewCommand = new ReviewCommand({ commandName: 'local-review' });
        await localReviewCommand.run(localReviewArgs);
    });

program
    .command('commit')
    .description('Autogenerate commit message & commit selected files')
    .action(async () => {
        const commitCommand = new CommitCommand({ commandName: 'commit' });
        await commitCommand.run();
    });

program.parseAsync(process.argv).then(() => {
    checkForUpdate(version);
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
