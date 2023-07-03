import { gitP } from 'simple-git';

import { GitFileChange, GitDiff } from '../../interfaces';
import chalk from "chalk";

// Custom error class for Git (Local) Service specific errors
class GitLocalServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GitLocalServiceError';
    }
}

export class GitLocalService {
    // Initialize a simple-git instance
    private static readonly git = gitP();

    public static async getLocalDiff(options?: {
        ignorePatterns?: string[];
    }): Promise<GitDiff> {
        const fileChanges = await this.getAllChangedFiles();
        const filenames = fileChanges.map((fileChange) => fileChange.filename);

        return this.getFilesDiff(filenames, {
            ignorePatterns: options?.ignorePatterns,
        });
    }

    public static async getAllChangedFiles(): Promise<GitFileChange[]> {
        await this._checkIsRepo();

        const status = await this.git.status();

        // Categorize the files based on their status
        const added: GitFileChange[] = [...status.created, ...status.not_added].map(
            (filename) => ({ filename, status: 'added' }),
        );

        const deleted: GitFileChange[] = status.deleted.map((filename) => ({
            filename,
            status: 'deleted',
        }));

        const changed: GitFileChange[] = [
            ...status.modified,
            ...status.renamed.map((renamed) => renamed.to),
            ...status.conflicted,
        ].map((filename) => ({ filename, status: 'changed' }));

        // Merge the categorized file changes and sort by filename
        return [...added, ...deleted, ...changed].sort((a, b) => {
            return a.filename.localeCompare(b.filename);
        });
    }

    // Retrieve the diff content for specified files
    public static async getFilesDiff(
        filenames: string[],
        options?: { ignorePatterns?: string[] },
    ): Promise<GitDiff> {
        await this._checkIsRepo();

        const ignorePatterns =
            options?.ignorePatterns?.map((pattern) => new RegExp(pattern)) || [];

        // Filter filenames based on ignore patterns
        const filteredFilenames = filenames.filter((filename) => {
            return !ignorePatterns.some((pattern) => pattern.test(filename));
        });

        if (filteredFilenames.length === 0) {
            throw new GitLocalServiceError(
                chalk.bgRed.whiteBright('No files to diff'),
            );
        }

        const diff = await this.git.diff(['HEAD', '--'].concat(filteredFilenames));

        return { diff };
    }

    public static async getCommitHistory(maxCommitHistory: number): Promise<string[]> {
        await this._checkIsRepo();

        // Retrieve commit history with specified maximum number of commits
        const history = await this.git.log([
            '-n',
            String(maxCommitHistory),
            '--pretty=format:%s',
        ]);

        // Extract the commit hashes from the history and flatten the array
        return history.all
            .map((commit) => {
                return commit.hash;
            })
            .map((commits) => {
                return commits.split('\n');
            })
            .flat();
    }

    // Perform a commit with the provided commit message and filenames by adding them to staging area
    public static async commit(
        message: string,
        filenames: string[],
    ): Promise<void> {
        await this._checkIsRepo();

        await this.git.add(filenames);
        await this.git.commit(message);
    }

    // Check if the current directory is a Git repository
    private static async _checkIsRepo(): Promise<void> {
        if (!(await this.git.checkIsRepo())) {
            throw new GitLocalServiceError(
                chalk.bgRed.whiteBright('Current directory is not inside a Git repository.'),
            );
        }
    }
}