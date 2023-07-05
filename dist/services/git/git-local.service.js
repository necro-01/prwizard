"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLocalService = void 0;
const simple_git_1 = require("simple-git");
const chalk_1 = __importDefault(require("chalk"));
// Custom error class for Git (Local) Service specific errors
class GitLocalServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GitLocalServiceError';
    }
}
class GitLocalService {
    static async getLocalDiff(options) {
        const fileChanges = await this.getAllChangedFiles();
        const filenames = fileChanges.map((fileChange) => fileChange.filename);
        return this.getFilesDiff(filenames, {
            ignorePatterns: options?.ignorePatterns,
        });
    }
    static async getAllChangedFiles() {
        await this._checkIsRepo();
        const status = await this.git.status();
        // Categorize the files based on their status
        const added = [...status.created, ...status.not_added].map((filename) => ({ filename, status: 'added' }));
        const deleted = status.deleted.map((filename) => ({
            filename,
            status: 'deleted',
        }));
        const changed = [
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
    static async getFilesDiff(filenames, options) {
        await this._checkIsRepo();
        const ignorePatterns = options?.ignorePatterns?.map((pattern) => new RegExp(pattern)) || [];
        // Filter filenames based on ignore patterns
        const filteredFilenames = filenames.filter((filename) => {
            return !ignorePatterns.some((pattern) => pattern.test(filename));
        });
        if (filteredFilenames.length === 0) {
            throw new GitLocalServiceError(chalk_1.default.bgRed.whiteBright('No files to diff'));
        }
        const diff = await this.git.diff(['HEAD', '--'].concat(filteredFilenames));
        return { diff };
    }
    static async getCommitHistory(maxCommitHistory) {
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
    static async commit(message, filenames) {
        await this._checkIsRepo();
        await this.git.add(filenames);
        await this.git.commit(message);
    }
    // Check if the current directory is a Git repository
    static async _checkIsRepo() {
        if (!(await this.git.checkIsRepo())) {
            throw new GitLocalServiceError(chalk_1.default.bgRed.whiteBright('Current directory is not inside a Git repository.'));
        }
    }
}
exports.GitLocalService = GitLocalService;
// Initialize a simple-git instance
GitLocalService.git = (0, simple_git_1.gitP)();
