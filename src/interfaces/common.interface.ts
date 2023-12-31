import { GitConfig } from './git.interface';
import { GithubConfig } from './github.interface';
import { LLMConfig } from './llm.interface';

export interface Config {
    git: GitConfig;
    github: GithubConfig;
    llm: LLMConfig;
}

export enum CommitAction {
    COMMIT = 'commit',
    REPLACE = 'replace',
    SKIP = 'skip',
}

export interface CommandConfig {
    commandName: string;
}

export interface GitDiff {
    diff: string;
}

export interface ReviewArgs {
    directory: string;
    filename: string;
}

export interface PullRequestReviewArgs {
    fullRepository: string;
    pullRequest: string;
}

export interface Prompt {
    system: string;
    user: string;
}

export interface FileSelectionStatus {
    selectedFileNames: string[];
    unselectedFileNames: string[];
}

export interface GitFileChange {
    filename: string;
    status: 'deleted' | 'changed' | 'added';
}

export interface GetFileResponse {
    content: string;
    filename: string;
}
