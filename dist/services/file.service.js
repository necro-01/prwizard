"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const fs_1 = __importDefault(require("fs"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const prompts_1 = __importDefault(require("prompts"));
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
const chalk_1 = __importDefault(require("chalk"));
// Custom error class for File-Service specific errors
class FileServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileServiceError';
    }
}
class FileService {
    // Retrieve the content and name of a file within a specified directory
    static async getFileContentAndName(directory, filename) {
        const escapedFilename = (0, escape_string_regexp_1.default)(filename);
        const pattern = `${directory}/**/*${escapedFilename}*`;
        const matches = await (0, fast_glob_1.default)(pattern, { onlyFiles: true });
        if (matches.length === 0) {
            throw new FileServiceError(chalk_1.default.bgRed.whiteBright(`File ${filename} not found in directory ${directory}`));
        }
        let file;
        if (matches.length === 1) {
            file = matches[0];
        }
        else {
            // If multiple files match, prompt the user to select a file
            const response = await (0, prompts_1.default)({
                type: 'autocomplete',
                name: 'file',
                message: 'Multiple files match. Please select a file to review:',
                choices: matches
                    .sort()
                    .map((match) => ({ title: match, value: match })),
                initial: 0,
                suggest: (input, choices) => {
                    const inputValue = input.toLowerCase();
                    const filteredChoices = choices.filter((choice) => choice.title.toLowerCase().includes(inputValue));
                    return Promise.resolve(filteredChoices);
                },
            });
            if (!response.file) {
                throw new FileServiceError(chalk_1.default.bgGray.whiteBright('No file was selected from the prompt'));
            }
            file = response.file;
        }
        const content = fs_1.default.readFileSync(file, 'utf8');
        return { filename: file, content };
    }
    // Prompt the user to select files to commit from a list of GitFileChange object
    static async selectFilesToCommit(fileChanges) {
        const response = await (0, prompts_1.default)({
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
            throw new FileServiceError(chalk_1.default.bgGray.whiteBright('No files were selected from the prompt'));
        }
        return response.files;
    }
    // Add line numbers to each line of content
    static addLineNumbers(content) {
        return content
            .split('\n')
            .map((line, index) => `${index + 1} | ${line}`)
            .join('\n');
    }
    // Colorize the filename based on its status
    static colorizeFiles(fileChange) {
        switch (fileChange.status) {
            case 'added':
                return chalk_1.default.green(fileChange.filename);
            case 'deleted':
                return chalk_1.default.red(fileChange.filename);
            case 'changed':
                return chalk_1.default.cyan(fileChange.filename);
        }
    }
}
exports.FileService = FileService;
