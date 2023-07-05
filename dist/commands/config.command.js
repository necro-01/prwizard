"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigCommand = void 0;
const prompts_1 = __importDefault(require("prompts"));
const config_service_1 = require("../services/config.service");
const base_command_1 = require("./base.command");
const chalk_1 = __importDefault(require("chalk"));
// Custom error class for ConfigCommand-specific errors
class ConfigCommandError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigCommandError';
    }
}
// Command class for handling configuration setup
class ConfigCommand extends base_command_1.BaseCommand {
    constructor(config) {
        super(config);
    }
    async _run() {
        // Prompt the user for GitHub token and OpenAI API key
        const response = await (0, prompts_1.default)([
            {
                type: 'password',
                name: 'githubToken',
                message: 'Please enter your GitHub token:',
                validate: (input) => {
                    if (input.length === 0) {
                        return chalk_1.default.bgRed.whiteBright('GitHub token cannot be empty!');
                    }
                    return true;
                },
            },
            {
                type: 'password',
                name: 'openApiKey',
                message: 'Please enter your OpenAI API key:',
                validate: (input) => {
                    if (input.length === 0) {
                        return chalk_1.default.bgRed.whiteBright('OpenAI API key cannot be empty!');
                    }
                    return true;
                },
            },
        ], {
            onCancel: () => {
                // Throw a specific error when the user cancels the setup
                throw new ConfigCommandError(chalk_1.default.bgGray.whiteBright('Setup was cancelled by the user'));
            },
        });
        // Save the configuration data using the ConfigService
        await config_service_1.ConfigService.save({
            githubToken: response.githubToken,
            openaiApiKey: response.openApiKey,
        });
    }
}
exports.ConfigCommand = ConfigCommand;
