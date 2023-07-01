import {execSync} from "child_process";
import {logger} from "../logger";
import chalk from "chalk";

export const checkForUpdate = (version: string) => {
    try {
        const latestVersion = execSync('npm show prwizard version').toString().trim();
        if (latestVersion !== version) {
            logger.info(
                chalk.yellow(`\n${latestVersion} :: New version of prwizard is available. Consider updating!`,),
            );
        }
    } catch (error) {
        logger.error(chalk.red(`\nFailed to check for updates.`));
    }
};