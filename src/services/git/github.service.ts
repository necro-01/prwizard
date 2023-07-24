import fetch from 'node-fetch';
import parse, { File as ParsedFile } from 'parse-diff';

import { GithubConfig, GitHubRepository, GitDiff, GitConfig } from '../../interfaces';
import chalk from "chalk";

// Custom error class for Git (Local) Service specific errors
class GithubServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GithubServiceError';
    }
}

export class GithubService {
    // Extract owner and repository name from the full repository path
    private static getOwnerAndRepo(fullRepositoryPath: string): GitHubRepository {
        const ownerRepoRegex = /^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/;
        if (!ownerRepoRegex.test(fullRepositoryPath)) {
            throw new GithubServiceError(
                chalk.bgRed.whiteBright('Invalid repository format. Please use the format: owner/repo'),
            );
        }
        const [owner, repo] = fullRepositoryPath.split('/');

        return { owner, repo };
    }

    // Fetch the diff of a pull request from GitHub API
    static async getPRDiff(
        githubConfig: GithubConfig,
        gitConfig: GitConfig,
        fullRepositoryPath: string,
        prNumber: string,
    ): Promise<GitDiff> {
        const { owner, repo } = this.getOwnerAndRepo(fullRepositoryPath);
        const apiPRUrl = `${githubConfig.githubApiUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;

        const diffResponse = await fetch(apiPRUrl, {
            headers: {
                Authorization: `Bearer ${githubConfig.githubSecretToken}`,
                'User-Agent': 'prwizard',
                Accept: 'application/vnd.github.diff',
            },
        });

        if (!diffResponse.ok) {
            throw new GithubServiceError(
                chalk.bgRed.whiteBright(`Failed to fetch PR diff: ${diffResponse.statusText}`),
            );
        }

        const diff = await diffResponse.text();
        const parsedDiff: ParsedFile[] = parse(diff);

        const filteredDiff: ParsedFile[] = this.filterParsedDiff(
            parsedDiff,
            gitConfig.ignorePatterns,
        );

        if (filteredDiff.length === 0) {
            throw new GithubServiceError(
                chalk.bgGray.whiteBright('No files to diff'),
            );
        }

        const filteredDiffText = this.convertParsedDiffToText(filteredDiff);

        return { diff: filteredDiffText };
    }

    // Filter the parsed diff based on the provided ignore patterns
    private static filterParsedDiff(
        parsedDiff: ParsedFile[],
        ignorePatterns: string[],
    ): ParsedFile[] {
        const ignorePatternsRegex =
            ignorePatterns?.map((pattern) => new RegExp(pattern)) || [];

        return parsedDiff.filter((fileDiff: ParsedFile) => {
            return !ignorePatternsRegex.some(
                (pattern) =>
                    (fileDiff.to && pattern.test(fileDiff.to)) ||
                    (fileDiff.from && pattern.test(fileDiff.from)),
            );
        });
    }

    // Convert the parsed diff into a formatted text representation
    private static convertParsedDiffToText(parsedDiff: ParsedFile[]): string {
        return parsedDiff
            .map((file) => {
                const chunks = file.chunks
                    .map((chunk) => {
                        const changes = chunk.changes
                            .map((change) => {
                                return `${change.type === 'normal' ? ' ' : change.type[0]}${
                                    change.content
                                }`;
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
    static getPullRequestUrl(
        fullRepositoryPath: string,
        pullRequest: string,
    ): string {
        return `https://github.com/${fullRepositoryPath}/pull/${pullRequest}`;
    }
}
