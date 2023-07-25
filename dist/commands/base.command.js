"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
const ora_1 = __importDefault(require("ora"));
const logger_1 = require("../logger");
const chalk_1 = __importDefault(require("chalk"));
class BaseCommand {
    constructor(config) {
        this.config = config;
        this.spinner = (0, ora_1.default)();
    }
    // Wrapper function for _run(), which will be implemented by .command.ts classes. Run() will be called by commands in main.ts
    async run(args) {
        try {
            await this._run(args);
        }
        catch (error) {
            this.spinner.stop();
            logger_1.logger.error(chalk_1.default.bgRed(error.message));
            process.exit(1);
        }
    }
}
exports.BaseCommand = BaseCommand;
