import chalk from "chalk";

export function logError(msg: string): void {
  console.log(chalk.redBright(`ERROR: ${msg}`));
}

export function logErrorAndExit(msg: string): void {
  logError(msg);
  process.exit(1);
}

export function logWarn(msg: string): void {
  console.log(chalk.yellow(`WARNING: ${msg}`));
}

export function logInfo(msg: string): void {
  console.log(chalk.blueBright(`${msg}`));
}

export function logSuccess(msg: string): void {
  console.log(chalk.green(`${msg}`));
}
