#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { version } = require('../package.json');

// Import commands
const createCommand = require('./commands/create');
const updateCommand = require('./commands/update');
const listCommand = require('./commands/list');
const configCommand = require('./commands/config');

const program = new Command();

program
  .name('issue-creator')
  .description('CLI tool for managing issues across GitHub and Gitee')
  .version(version);

// Add commands
program.addCommand(createCommand);
program.addCommand(updateCommand);
program.addCommand(listCommand);
program.addCommand(configCommand);

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Parse arguments
program.parse();