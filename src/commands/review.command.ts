import { CommandConfig, GitConfig, ReviewArgs, OpenAIConfig } from '../interfaces';
import { ConfigService } from '../services/config.service';
import { OpenAiService } from '../services/openai.service';
import { GitLocalService } from '../services/git/git-local.service';
import { FileService } from '../services/file.service';
import { logger } from '../logger';

import { BaseCommand } from './base.command';

export class ReviewCommand extends BaseCommand<ReviewArgs> {
    constructor(config: CommandConfig) {
        super(config);
    }

    protected async _run({ directory, filename }: ReviewArgs): Promise<void> {
        const config = ConfigService.load();
        const openAIConfig = config.llm.openai;
        const gitConfig = config.git;

        // Perform code review based on whether a filename is provided or not
        this.spinner.text = 'Reviewing...';
        const review = filename
            ? await this.reviewFile(openAIConfig, directory, filename)
            : await this.reviewDiff(openAIConfig, gitConfig);
        this.spinner.stop();

        logger.info(review);
    }

    // Perform code review on local changes
    private async reviewDiff(
        openAIConfig: OpenAIConfig,
        gitConfig: GitConfig,
    ): Promise<string> {
        // Retrieve the local diff using GitLocalService
        const localDiff = await GitLocalService.getLocalDiff({
            ignorePatterns: gitConfig.ignorePatterns,
        });
        logger.info('Reviewing local changes.');

        this.spinner.start();
        return OpenAiService.generateDiffReview(openAIConfig, localDiff);
    }

    // Perform code review on a specific file
    private async reviewFile(
        openAIConfig: OpenAIConfig,
        directory: string,
        filename: string,
    ): Promise<string> {
        // Retrieve the content and name of the specified file using FileService
        const getFileResponse = await FileService.getFileContentAndName(
            directory,
            filename,
        );
        const contentWithLineNumbers = FileService.addLineNumbers(
            getFileResponse.content,
        );

        logger.info(`Reviewing ${getFileResponse.filename}.`);

        this.spinner.start();
        return OpenAiService.generateFileReview(
            openAIConfig,
            contentWithLineNumbers,
            getFileResponse.filename,
        );
    }
}