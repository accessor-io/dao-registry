#!/usr/bin/env node

/**
 * DAO Registry CLI - Admin Management Terminal
 * 
 *   CLI for managing the DAO Registry system
 * Features: Governance, Analytics, Contracts, Services, Monitoring
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');
const ora = require('ora');
const Table = require('cli-table3');

// Import CLI modules
const MetadataCLI = require('./modules/metadata');
const DAOCLI = require('./modules/dao');

class DAORegistryCLI {
  constructor() {
    this.program = new Command();
    this.setupCLI();
  }

  setupCLI() {
    // Display banner
    this.displayBanner();

    // Setup main program
    this.program
      .name('dao-registry')
      .description('DAO Registry Admin Management CLI')
      .version('1.0.0');

    // Add commands
    this.setupCommands();

    // Add interactive mode
    this.program
      .command('interactive')
      .alias('i')
      .description('Launch interactive admin terminal')
      .action(() => this.startInteractiveMode());
  }

  displayBanner() {
    const banner = figlet.textSync('DAO Registry', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });

    const boxedBanner = boxen(banner, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    });

    console.log(boxedBanner);
    console.log(chalk.cyan.bold('Admin Management Terminal v1.0.0\n'));
  }

  setupCommands() {
    // Metadata commands
    this.program
      .command('metadata')
      .description('Manage metadata services (reserved subdomains, encoding, ENS)')
      .option('-l, --list', 'List all reserved subdomains')
      .option('-c, --check <subdomain>', 'Check subdomain availability')
      .option('-v, --validate <subdomain>', 'Validate subdomain format')
      .option('-e, --encode <input>', 'Encode text as subdomain')
      .option('-r, --resolve <domain>', 'Resolve ENS domain')
      .action((options) => {
        const metadataCLI = new MetadataCLI();
        metadataCLI.handleCommand(options);
      });

    // DAO commands
    this.program
      .command('dao')
      .description('Manage DAO registry operations')
      .option('-l, --list', 'List all DAOs')
      .option('-g, --get <id>', 'Get DAO details')
      .option('-c, --create', 'Create new DAO')
      .option('-u, --update <id>', 'Update DAO')
      .option('-d, --delete <id>', 'Delete DAO')
      .action((options) => {
        const daoCLI = new DAOCLI();
        daoCLI.handleCommand(options);
      });
  }

  async startInteractiveMode() {
    console.log(chalk.cyan.bold('\n=== DAO Registry Interactive Admin Terminal ===\n'));

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Select an action:',
          choices: [
            { name: 'Metadata Management', value: 'metadata' },
            { name: 'DAO Management', value: 'dao' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);

      if (action === 'exit') {
        console.log(chalk.green('Goodbye!'));
        process.exit(0);
      }

      await this.handleInteractiveAction(action);
    }
  }

  async handleInteractiveAction(action) {
    const spinner = ora('Processing...').start();

    try {
      switch (action) {
        case 'metadata':
          spinner.text = 'Loading metadata module...';
          const metadataCLI = new MetadataCLI();
          await metadataCLI.startInteractive();
          break;

        case 'dao':
          spinner.text = 'Loading DAO module...';
          const daoCLI = new DAOCLI();
          await daoCLI.startInteractive();
          break;
      }

      spinner.succeed('Action completed successfully');
    } catch (error) {
      spinner.fail('Action failed');
      console.error(chalk.red('Error:'), error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }

  run() {
    this.program.parse(process.argv);
  }
}

// Run CLI
const cli = new DAORegistryCLI();
cli.run(); 