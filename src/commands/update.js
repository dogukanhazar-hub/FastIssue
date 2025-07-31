const { Command } = require('commander');
const chalk = require('chalk');
const { createSpinner } = require('nanospinner');
const SecureDatabase = require('../lib/database');
const APIFactory = require('../lib/api-factory');

const updateCommand = new Command('update')
  .alias('u')
  .description('Update an existing issue');

updateCommand
  .option('-c, --config <name>', 'Use saved configuration')
  .option('-o, --owner <owner>', 'Repository owner')
  .option('-r, --repo <repo>', 'Repository name')
  .option('-n, --number <number>', 'Issue number')
  .option('-t, --title <title>', 'Issue title')
  .option('-d, --description <description>', 'Issue description')
  .option('-s, --state <state>', 'Issue state (open|progressing|closed)')
  .option('-l, --labels <labels>', 'Comma-separated labels')
  .option('--platform <platform>', 'Platform (github or gitee)')
  .option('--token <token>', 'API token')
  .action(async (options) => {
    const db = new SecureDatabase();
    let config = null;

    try {

      // If using a saved configuration
      if (options.config) {
        config = db.getRepository(options.config);
        if (!config) {
          console.error(chalk.red(`Configuration '${options.config}' not found.`));
          console.log(chalk.yellow('Use "config list" to see available configurations.'));
          process.exit(1);
        }
      }

      // Validate required parameters
      const owner = options.owner || config?.owner;
      const repo = options.repo || config?.repo;
      const platform = options.platform || config?.platform;
      const token = options.token || config?.token;

      if (!owner || !repo || !options.number || !platform || !token) {
        console.error(chalk.red('Missing required parameters.'));
        console.log(chalk.yellow('Required: --number and either --config or (--owner, --repo, --platform, --token)'));
        process.exit(1);
      }

      // Validate state if provided
      if (options.state && !['open', 'progressing', 'closed'].includes(options.state)) {
        console.error(chalk.red('Invalid state. Use: open, progressing, or closed'));
        process.exit(1);
      }

      const labels = options.labels ? options.labels.split(',').map(l => l.trim()) : [];
      
      const spinner = createSpinner('Updating issue...').start();

      try {
        const api = APIFactory.createAPI(platform, token);
        const issue = await api.updateIssue(
          owner,
          repo,
          options.number,
          options.title,
          options.description,
          options.state,
          labels
        );

        spinner.success({ text: 'Issue updated successfully!' });
        
        console.log(chalk.blue('\nUpdated Issue Details:'));
        console.log(chalk.gray('─'.repeat(40)));
        console.log(`Title: ${issue.title}`);
        console.log(`Number: #${issue.number}`);
        console.log(`State: ${issue.state}`);
        console.log(`URL: ${issue.html_url}`);
        
        if (issue.labels && issue.labels.length > 0) {
          const labelNames = issue.labels.map(label => 
            typeof label === 'string' ? label : label.name
          );
          console.log(`Labels: ${labelNames.join(', ')}`);
        }

      } catch (apiError) {
        spinner.error({ text: 'Failed to update issue' });
        console.error(chalk.red(apiError.message));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    } finally {
      db.close();
    }
  });

module.exports = updateCommand;