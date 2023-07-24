import ora from 'ora';

import { CommandConfig } from '../interfaces';
import { logger } from '../logger';
import chalk from "chalk";

export abstract class BaseCommand<T> {
    protected config: CommandConfig;
    protected spinner: ora.Ora;

    protected constructor(config: CommandConfig) {
        this.config = config;
        this.spinner = ora();
    }

    protected abstract _run(args?: T): Promise<void>;

    // Wrapper function for _run(), which will be implemented by .command.ts classes. Run() will be called by commands in main.ts
    public async run(args?: T): Promise<void> {
        try {
            await this._run(args);
        } catch (error: any) {
            this.spinner.stop();
            logger.error(chalk.bgRed(error.message));
            process.exit(1);
        }
    }
}
