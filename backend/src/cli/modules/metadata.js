#!/usr/bin/env node

/**
 * Metadata CLI Module
 * Manages reserved subdomains, URL encoding, ENS resolution, and ISO metadata
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');

// Import organized metadata services
const { 
  ReservedSubdomainsService, 
  URLEncodingService, 
  ENSResolverService 
} = require('../../services/metadata');

class MetadataCLI {
  constructor() {
    this.reservedService = new ReservedSubdomainsService();
    this.encodingService = new URLEncodingService();
    this.ensService = new ENSResolverService();
  }

  async handleCommand(options) {
    if (options.list) {
      await this.listReservedSubdomains();
    } else if (options.check) {
      await this.checkSubdomain(options.check);
    } else if (options.validate) {
      await this.validateSubdomain(options.validate);
    } else if (options.encode) {
      await this.encodeSubdomain(options.encode);
    } else if (options.ens) {
      await this.resolveENS(options.ens);
    } else {
      await this.startInteractive();
    }
  }

  async startInteractive() {
    console.log(chalk.cyan.bold('\n=== Metadata Management ===\n'));

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Select metadata action:',
          choices: [
            { name: 'List Reserved Subdomains', value: 'list' },
            { name: 'Check Subdomain Availability', value: 'check' },
            { name: 'Validate Subdomain', value: 'validate' },
            { name: 'Encode Subdomain', value: 'encode' },
            { name: 'Resolve ENS Domain', value: 'ens' },
            { name: 'Subdomain Analytics', value: 'analytics' },
            { name: 'Back to Main Menu', value: 'back' }
          ]
        }
      ]);

      if (action === 'back') break;

      await this.handleMetadataAction(action);
    }
  }

  async handleMetadataAction(action) {
    const spinner = ora('Processing...').start();

    try {
      switch (action) {
        case 'list':
          await this.listReservedSubdomains();
          break;
        case 'check':
          await this.interactiveCheckSubdomain();
          break;
        case 'validate':
          await this.interactiveValidateSubdomain();
          break;
        case 'encode':
          await this.interactiveEncodeSubdomain();
          break;
        case 'ens':
          await this.interactiveResolveENS();
          break;
        case 'analytics':
          await this.showAnalytics();
          break;
      }
      spinner.succeed('Action completed');
    } catch (error) {
      spinner.fail('Action failed');
      console.error(chalk.red('Error:'), error.message);
    }
  }

  async listReservedSubdomains() {
    console.log(chalk.cyan.bold('\n=== Reserved Subdomains ===\n'));

    const subdomains = this.reservedService.getAllReservedSubdomains();
    
    const table = new Table({
      head: ['Subdomain', 'Priority', 'Category', 'Description', 'Restrictions'],
      colWidths: [15, 10, 15, 30, 20]
    });

    subdomains.forEach(subdomain => {
      table.push([
        subdomain.subdomain,
        subdomain.priority,
        subdomain.category,
        subdomain.description,
        subdomain.restrictions.join(', ')
      ]);
    });

    console.log(table.toString());
    console.log(chalk.green(`\nTotal: ${subdomains.length} reserved subdomains`));
  }

  async interactiveCheckSubdomain() {
    const { subdomain } = await inquirer.prompt([
      {
        type: 'input',
        name: 'subdomain',
        message: 'Enter subdomain to check:',
        validate: input => input.length > 0 ? true : 'Subdomain is required'
      }
    ]);

    await this.checkSubdomain(subdomain);
  }

  async checkSubdomain(subdomain) {
    console.log(chalk.cyan.bold(`\n=== Checking Subdomain: ${subdomain} ===\n`));

    const result = this.reservedService.checkSubdomain(subdomain);
    
    console.log(chalk.white('Subdomain:'), chalk.yellow(subdomain));
    console.log(chalk.white('Reserved:'), result.isReserved ? chalk.red('YES') : chalk.green('NO'));
    
    if (result.isReserved) {
      console.log(chalk.white('Priority:'), chalk.yellow(result.details.priority));
      console.log(chalk.white('Category:'), chalk.yellow(result.details.category));
      console.log(chalk.white('Description:'), chalk.yellow(result.details.description));
      console.log(chalk.white('Restrictions:'), chalk.red(result.details.restrictions.join(', ')));
    } else {
      console.log(chalk.green('✓ Available for registration'));
    }
  }

  async interactiveValidateSubdomain() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'subdomain',
        message: 'Enter subdomain to validate:',
        validate: input => input.length > 0 ? true : 'Subdomain is required'
      },
      {
        type: 'input',
        name: 'parentDomain',
        message: 'Enter parent domain (e.g., dao.eth):',
        default: 'dao.eth'
      }
    ]);

    await this.validateSubdomain(answers.subdomain, answers.parentDomain);
  }

  async validateSubdomain(subdomain, parentDomain) {
    console.log(chalk.cyan.bold(`\n=== Validating Subdomain: ${subdomain}.${parentDomain} ===\n`));

    const validation = this.reservedService.validateSubdomain(subdomain, parentDomain);
    
    console.log(chalk.white('Subdomain:'), chalk.yellow(subdomain));
    console.log(chalk.white('Parent Domain:'), chalk.yellow(parentDomain));
    console.log(chalk.white('Full Domain:'), chalk.yellow(`${subdomain}.${parentDomain}`));
    console.log(chalk.white('Valid:'), validation.isValid ? chalk.green('YES') : chalk.red('NO'));
    
    if (!validation.isValid) {
      console.log(chalk.red('Errors:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });
    } else {
      console.log(chalk.green('✓ Subdomain is valid'));
    }
  }

  async interactiveEncodeSubdomain() {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Enter text to encode as subdomain:',
        validate: input => input.length > 0 ? true : 'Input is required'
      }
    ]);

    await this.encodeSubdomain(input);
  }

  async encodeSubdomain(input) {
    console.log(chalk.cyan.bold(`\n=== Encoding Subdomain: ${input} ===\n`));

    const sanitized = this.encodingService.sanitizeSubdomain(input);
    const validation = this.encodingService.validateSubdomainFormat(input);
    const stats = this.encodingService.getEncodingStats(input);
    
    console.log(chalk.white('Original:'), chalk.yellow(input));
    console.log(chalk.white('Sanitized:'), chalk.green(sanitized));
    console.log(chalk.white('Valid:'), validation.isValid ? chalk.green('YES') : chalk.red('NO'));
    console.log(chalk.white('DNS Safe:'), this.encodingService.isDNSSafe(sanitized) ? chalk.green('YES') : chalk.red('NO'));
    console.log(chalk.white('ENS Safe:'), this.encodingService.isENSSafe(sanitized) ? chalk.green('YES') : chalk.red('NO'));
    
    console.log(chalk.cyan('\nEncoding Stats:'));
    console.log(chalk.white('  Original Length:'), stats.originalLength);
    console.log(chalk.white('  Encoded Length:'), stats.encodedLength);
    console.log(chalk.white('  Has Unicode:'), stats.hasUnicode ? 'YES' : 'NO');
    console.log(chalk.white('  Is Punycode:'), stats.isPunycode ? 'YES' : 'NO');
    console.log(chalk.white('  Encoding Ratio:'), stats.encodingRatio.toFixed(2));
  }

  async interactiveResolveENS() {
    const { domain } = await inquirer.prompt([
      {
        type: 'input',
        name: 'domain',
        message: 'Enter ENS domain to resolve:',
        default: 'uniswap.eth'
      }
    ]);

    await this.resolveENS(domain);
  }

  async resolveENS(domain) {
    console.log(chalk.cyan.bold(`\n=== Resolving ENS Domain: ${domain} ===\n`));

    try {
      const result = await this.ensService.resolveENS(domain);
      
      console.log(chalk.white('Domain:'), chalk.yellow(domain));
      console.log(chalk.white('Resolved:'), result.resolved ? chalk.green('YES') : chalk.red('NO'));
      
      if (result.resolved) {
        console.log(chalk.white('Address:'), chalk.green(result.address));
        console.log(chalk.white('Content Hash:'), chalk.yellow(result.contentHash || 'N/A'));
        console.log(chalk.white('Text Records:'), chalk.yellow(JSON.stringify(result.textRecords, null, 2)));
      } else {
        console.log(chalk.red('Domain not found or not resolvable'));
      }
    } catch (error) {
      console.log(chalk.red('Error resolving ENS domain:'), error.message);
    }
  }

  async showAnalytics() {
    console.log(chalk.cyan.bold('\n=== Subdomain Analytics ===\n'));

    const summary = this.reservedService.getReservedSubdomainsSummary();
    
    console.log(chalk.white('Total Reserved Subdomains:'), chalk.yellow(summary.total));
    
    console.log(chalk.cyan('\nBy Priority:'));
    Object.entries(summary.byPriority).forEach(([priority, count]) => {
      const priorityName = this.getPriorityName(priority);
      console.log(chalk.white(`  ${priorityName}:`), chalk.yellow(count));
    });
    
    console.log(chalk.cyan('\nBy Category:'));
    Object.entries(summary.byCategory).forEach(([category, count]) => {
      console.log(chalk.white(`  ${category}:`), chalk.yellow(count));
    });
  }

  getPriorityName(priority) {
    const names = {
      '1': 'CRITICAL',
      '2': 'HIGH',
      '3': 'MEDIUM',
      '4': 'LOW'
    };
    return names[priority] || priority;
  }
}

module.exports = MetadataCLI; 