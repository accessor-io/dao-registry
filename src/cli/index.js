#!/usr/bin/env node

/**
 * DAO Registry CLI - Admin Management Terminal
 * 
 * Comprehensive CLI for managing the DAO Registry system
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
const GovernanceCLI = require('./modules/governance');
const AnalyticsCLI = require('./modules/analytics');
const ContractCLI = require('./modules/contracts');
const ServiceCLI = require('./modules/services');
const MonitorCLI = require('./modules/monitoring');
const SystemCLI = require('./modules/system');

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
    // Governance commands
    this.program
      .command('governance')
      .alias('gov')
      .description('Manage DAO governance operations')
      .option('-l, --list', 'List all governance proposals')
      .option('-c, --create <proposal>', 'Create new governance proposal')
      .option('-v, --vote <id> <choice>', 'Vote on proposal')
      .option('-s, --status <id>', 'Check proposal status')
      .action((options) => {
        const governanceCLI = new GovernanceCLI();
        governanceCLI.handleCommand(options);
      });

    // Analytics commands
    this.program
      .command('analytics')
      .alias('analytics')
      .description('Access research-driven analytics')
      .option('-p, --patterns', 'Analyze governance patterns')
      .option('-h, --health', 'Calculate governance health score')
      .option('-r, --reports', 'Generate analytics reports')
      .option('-d, --dashboard', 'Launch analytics dashboard')
      .action((options) => {
        const analyticsCLI = new AnalyticsCLI();
        analyticsCLI.handleCommand(options);
      });

    // Contract commands
    this.program
      .command('contracts')
      .alias('contracts')
      .description('Manage smart contracts')
      .option('-d, --deploy', 'Deploy contracts')
      .option('-u, --upgrade', 'Upgrade contracts')
      .option('-v, --verify', 'Verify contracts on Etherscan')
      .option('-s, --status', 'Check contract status')
      .action((options) => {
        const contractCLI = new ContractCLI();
        contractCLI.handleCommand(options);
      });

    // Service commands
    this.program
      .command('services')
      .alias('services')
      .description('Manage registry services')
      .option('-s, --start', 'Start all services')
      .option('-t, --stop', 'Stop all services')
      .option('-r, --restart', 'Restart all services')
      .option('-l, --logs', 'View service logs')
      .action((options) => {
        const serviceCLI = new ServiceCLI();
        serviceCLI.handleCommand(options);
      });

    // Monitoring commands
    this.program
      .command('monitor')
      .alias('monitor')
      .description('System monitoring and alerts')
      .option('-s, --status', 'System status')
      .option('-a, --alerts', 'View alerts')
      .option('-m, --metrics', 'System metrics')
      .option('-l, --logs', 'System logs')
      .action((options) => {
        const monitorCLI = new MonitorCLI();
        monitorCLI.handleCommand(options);
      });

    // System commands
    this.program
      .command('system')
      .alias('sys')
      .description('System administration')
      .option('-b, --backup', 'Create system backup')
      .option('-r, --restore', 'Restore from backup')
      .option('-u, --update', 'Update system')
      .option('-c, --config', 'Manage configuration')
      .action((options) => {
        const systemCLI = new SystemCLI();
        systemCLI.handleCommand(options);
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
            { name: 'Governance Management', value: 'governance' },
{ name: 'Analytics & Research', value: 'analytics' },
{ name: 'Smart Contracts', value: 'contracts' },
{ name: 'Services Management', value: 'services' },
{ name: 'System Monitoring', value: 'monitor' },
{ name: 'System Administration', value: 'system' },
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
        case 'governance':
          spinner.text = 'Loading governance module...';
          const governanceCLI = new GovernanceCLI();
          await governanceCLI.startInteractive();
          break;

        case 'analytics':
          spinner.text = 'Loading analytics module...';
          const analyticsCLI = new AnalyticsCLI();
          await analyticsCLI.startInteractive();
          break;

        case 'contracts':
          spinner.text = 'Loading contracts module...';
          const contractCLI = new ContractCLI();
          await contractCLI.startInteractive();
          break;

        case 'services':
          spinner.text = 'Loading services module...';
          const serviceCLI = new ServiceCLI();
          await serviceCLI.startInteractive();
          break;

        case 'monitor':
          spinner.text = 'Loading monitoring module...';
          const monitorCLI = new MonitorCLI();
          await monitorCLI.startInteractive();
          break;

        case 'system':
          spinner.text = 'Loading system module...';
          const systemCLI = new SystemCLI();
          await systemCLI.startInteractive();
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