"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubService = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const parse_diff_1 = __importDefault(require("parse-diff"));
const chalk_1 = __importDefault(require("chalk"));
// Custom error class for Git (Local) Service specific errors
class GithubServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GithubServiceError';
    }
}
class GithubService {
    // Extract owner and repository name from the full repository path
    static getOwnerAndRepo(fullRepositoryPath) {
        const ownerRepoRegex = /^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/;
        if (!ownerRepoRegex.test(fullRepositoryPath)) {
            throw new GithubServiceError(chalk_1.default.bgRed.whiteBright('Invalid repository format. Please use the format: owner/repo'));
        }
        const [owner, repo] = fullRepositoryPath.split('/');
        return { owner, repo };
    }
    // Fetch the diff of a pull request from GitHub API
    static async getPRDiff(githubConfig, gitConfig, fullRepositoryPath, prNumber) {
        const { owner, repo } = this.getOwnerAndRepo(fullRepositoryPath);
        const apiPRUrl = `${githubConfig.githubApiUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;
        const diffResponse = await (0, node_fetch_1.default)(apiPRUrl, {
            headers: {
                Authorization: `Bearer ${githubConfig.githubSecretToken}`,
                'User-Agent': 'prwizard',
                Accept: 'application/vnd.github.diff',
            },
        });
        if (!diffResponse.ok) {
            throw new GithubServiceError(chalk_1.default.bgRed.whiteBright(`Failed to fetch PR diff: ${diffResponse.statusText}`));
        }
        const diff = await diffResponse.text();
        const parsedDiff = (0, parse_diff_1.default)(diff);
        const filteredDiff = this.filterParsedDiff(parsedDiff, gitConfig.ignorePatterns);
        if (filteredDiff.length === 0) {
            throw new GithubServiceError(chalk_1.default.bgGray.whiteBright('No files to diff'));
        }
        const filteredDiffText = this.convertParsedDiffToText(filteredDiff);
        return { diff: filteredDiffText };
    }
    // Filter the parsed diff based on the provided ignore patterns
    static filterParsedDiff(parsedDiff, ignorePatterns) {
        const ignorePatternsRegex = ignorePatterns?.map((pattern) => new RegExp(pattern)) || [];
        return parsedDiff.filter((fileDiff) => {
            return !ignorePatternsRegex.some((pattern) => (fileDiff.to && pattern.test(fileDiff.to)) ||
                (fileDiff.from && pattern.test(fileDiff.from)));
        });
    }
    // Convert the parsed diff into a formatted text representation
    static convertParsedDiffToText(parsedDiff) {
        return parsedDiff
            .map((file) => {
            const chunks = file.chunks
                .map((chunk) => {
                const changes = chunk.changes
                    .map((change) => {
                    return `${change.type === 'normal' ? ' ' : change.type[0]}${change.content}`;
                })
                    .join('\n');
                return `@@ -${chunk.oldStart},${chunk.oldLines} +${chunk.newStart},${chunk.newLines} @@\n${changes}`;
            })
                .join('\n\n');
            return `--- ${file.from}\n+++ ${file.to}\n${chunks}`;
        })
            .join('\n\n');
    }
    // Generate the URL for a specific pull request in the GitHub repository
    static getPullRequestUrl(fullRepositoryPath, pullRequest) {
        return `https://github.com/${fullRepositoryPath}/pull/${pullRequest}`;
    }
}
exports.GithubService = GithubService;
