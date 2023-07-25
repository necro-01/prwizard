import fs from 'fs';

import fg from 'fast-glob';
import prompts from 'prompts';
import escapeStringRegexp from 'escape-string-regexp';
import chalk from 'chalk';

import { GetFileResponse, GitFileChange } from '../interfaces';

// Custom error class for File-Service specific errors
class FileServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FileServiceError';
    }
}

export class FileService {
    // Retrieve the content and name of a file within a specified directory
    public static async getFileContentAndName(
        directory: string,
        filename: string,
    ): Promise<GetFileResponse> {
        const escapedFilename = escapeStringRegexp(filename);
        const pattern = `${directory}/**/*${escapedFilename}*`;
        const matches = await fg(pattern, { onlyFiles: true });

        if (matches.length === 0) {
            throw new FileServiceError(
                chalk.bgRed.whiteBright(`File ${filename} not found in directory ${directory}`),
            );
        }

        let file: string;

        if (matches.length === 1) {
            file = matches[0];
        } else {
            // If multiple files match, prompt the user to select a file
            const response = await prompts({
                type: 'autocomplete',
                name: 'file',
                message: 'Multiple files match. Please select a file to review:',
                choices: matches
                    .sort()
                    .map((match) => ({ title: match, value: match })),
                initial: 0,
                suggest: (input, choices) => {
                    const inputValue = input.toLowerCase();
                    const filteredChoices = choices.filter((choice) =>
                        choice.title.toLowerCase().includes(inputValue),
                    );
                    return Promise.resolve(filteredChoices);
                },
            });

            if (!response.file) {
                throw new FileServiceError(
                    chalk.bgGray.whiteBright('No file was selected from the prompt'),
                );
            }

            file = response.file;
        }

        const content = fs.readFileSync(file, 'utf8');
        return { filename: file, content };
    }

    // Prompt the user to select files to commit from a list of GitFileChange object
    public static async selectFilesToCommit(
        fileChanges: GitFileChange[],
    ): Promise<GitFileChange[]> {
        if(fileChanges.length === 0){
            throw new FileServiceError(
                chalk.bgRed.whiteBright(`No changes detected in any file.`),
            );
        }

        const response = await prompts({
            type: 'multiselect',
            name: 'files',
            message: 'Select files to commit:',
            choices: fileChanges
                .sort((a, b) => a.filename.localeCompare(b.filename))
                .map((fileChange) => ({
                    title: this.colorizeFiles(fileChange),
                    value: fileChange,
                })),
            initial: 0,
            min: 1,
            max: fileChanges.length,
        });

        if (!response.files) {
            throw new FileServiceError(
                chalk.bgGray.whiteBright('No files were selected from the prompt'),
            );
        }

        return response.files;
    }

    // Add line numbers to each line of content
    public static addLineNumbers(content: string): string {
        return content
            .split('\n')
            .map((line, index) => `${index + 1} | ${line}`)
            .join('\n');
    }

    // Colorize the filename based on its status
    private static colorizeFiles(fileChange: GitFileChange): string {
        switch (fileChange.status) {
            case 'added':
                return chalk.green(fileChange.filename);
            case 'deleted':
                return chalk.red(fileChange.filename);
            case 'changed':
                return chalk.cyan(fileChange.filename);
        }
    }
}
