"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForUpdate = void 0;
const child_process_1 = require("child_process");
const logger_1 = require("../logger");
const chalk_1 = __importDefault(require("chalk"));
const checkForUpdate = (version) => {
    try {
        const latestVersion = (0, child_process_1.execSync)('npm show prwizard version').toString().trim();
        if (latestVersion !== version) {
            logger_1.logger.info(chalk_1.default.yellowBright(`\n${latestVersion} -> New version of prwizard is available. Consider updating!`));
        }
    }
    catch (error) {
        logger_1.logger.error(chalk_1.default.bgRed.whiteBright(`\nFailed to check for updates.`));
    }
};
exports.checkForUpdate = checkForUpdate;
