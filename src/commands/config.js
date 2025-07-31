const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const SecureDatabase = require('../lib/database');

const configCommand = new Command('config')
  .alias('c')
  .description('Manage repository configurations');

configCommand
  .command('add')
  .alias('a')
  .description('Add a new repository configuration')
  .option('-n, --name <name>', 'Configuration name')
  .option('-p, --platform <platform>', 'Platform (github or gitee)')
  .option('-o, --owner <owner>', 'Repository owner')
  .option('-r, --repo <repo>', 'Repository name')
  .option('-t, --token <token>', 'API token')
  .action(async (options) => {
    const db = new SecureDatabase();
    
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Configuration name:',
          when: !options.name,
          validate: (input) => input.trim() !== '' || 'Name is required'
        },
        {
          type: 'list',
          name: 'platform',
          message: 'Select platform:',
          choices: ['github', 'gitee'],
          when: !options.platform
        },
        {
          type: 'input',
          name: 'owner',
          message: 'Repository owner:',
          when: !options.owner,
          validate: (input) => input.trim() !== '' || 'Owner is required'
        },
        {
          type: 'input',
          name: 'repo',
          message: 'Repository name:',
          when: !options.repo,
          validate: (input) => input.trim() !== '' || 'Repository name is required'
        },
        {
          type: 'password',
          name: 'token',
          message: 'API token:',
          when: !options.token,
          validate: (input) => input.trim() !== '' || 'Token is required'
        }
      ]);

      const config = {
        name: options.name || answers.name,
        platform: options.platform || answers.platform,
        owner: options.owner || answers.owner,
        repo: options.repo || answers.repo,
        token: options.token || answers.token
      };

      await db.saveRepository(config.name, config.platform, config.owner, config.repo, config.token);
      db.saveRepository(config.name, config.platform, config.owner, config.repo, config.token);
      console.log(chalk.green(`✓ Configuration '${config.name}' saved successfully!`));
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    } finally {
      db.close();
    }
  });

configCommand
  .command('list')
  .alias('l')
  .description('List all repository configurations')
  .action(async () => {
    const db = new SecureDatabase();
    
    try {
      const repositories = db.getAllRepositories();
      
      if (repositories.length === 0) {
        console.log(chalk.yellow('No configurations found. Use "config add" to add one.'));
        return;
      }

      console.log(chalk.blue('\nSaved Configurations:'));
      console.log(chalk.gray('─'.repeat(60)));
      
      repositories.forEach((repo) => {
        console.log(chalk.cyan(`Name: ${repo.name}`));
        console.log(`  Platform: ${repo.platform}`);
        console.log(`  Repository: ${repo.owner}/${repo.repo}`);
        console.log(`  Created: ${new Date(repo.created_at).toLocaleDateString()}`);
        console.log('');
      });
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    } finally {
      db.close();
    }
  });

configCommand
  .command('remove')
  .alias('r')
  .description('Remove a repository configuration')
  .argument('<name>', 'Configuration name to remove')
  .action(async (name) => {
    const db = new SecureDatabase();
    
    try {
      const deleted = db.deleteRepository(name);
      
      if (deleted > 0) {
        console.log(chalk.green(`✓ Configuration '${name}' removed successfully!`));
      } else {
        console.log(chalk.yellow(`Configuration '${name}' not found.`));
      }
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    } finally {
      db.close();
    }
  });

module.exports = configCommand;