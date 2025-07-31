const { Command } = require('commander');
const chalk = require('chalk');
const { createSpinner } = require('nanospinner');
const SecureDatabase = require('../lib/database');
const APIFactory = require('../lib/api-factory');

const createCommand = new Command('create')
  .alias('cr')
  .description('Create a new issue');

createCommand
  .option('-c, --config <name>', 'Use saved configuration')
  .option('-o, --owner <owner>', 'Repository owner')
  .option('-r, --repo <repo>', 'Repository name')
  .option('-t, --title <title>', 'Issue title')
  .option('-d, --description <description>', 'Issue description')
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

      if (!owner || !repo || !options.title || !platform || !token) {
        console.error(chalk.red('Missing required parameters.'));
        console.log(chalk.yellow('Required: --title and either --config or (--owner, --repo, --platform, --token)'));
        process.exit(1);
      }

      const labels = options.labels ? options.labels.split(',').map(l => l.trim()) : [];
      
      const spinner = createSpinner('Creating issue...').start();

      try {
        const api = APIFactory.createAPI(platform, token);
        const issue = await api.createIssue(
          owner,
          repo,
          options.title,
          options.description || '',
          labels
        );

        spinner.success({ text: 'Issue created successfully!' });
        
        console.log(chalk.blue('\nIssue Details:'));
        console.log(chalk.gray('─'.repeat(40)));
        console.log(`Title: ${issue.title}`);
        console.log(`Number: #${issue.number}`);
        console.log(`State: ${issue.state}`);
        console.log(`URL: ${issue.html_url}`);
        
        if (labels.length > 0) {
          console.log(`Labels: ${labels.join(', ')}`);
        }

      } catch (apiError) {
        spinner.error({ text: 'Failed to create issue' });
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

module.exports = createCommand;