"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const chalk_1 = __importDefault(require("chalk"));
exports.logger = (0, winston_1.createLogger)({
    level: 'info',
    transports: [
        new winston_1.transports.Console({
            level: 'info',
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf((info) => {
                return chalk_1.default.whiteBright(`${info.message}`);
            })),
        }),
    ],
});
