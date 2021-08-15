#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const tmp_1 = __importDefault(require("tmp"));
const yargs_1 = __importDefault(require("yargs"));
const global_arguments_1 = require("./lib/global-arguments");
const telemetry_1 = require("./lib/telemetry");
const utils_1 = require("./lib/utils");
telemetry_1.fetchUpgradePromptInBackground();
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp_1.default.setGracefulCleanup();
process.on("uncaughtException", (err) => {
    telemetry_1.postTelemetryInBackground({
        commandName: "unknown",
        durationMiliSeconds: 0,
        err: {
            errName: err.name,
            errMessage: err.message,
            errStack: err.stack || "",
        },
    });
    utils_1.logError(err.message);
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
});
function deprecatedGpWarning(argv) {
    if (argv["$0"].endsWith("gp")) {
        console.log(chalk_1.default.yellow(`Warning: Based on feedback, we've update the Graphite CLI alias to "gt". The alias "gp" has been deprecated.`));
    }
}
yargs_1.default
    .commandDir("commands")
    .help()
    .middleware(deprecatedGpWarning)
    .usage([
    "Graphite is a command line tool that makes working with stacked changes fast & intuitive.",
].join("\n"))
    .options(global_arguments_1.globalArgumentsOptions)
    .middleware(global_arguments_1.processGlobalArgumentsMiddleware)
    .strict()
    .demandCommand().argv;
//# sourceMappingURL=index.js.map