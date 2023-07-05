import prompts from 'prompts';

import {
    CommandConfig,
    CommitAction,
    FileSelectionStatus,
    GitConfig,
    GitDiff,
    ReviewArgs,
} from '../interfaces';
import { ConfigService } from '../services/config.service';
import { GitLocalService } from '../services/git/git-local.service';
import { FileService } from '../services/file.service';
import { logger } from '../logger';
import { OpenAiService } from '../services/openai.service';

import { BaseCommand } from './base.command';
import chalk from "chalk";

// Custom error class for Commit Command specific errors
class CommitCommandError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CommitCommandError';
    }
}

export class CommitCommand extends BaseCommand<ReviewArgs> {
    constructor(config: CommandConfig) {
        super(config);
    }

    // Retrieve the diff for the changed files
    private async filesDiff(
        filenames: string[],
        gitConfig: GitConfig,
    ): Promise<GitDiff> {
        logger.info('Reviewing local changes for commit');
        return GitLocalService.getFilesDiff(filenames, {
            ignorePatterns: gitConfig.ignorePatterns,
        });
    }

    // Prompt user to select the files to be committed
    private async selectChangedFiles(): Promise<FileSelectionStatus> {
        const fileChanges = await GitLocalService.getAllChangedFiles();
        const selectedFiles = await FileService.selectFilesToCommit(fileChanges);

        // Separate selected and unselected file names
        const selectedFileNames = new Set(
            selectedFiles.map((file) => file.filename),
        );
        const allFileNames = fileChanges.map((fileChange) => fileChange.filename);

        const unselectedFileNames = allFileNames.filter(
            (filename) => !selectedFileNames.has(filename),
        );

        return {
            selectedFileNames: Array.from(selectedFileNames),
            unselectedFileNames: unselectedFileNames,
        };
    }

    // Prompt user to confirm if they want to continue with the commit
    private async promptToContinueCommit(): Promise<boolean> {
        const response = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Do you want to continue commit?',
            initial: false,
        });

        return response.value;
    }

    // Prompt the user to select the commit action (commit, replace, or skip)
    private async promptToGetCommitAction(): Promise<CommitAction> {
        const response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Select an action to perform:',
            choices: [
                { title: 'Commit message', value: CommitAction.COMMIT },
                { title: 'Replace message', value: CommitAction.REPLACE },
                { title: 'Do Nothing', value: CommitAction.SKIP },
            ],
            initial: 0,
        });

        if (!response.value) {
            throw new CommitCommandError(
                chalk.bgGray.whiteBright('Commit action is required'),
            );
        }

        return response.value;
    }

    // Prompt user to replace the commit message with a new one
    private async promptToReplaceCommitMessage(
        initialMessage: string,
    ): Promise<string> {
        const response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Enter new commit message:',
            initial: initialMessage,
        });

        if (!response.value) {
            throw new CommitCommandError(
                chalk.bgGray.whiteBright('Commit message is required'),
            );
        }

        return response.value;
    }

    // Commit Command Logic
    protected async _run(): Promise<void> {
        let continueToCommit = true;
        const config = ConfigService.load();
        const gitConfig = config.git;
        const openAIConfig = config.llm.openai;

        while (continueToCommit) {
            const { selectedFileNames, unselectedFileNames } =
                await this.selectChangedFiles();
            const diff = await this.filesDiff(selectedFileNames, gitConfig);

            logger.info('Generating commit message.');

            const commitHistory = await GitLocalService.getCommitHistory(
                gitConfig.maxCommitHistory,
            );

            this.spinner.text = 'Generating commit message...';
            this.spinner.start();
            const commitMessage = await OpenAiService.generateCommitMessage(
                openAIConfig,
                diff,
                commitHistory,
            );
            this.spinner.stop();
            logger.info(commitMessage);

            const commitAction = await this.promptToGetCommitAction();

            continueToCommit = commitAction !== CommitAction.SKIP;

            if (commitAction !== CommitAction.SKIP) {
                const messageToCommit =
                    commitAction === CommitAction.COMMIT
                        ? commitMessage
                        : await this.promptToReplaceCommitMessage(commitMessage);
                await GitLocalService.commit(messageToCommit, selectedFileNames);

                continueToCommit =
                    unselectedFileNames.length === 0
                        ? false
                        : await this.promptToContinueCommit();
            }
        }
    }
}
