import fs from 'fs';
import path from 'path';
import os from 'os';

import merge from 'lodash.merge';
import { Config } from '../interfaces';
import chalk from "chalk";

const CONFIG_FILENAME = 'prwizard.json';

const DEFAULT_CONFIG: Config = {
    git: {
        ignorePatterns: [],
        maxCommitHistory: 10,
    },
    github: {
        githubApiUrl: 'https://api.github.com',
        githubSecretToken: '',
    },
    llm: {
        openai: {
            openaiApiUrl: 'https://api.openai.com',
            openaiModel: 'gpt-3.5-turbo',
            openaiTemperature: 0,
            openaiSecretApiKey: '',
        },
    },
};

// Custom error class for Configuration-specific errors
class ConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConfigurationError';
    }
}

export class ConfigService {
    // Determine the path to the configuration file based on the environment variables (.env)
    private static getConfigFilePath(): string {
        const configDir =
            process.env.NODE_ENV === 'development'
                ? process.cwd()
                : path.join(os.homedir(), '.prwizard');
        return path.join(configDir, CONFIG_FILENAME);
    }

    // Check environment variables for configuration setting and create a configuration object from them
    private static checkEnvForConfiguration(): Config {
        const envConfig = {
            git: {
                ignorePatterns: process.env.GIT_IGNORE_PATTERNS?.split(','),
                maxCommitHistory: process.env.GIT_MAX_COMMIT_HISTORY
                    ? Number(process.env.GIT_MAX_COMMIT_HISTORY)
                    : undefined,
            },
            github: {
                githubApiUrl: process.env.GITHUB_API_URL,
                githubSecretToken: process.env.GITHUB_TOKEN,
            },
            llm: {
                openai: {
                    openaiApiUrl: process.env.OPENAI_API_URL,
                    openaiModel: process.env.OPENAI_MODEL,
                    openaiTemperature: process.env.OPENAI_TEMPERATURE
                        ? Number(process.env.OPENAI_TEMPERATURE)
                        : undefined,
                    openaiSecretApiKey: process.env.OPENAI_API_KEY,
                },
            },
        } as Config;

        // Clean the environment configuration to remove undefined values and merge it with default config
        const cleanedEnvConfig = JSON.parse(JSON.stringify(envConfig));
        return merge({}, DEFAULT_CONFIG, cleanedEnvConfig);
    }

    private static checkConfigFileExists(): boolean {
        const configPath = this.getConfigFilePath();
        return fs.existsSync(configPath);
    }

    static checkFileForConfiguration(): Config {
        let fileConfig = {} as Config;
        if (this.checkConfigFileExists()) {
            try {
                // Read and parse the configuration file
                fileConfig = JSON.parse(fs.readFileSync(this.getConfigFilePath(), 'utf-8'));
            } catch (err) {
                throw new ConfigurationError(
                    chalk.bgRed.whiteBright('Unable to parse the configuration file. Please ensure that the file is a valid JSON.'),
                );
            }
        }
        return merge({}, DEFAULT_CONFIG, fileConfig);
    }

    private static validateTemperature(temperature: number): void {
        if (!(temperature >= 0.0 && temperature <= 2.0)) {
            throw new ConfigurationError(
                chalk.bgRed.whiteBright('Invalid temperature value. It must be a value between 0 and 2 (inclusive).'),
            );
        }
    }

    static save({githubToken, openaiApiKey,}: {
        githubToken: string;
        openaiApiKey: string;
    }): void {
        const configPath = this.getConfigFilePath();
        const dir = path.dirname(configPath);

        if (!fs.existsSync(dir)) {
            // Create the directory (config file), if it doesn't exist
            fs.mkdirSync(dir, {recursive: true});
        }

        const config = this.checkFileForConfiguration();

        config.github.githubSecretToken = githubToken;
        config.llm.openai.openaiSecretApiKey = openaiApiKey;

        // Save the updated configuration to the file
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    static load(): Config {
        // Load the configuration either from the config file or environment variables (.env)
        // console.log(this.checkConfigFileExists());
        const config = this.checkConfigFileExists()
            ? this.checkFileForConfiguration()
            : this.checkEnvForConfiguration();

        this.validateTemperature(config.llm.openai.openaiTemperature);
        return config;
    }
}
