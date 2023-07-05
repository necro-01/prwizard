"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewCommand = void 0;
const config_service_1 = require("../services/config.service");
const openai_service_1 = require("../services/openai.service");
const git_local_service_1 = require("../services/git/git-local.service");
const file_service_1 = require("../services/file.service");
const logger_1 = require("../logger");
const base_command_1 = require("./base.command");
class ReviewCommand extends base_command_1.BaseCommand {
    constructor(config) {
        super(config);
    }
    async _run({ directory, filename }) {
        const config = config_service_1.ConfigService.load();
        const openAIConfig = config.llm.openai;
        const gitConfig = config.git;
        // Perform code review based on whether a filename is provided or not
        this.spinner.text = 'Reviewing...';
        const review = filename
            ? await this.reviewFile(openAIConfig, directory, filename)
            : await this.reviewDiff(openAIConfig, gitConfig);
        this.spinner.stop();
        logger_1.logger.info(review);
    }
    // Perform code review on local changes
    async reviewDiff(openAIConfig, gitConfig) {
        // Retrieve the local diff using GitLocalService
        const localDiff = await git_local_service_1.GitLocalService.getLocalDiff({
            ignorePatterns: gitConfig.ignorePatterns,
        });
        logger_1.logger.info('Reviewing local changes.');
        this.spinner.start();
        return openai_service_1.OpenAiService.generateDiffReview(openAIConfig, localDiff);
    }
    // Perform code review on a specific file
    async reviewFile(openAIConfig, directory, filename) {
        // Retrieve the content and name of the specified file using FileService
        const getFileResponse = await file_service_1.FileService.getFileContentAndName(directory, filename);
        const contentWithLineNumbers = file_service_1.FileService.addLineNumbers(getFileResponse.content);
        logger_1.logger.info(`Reviewing ${getFileResponse.filename}.`);
        this.spinner.start();
        return openai_service_1.OpenAiService.generateFileReview(openAIConfig, contentWithLineNumbers, getFileResponse.filename);
    }
}
exports.ReviewCommand = ReviewCommand;
