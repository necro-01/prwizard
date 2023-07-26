"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestReviewCommand = void 0;
const config_service_1 = require("../services/config.service");
const openai_service_1 = require("../services/openai.service");
const github_service_1 = require("../services/git/github.service");
const logger_1 = require("../logger");
const base_command_1 = require("./base.command");
class PullRequestReviewCommand extends base_command_1.BaseCommand {
    constructor(config) {
        super(config);
    }
    // PR-Review Command Logic
    async _run({ fullRepository, pullRequest, }) {
        const config = config_service_1.ConfigService.load();
        const openAIConfig = config.llm.openai;
        const pullRequestUrl = github_service_1.GithubService.getPullRequestUrl(fullRepository, pullRequest);
        logger_1.logger.info(`Reviewing ${pullRequestUrl}.`);
        // Retrieve the diff (changes) of the pull request from GitHub
        const pullRequestDiff = await github_service_1.GithubService.getPRDiff(config.github, config.git, fullRepository, pullRequest);
        this.spinner.text = 'Reviewing...';
        this.spinner.start();
        // Generate the review based on the pull request diff using OpenAI
        const review = await openai_service_1.OpenAiService.generateDiffReview(openAIConfig, pullRequestDiff);
        this.spinner.stop();
        logger_1.logger.info(review);
    }
}
exports.PullRequestReviewCommand = PullRequestReviewCommand;
