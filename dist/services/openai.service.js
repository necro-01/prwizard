"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiService = exports.OpenAiServiceError = void 0;
const openai_1 = require("openai");
const prompt_service_1 = require("./prompt.service");
const chalk_1 = __importDefault(require("chalk"));
// Custom error class for OpenAI service specific errors
class OpenAiServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OpenAiServiceError';
    }
}
exports.OpenAiServiceError = OpenAiServiceError;
class OpenAiService {
    // Call the OpenAI API with the provided configuration and messages
    static async callOpenAI(config, messages) {
        const openAIConfiguration = new openai_1.Configuration({
            apiKey: config.openaiSecretApiKey,
        });
        const chatCompletionRequest = {
            model: config.openaiModel,
            temperature: config.openaiTemperature,
            messages: messages,
        };
        const openaiClient = new openai_1.OpenAIApi(openAIConfiguration);
        let result;
        try {
            // Call the OpenAI API to get a chat completion response
            result = await openaiClient.createChatCompletion(chatCompletionRequest);
        }
        catch (error) {
            throw new OpenAiServiceError(chalk_1.default.bgRed.whiteBright(`Failed to call OpenAI API: ${error.message}`));
        }
        // Extract the assistant message from the API response
        const assistantMessage = result.data?.choices?.[0]?.message?.content;
        if (!assistantMessage) {
            throw new OpenAiServiceError(chalk_1.default.bgGray.whiteBright('OpenAI did not return a response'));
        }
        return assistantMessage;
    }
    // Generate a review of a Git diff using OpenAI
    static async generateDiffReview(config, details) {
        const prompt = prompt_service_1.PromptService.generateDiffReviewPrompt(details);
        const messages = [
            {
                role: 'system',
                content: prompt.system,
            },
            {
                role: 'user',
                content: prompt.user,
            },
        ];
        return await this.callOpenAI(config, messages);
    }
    // Generate a review of a file using OpenAI
    static async generateFileReview(config, fileContent, filename) {
        const prompt = prompt_service_1.PromptService.generateFileReviewPrompt(fileContent, filename);
        const messages = [
            {
                role: 'user',
                content: prompt.system,
            },
            {
                role: 'user',
                content: prompt.user,
            },
        ];
        return await this.callOpenAI(config, messages);
    }
    // Generate a commit message using OpenAI
    static async generateCommitMessage(config, details, commitHistory) {
        const prompt = prompt_service_1.PromptService.generateCommitMessagePrompt(details, commitHistory);
        const messages = [
            {
                role: 'system',
                content: prompt.system,
            },
            {
                role: 'user',
                content: prompt.user,
            },
        ];
        return await this.callOpenAI(config, messages);
    }
}
exports.OpenAiService = OpenAiService;
