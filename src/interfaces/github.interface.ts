export interface GithubConfig {
    githubApiUrl: string;
    githubSecretToken: string;
}

export interface GitHubRepository {
    owner: string;
    repo: string;
}
