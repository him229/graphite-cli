#!/usr/bin/env node
import chalk from 'chalk';
import tmp from 'tmp';
import yargs from 'yargs';
import {
  globalArgumentsOptions,
  processGlobalArgumentsMiddleware,
} from './lib/global-arguments';
import { passthrough } from './lib/passthrough';
import { refreshPRInfoInBackground } from './lib/requests';
import {
  fetchUpgradePromptInBackground,
  postTelemetryInBackground,
} from './lib/telemetry';
import { postSurveyResponsesInBackground } from './lib/telemetry/survey/post_survey';
import {
  logError,
  preprocessCommand,
  signpostDeprecatedCommands,
} from './lib/utils';

fetchUpgradePromptInBackground();
refreshPRInfoInBackground();

// We try to post the survey response right after the user takes it, but in
// case they quit early or there's some error, we'll continue to try to post
// it in the future until it succeeds.
postSurveyResponsesInBackground();

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

process.on('uncaughtException', (err) => {
  postTelemetryInBackground({
    canonicalCommandName: 'unknown',
    commandName: 'unknown',
    durationMiliSeconds: 0,
    err: {
      errName: err.name,
      errMessage: err.message,
      errStack: err.stack || '',
    },
  });
  logError(err.message);
  // eslint-disable-next-line no-restricted-syntax
  process.exit(1);
});

function deprecatedGpWarning(argv: yargs.Arguments) {
  if (argv['$0'].endsWith('gp')) {
    console.log(
      chalk.red(
        `Warning: Based on feedback, we've update the Graphite CLI alias to "gt". The alias "gp" has been deprecated.`
      )
    );
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
}

signpostDeprecatedCommands(process.argv[2]);
passthrough(process.argv);
preprocessCommand();
yargs(process.argv.slice(2))
  .commandDir('commands')
  .help()
  .middleware(deprecatedGpWarning)
  .usage(
    [
      'Graphite is a command line tool that makes working with stacked changes fast & intuitive.',
    ].join('\n')
  )
  .options(globalArgumentsOptions)
  .middleware(processGlobalArgumentsMiddleware)
  .strict()
  .demandCommand().argv;
