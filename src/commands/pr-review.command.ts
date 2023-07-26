import { CommandConfig, PullRequestReviewArgs } from '../interfaces';
import { ConfigService } from '../services/config.service';
import { OpenAiService } from '../services/openai.service';
import { GithubService } from '../services/git/github.service';
import { logger } from '../logger';

import { BaseCommand } from './base.command';

export class PullRequestReviewCommand extends BaseCommand<PullRequestReviewArgs> {
    constructor(config: CommandConfig) {
        super(config);
    }

    // PR-Review Command Logic
    protected async _run({
        fullRepository,
        pullRequest,
    }: PullRequestReviewArgs): Promise<void> {
        const config = ConfigService.load();
        const openAIConfig = config.llm.openai;

        const pullRequestUrl = GithubService.getPullRequestUrl(
            fullRepository,
            pullRequest,
        );
        logger.info(`Reviewing ${ pullRequestUrl }.`);

        // Retrieve the diff (changes) of the pull request from GitHub
        const pullRequestDiff = await GithubService.getPRDiff(
            config.github,
            config.git,
            fullRepository,
            pullRequest,
        );

        this.spinner.text = 'Reviewing...';
        this.spinner.start();

        // Generate the review based on the pull request diff using OpenAI
        const review = await OpenAiService.generateDiffReview(
            openAIConfig,
            pullRequestDiff,
        );
        this.spinner.stop();

        logger.info(review);
    }
}
