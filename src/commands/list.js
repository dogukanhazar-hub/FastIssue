const { Command } = require('commander');
const chalk = require('chalk');
const { createSpinner } = require('nanospinner');
const SecureDatabase = require('../lib/database');
const APIFactory = require('../lib/api-factory');

const listCommand = new Command('list')
  .alias('l')
  .description('List issues in a repository');

listCommand
  .option('-c, --config <name>', 'Use saved configuration')
  .option('-o, --owner <owner>', 'Repository owner')
  .option('-r, --repo <repo>', 'Repository name')
  .option('-s, --state <state>', 'Filter by state (open|closed|all)', 'open')
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

      if (!owner || !repo || !platform || !token) {
        console.error(chalk.red('Missing required parameters.'));
        console.log(chalk.yellow('Required: either --config or (--owner, --repo, --platform, --token)'));
        process.exit(1);
      }

      const spinner = createSpinner('Fetching issues...').start();

      try {
        const api = APIFactory.createAPI(platform, token);
        const issues = await api.listIssues(owner, repo, options.state);

        spinner.success({ text: `Found ${issues.length} issue(s)` });
        
        if (issues.length === 0) {
          console.log(chalk.yellow(`No ${options.state} issues found.`));
          return;
        }

        console.log(chalk.blue(`\nIssues in ${owner}/${repo} (${options.state}):`));
        console.log(chalk.gray('─'.repeat(80)));
        
        issues.forEach((issue) => {
          const stateColor = issue.state === 'open' ? 'green' : 
                           issue.state === 'closed' ? 'red' : 'yellow';
          
          console.log(`${chalk.cyan(`#${issue.number}`)} ${issue.title}`);
          console.log(`  State: ${chalk[stateColor](issue.state.toUpperCase())}`);
          console.log(`  Created: ${new Date(issue.created_at).toLocaleDateString()}`);
          
          if (issue.labels && issue.labels.length > 0) {
            const labelNames = issue.labels.map(label => 
              typeof label === 'string' ? label : label.name
            );
            console.log(`  Labels: ${chalk.magenta(labelNames.join(', '))}`);
          }
          
          console.log(`  URL: ${chalk.blue(issue.html_url)}`);
          console.log('');
        });

      } catch (apiError) {
        spinner.error({ text: 'Failed to fetch issues' });
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

module.exports = listCommand;