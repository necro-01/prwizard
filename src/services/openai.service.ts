import {
    ChatCompletionRequestMessage,
    Configuration,
    CreateChatCompletionRequest,
    OpenAIApi,
} from 'openai';

import { GitDiff, OpenAIConfig } from '../interfaces';

import { PromptService } from './prompt.service';
import chalk from "chalk";

// Custom error class for OpenAI service specific errors
export class OpenAiServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OpenAiServiceError';
    }
}

export class OpenAiService {
    // Call the OpenAI API with the provided configuration and messages
    public static async callOpenAI(
        config: OpenAIConfig,
        messages: ChatCompletionRequestMessage[],
    ): Promise<string> {
        const openAIConfiguration = new Configuration({
            apiKey: config.openaiSecretApiKey,
        });

        const chatCompletionRequest: CreateChatCompletionRequest = {
            model: config.openaiModel,
            temperature: config.openaiTemperature,
            messages: messages,
        };

        const openaiClient = new OpenAIApi(openAIConfiguration);

        let result;
        try {
            // Call the OpenAI API to get a chat completion response
            result = await openaiClient.createChatCompletion(chatCompletionRequest);
        } catch (error: any) {
            throw new OpenAiServiceError(
                chalk.bgRed.whiteBright(`Failed to call OpenAI API: ${error.message}`),
            );
        }

        // Extract the assistant message from the API response
        const assistantMessage = result.data?.choices?.[0]?.message?.content;

        if (!assistantMessage) {
            throw new OpenAiServiceError(
                chalk.bgGray.whiteBright('OpenAI did not return a response'),
            );
        }

        return assistantMessage;
    }

    // Generate a review of a Git diff using OpenAI
    public static async generateDiffReview(
        config: OpenAIConfig,
        details: GitDiff,
    ): Promise<string> {
        const prompt = PromptService.generateDiffReviewPrompt(details);
        const messages: ChatCompletionRequestMessage[] = [
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
    public static async generateFileReview(
        config: OpenAIConfig,
        fileContent: string,
        filename: string,
    ): Promise<string> {
        const prompt = PromptService.generateFileReviewPrompt(
            fileContent,
            filename,
        );
        const messages: ChatCompletionRequestMessage[] = [
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
    public static async generateCommitMessage(
        config: OpenAIConfig,
        details: GitDiff,
        commitHistory: string[],
    ): Promise<string> {
        const prompt = PromptService.generateCommitMessagePrompt(
            details,
            commitHistory,
        );
        const messages: ChatCompletionRequestMessage[] = [
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
