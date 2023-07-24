# [](https://github.com/necro-01/prwizard/tree/master#getting-started)Getting Started

prwizard is a powerful and user-friendly tool for automating code review and streamlining the pull request process. It is designed to enhance collaboration and efficiency in software development workflows.

## [](https://github.com/necro-01/prwizard/tree/master#features)Features

- Automated Code Review: prwizard automatically reviews code changes, identifies potential issues, and provides detailed feedback to ensure code quality.
- Pull Request Diff Review: Effortlessly review pull request diffs with clear and concise feedback, enhancing the review process.
- Smart Commit Message Generation: Generate precise and meaningful commit messages for code changes based on Git diffs and commit history.

## [](https://github.com/necro-01/prwizard/tree/master#prerequisites)Prerequisites

 - Make sure you have [Node.js](https://nodejs.org/en/download/)  and  [npm](https://www.npmjs.com/get-npm) installed on your machine.
- You'll also need OpenAI API key and Github access token to use this tool.

> Note: OpenAI charges for its API. Make sure you have active credits on your OpenAI account (or have a premium account). If you want free credits worth $5, create a new OpenAI account with a **different phone number**.

## [](https://github.com/necro-01/prwizard/tree/master#switching-to-gpt-4-model)Switching to GPT-4 Model

prwizard is set to use the GPT-3.5-turbo model by default. If you wish to switch to GPT-4, you can do so by modifying your  `prwizard.json`  config file:

1.  Run the config command if you haven't done so already. This will generate the  `prwizard.json`  config file:

```bash
prwizard config
```

2.  Locate your  `prwizard.json`  config file. By default, it is saved in the  `.prwizard`  directory in your **home directory** (`~/.prwizard`).
3.  Find the  `llm`  section and then the  `openai`  subsection within it.
4.  Change the value of  `openaiModel`  from  `gpt-3.5-turbo`  to  `gpt-4`.
5.  Save and close your  `prwizard.json`  config file.

Remember that using GPT-4 may result in increased API costs. Please refer to OpenAI's pricing for more information.

## [](https://github.com/necro-01/prwizard/tree/master#installation)Installation

You can install prwizard globally using npm by running the following command:

```bash
npm i -g prwizard
```

# [](https://github.com/necro-01/prwizard/tree/master#usage)Usage

Before using prwizard, you need to set up the configuration with your OpenAI API key and GitHub token. You can do this with the following command:

```bash
prwizard config
```

This will prompt you to enter your OpenAI API key and GitHub token.

For a comprehensive list of all available commands and options in prwizard, run the help command:

```bash
prwizard -h
```

This will display a list of all the available commands, their descriptions, and options you can use with prwizard.

## [](https://github.com/necro-01/prwizard/tree/master#environment-variables)Environment Variables

prwizard can also be configured using environment variables. If an environment variable is not provided, prwizard will use the default value.

Here are the available environment variables:

-   `GIT_MAX_COMMIT_HISTORY`: Maximum number of commit history entries to fetch (default: 10).
-   `GIT_IGNORE_PATTERNS`: A comma-separated list of regular expression patterns of files to ignore (default: []).
-   `GITHUB_API_URL`: Custom URL for the GitHub API (default:  [https://api.github.com](https://api.github.com/)).
-   `GITHUB_TOKEN`: GitHub personal access token.
-   `OPENAI_API_URL`: Custom URL for the OpenAI API (default:  [https://api.openai.com](https://api.openai.com/)).
-   `OPENAI_API_KEY`: OpenAI API key for accessing the OpenAI API.
-   `OPENAI_MODEL`: OpenAI model to use (default: gpt-3.5-turbo).
-   `OPENAI_TEMPERATURE`: Temperature parameter for OpenAI model (default: 0).

## [](https://github.com/necro-01/prwizard/tree/master#local-code-review)Local Code Review

prwizard can analyze local changes in two ways:

### [](https://github.com/necro-01/prwizard/tree/main#1-analyzing-all-local-changes)1. Analyzing all local changes

If you want to analyze your local changes, navigate to the root directory of your local Git repository and run the following command:

```bash
prwizard review
```

prwizard will then analyze your local changes and provide a review.

### [](https://github.com/necro-01/prwizard/tree/master#2-analyzing-a-specific-file)2. Analyzing a specific file

If you want to analyze a specific file in your local directory, navigate to the root directory of your local Git repository and run the following command:

```bash
prwizard review --directory <directory> --filename <filename>
```

Replace  `<directory>`  with the relative path of the directory to search and  `<filename>`  with the name of the file to review.

## [](https://github.com/necro-01/prwizard/tree/master#generate-commit-message)Generate Commit Message

prwizard can propose commit messages based on local diffs and commit history. To use this feature, run the following command:

```bash
prwizard commit
```

prwizard will prompt you to select the files you wish to commit. Once the files are selected, prwizard fetches the commit history and proposes a commit message. If you agree with the suggested commit message, you can proceed to commit your changes right away. If there are unselected files left, prwizard will ask you if you wish to continue the commit process.

## [](https://github.com/necro-01/prwizard/tree/master#pull-request-review)Pull Request Review

If you want to analyze a pull request, run the following command:

```bash
prwizard pr <repository> <pull_request_number>
```

Replace  `<repository>`  with the repository to review in the format  `owner/repository`, and  `<pull_request_number>`  with the number of the pull request to review. For example:

```bash
prwizard pr necro-01/prwizard 18
```

prwizard will then fetch the pull request details, analyze the changes, and provide you with a review.

# [](https://github.com/necro-01/prwizard/tree/master#ignoring-files)Ignoring Files

prwizard tool allows you to ignore certain files during your review process by using regular expression patterns. You can define these patterns either through a configuration file or via an environment variable. The CLI tool will ignore files that match any of the provided patterns.

## [](https://github.com/necro-01/prwizard/tree/master#via-configuration-file)Via Configuration File

You can define an array of  `ignorePatterns`  under the  `git`  section in your  `prwizard.json`  configuration file, like so:

```json
{
  "git": {
    "ignorePatterns": [".*lock.*", "another_pattern", "..."]
  }
}
```

## [](https://github.com/necro-01/prwizard/tree/master#via-environment-variable)Via Environment Variable

Alternatively, you can use the  `GIT_IGNORE_PATTERNS`  environment variable to define a comma-separated list of regular expression patterns:

```javascript
export GIT_IGNORE_PATTERNS=.*lock.*,another_pattern,...
```
