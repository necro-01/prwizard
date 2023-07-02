import prompts from 'prompts';

import { CommandConfig } from '../interfaces';
import { ConfigService } from '../services/config.service';

import { BaseCommand } from './base.command';
import chalk from "chalk";

// Custom error class for ConfigCommand-specific errors
class ConfigCommandError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConfigCommandError';
    }
}

// Command class for handling configuration setup
export class ConfigCommand extends BaseCommand<void> {
    constructor(config: CommandConfig) {
        super(config);
    }

    protected async _run(): Promise<void> {
        // Prompt the user for GitHub token and OpenAI API key
        const response = await prompts(
            [
                {
                    type: 'password',
                    name: 'githubToken',
                    message: 'Please enter your GitHub token:',
                    validate: (input: string) => {
                        if (input.length === 0) {
                            return chalk.bgRed.whiteBright('GitHub token cannot be empty!');
                        }
                        return true;
                    },
                },
                {
                    type: 'password',
                    name: 'openApiKey',
                    message: 'Please enter your OpenAI API key:',
                    validate: (input: string) => {
                        if (input.length === 0) {
                            return chalk.bgRed.whiteBright('OpenAI API key cannot be empty!');
                        }
                        return true;
                    },
                },
            ],
            {
                onCancel: () => {
                    // Throw a specific error when the user cancels the setup
                    throw new ConfigCommandError(chalk.bgGray.whiteBright('Setup was cancelled by the user'));
                },
            },
        );

        // Save the configuration data using the ConfigService
        await ConfigService.save({
            githubToken: response.githubToken,
            openaiApiKey: response.openApiKey,
        });
    }
}