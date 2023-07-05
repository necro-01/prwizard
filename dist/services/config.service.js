"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const chalk_1 = __importDefault(require("chalk"));
const CONFIG_FILENAME = 'prwizard.json';
const DEFAULT_CONFIG = {
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
    constructor(message) {
        super(message);
        this.name = 'ConfigurationError';
    }
}
class ConfigService {
    static getConfigFilePath() {
        // Determine the path to the configuration file based on the environment (.env)
        const configDir = process.env.NODE_ENV === 'development'
            ? process.cwd()
            : path_1.default.join(os_1.default.homedir(), '.prwizard');
        return path_1.default.join(configDir, CONFIG_FILENAME);
    }
    static checkEnvForConfiguration() {
        // Check environment variables for configuration setting and create a configuration object from them
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
        };
        // Clean the environment configuration to remove undefined values and merge it with default config
        const cleanedEnvConfig = JSON.parse(JSON.stringify(envConfig));
        return (0, lodash_merge_1.default)({}, DEFAULT_CONFIG, cleanedEnvConfig);
    }
    static checkConfigFileExists() {
        const configPath = this.getConfigFilePath();
        return fs_1.default.existsSync(configPath);
    }
    static checkFileForConfiguration() {
        let fileConfig = {};
        if (this.checkConfigFileExists()) {
            try {
                // Read and parse the configuration file
                fileConfig = JSON.parse(fs_1.default.readFileSync(this.getConfigFilePath(), 'utf-8'));
            }
            catch (err) {
                throw new ConfigurationError(chalk_1.default.bgRed.whiteBright('Unable to parse the configuration file. Please ensure that the file is a valid JSON.'));
            }
        }
        return (0, lodash_merge_1.default)({}, DEFAULT_CONFIG, fileConfig);
    }
    static validateTemperature(temperature) {
        if (!(temperature >= 0.0 && temperature <= 2.0)) {
            throw new ConfigurationError(chalk_1.default.bgRed.whiteBright('Invalid temperature value. It must be a value between 0 and 2 (inclusive).'));
        }
    }
    static save({ githubToken, openaiApiKey, }) {
        const configPath = this.getConfigFilePath();
        const dir = path_1.default.dirname(configPath);
        if (!fs_1.default.existsSync(dir)) {
            // Create the directory (config file), if it doesn't exist
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const config = this.checkFileForConfiguration();
        config.github.githubSecretToken = githubToken;
        config.llm.openai.openaiSecretApiKey = openaiApiKey;
        // Save the updated configuration to the file
        fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
    static load() {
        // Load the configuration either from the config file or environment variables (.env)
        console.log(this.checkConfigFileExists());
        const config = this.checkConfigFileExists()
            ? this.checkFileForConfiguration()
            : this.checkEnvForConfiguration();
        this.validateTemperature(config.llm.openai.openaiTemperature);
        return config;
    }
}
exports.ConfigService = ConfigService;
