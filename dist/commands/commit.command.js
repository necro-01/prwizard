"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitCommand = void 0;
const prompts_1 = __importDefault(require("prompts"));
const interfaces_1 = require("../interfaces");
const config_service_1 = require("../services/config.service");
const git_local_service_1 = require("../services/git/git-local.service");
const file_service_1 = require("../services/file.service");
const logger_1 = require("../logger");
const openai_service_1 = require("../services/openai.service");
const base_command_1 = require("./base.command");
const chalk_1 = __importDefault(require("chalk"));
// Custom error class for Commit Command specific errors
class CommitCommandError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CommitCommandError';
    }
}
class CommitCommand extends base_command_1.BaseCommand {
    constructor(config) {
        super(config);
    }
    // Retrieve the diff for the changed files
    async filesDiff(filenames, gitConfig) {
        logger_1.logger.info('Reviewing local changes for commit...');
        return git_local_service_1.GitLocalService.getFilesDiff(filenames, {
            ignorePatterns: gitConfig.ignorePatterns,
        });
    }
    // Prompt user to select the files to be committed
    async selectChangedFiles() {
        const fileChanges = await git_local_service_1.GitLocalService.getAllChangedFiles();
        const selectedFiles = await file_service_1.FileService.selectFilesToCommit(fileChanges);
        // Separate selected and unselected file names
        const selectedFileNames = new Set(selectedFiles.map((file) => file.filename));
        const allFileNames = fileChanges.map((fileChange) => fileChange.filename);
        const unselectedFileNames = allFileNames.filter((filename) => !selectedFileNames.has(filename));
        return {
            selectedFileNames: Array.from(selectedFileNames),
            unselectedFileNames: unselectedFileNames,
        };
    }
    // Prompt user to confirm if they want to continue with the commit
    async promptToContinueCommit() {
        const response = await (0, prompts_1.default)({
            type: 'confirm',
            name: 'value',
            message: 'Do you want to continue commit?',
            initial: false,
        });
        return response.value;
    }
    // Prompt the user to select the commit action (commit, replace, or skip)
    async promptToGetCommitAction() {
        const response = await (0, prompts_1.default)({
            type: 'select',
            name: 'value',
            message: 'Select an action to perform:',
            choices: [
                { title: 'Commit message', value: interfaces_1.CommitAction.COMMIT },
                { title: 'Replace message', value: interfaces_1.CommitAction.REPLACE },
                { title: 'Do Nothing', value: interfaces_1.CommitAction.SKIP },
            ],
            initial: 0,
        });
        if (!response.value) {
            throw new CommitCommandError(chalk_1.default.bgGray.whiteBright('Commit action is required'));
        }
        return response.value;
    }
    // Prompt user to replace the commit message with a new one
    async promptToReplaceCommitMessage(initialMessage) {
        const response = await (0, prompts_1.default)({
            type: 'text',
            name: 'value',
            message: 'Enter new commit message:',
            initial: initialMessage,
        });
        if (!response.value) {
            throw new CommitCommandError(chalk_1.default.bgGray.whiteBright('Commit message is required'));
        }
        return response.value;
    }
    // Commit Command Logic
    async _run() {
        let continueToCommit = true;
        const config = config_service_1.ConfigService.load();
        const gitConfig = config.git;
        const openAIConfig = config.llm.openai;
        while (continueToCommit) {
            const { selectedFileNames, unselectedFileNames } = await this.selectChangedFiles();
            const diff = await this.filesDiff(selectedFileNames, gitConfig);
            logger_1.logger.info('Generating commit message.');
            const commitHistory = await git_local_service_1.GitLocalService.getCommitHistory(gitConfig.maxCommitHistory);
            this.spinner.text = 'Generating commit message...';
            this.spinner.start();
            const commitMessage = await openai_service_1.OpenAiService.generateCommitMessage(openAIConfig, diff, commitHistory);
            this.spinner.stop();
            logger_1.logger.info(commitMessage);
            const commitAction = await this.promptToGetCommitAction();
            continueToCommit = commitAction !== interfaces_1.CommitAction.SKIP;
            if (commitAction !== interfaces_1.CommitAction.SKIP) {
                const messageToCommit = commitAction === interfaces_1.CommitAction.COMMIT
                    ? commitMessage
                    : await this.promptToReplaceCommitMessage(commitMessage);
                await git_local_service_1.GitLocalService.commit(messageToCommit, selectedFileNames);
                continueToCommit =
                    unselectedFileNames.length === 0
                        ? false
                        : await this.promptToContinueCommit();
            }
        }
    }
}
exports.CommitCommand = CommitCommand;
