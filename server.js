const environment = require('./services/environment');

const chalk = require('chalk');
const log = require('loglevel');
const prefix = require('loglevel-plugin-prefix');

// setup logging configuration before we begin:
const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};
prefix.reg(log);
log.setLevel(environment.logLevel);
log.enableAll();
prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)} ${chalk.green(
      `${name}:`
    )}`;
  },
});

const { initialize } = require('./services/database');
initialize();

const app = require('./app')();
app.listen(environment.port, () =>
  log.info(
    `Advisor API has started with the following configuration:\n${JSON.stringify(
      environment,
      null,
      2
    )}`
  )
);
