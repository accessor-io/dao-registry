#!/usr/bin/env node

/**
 * DAO Management CLI Module
 * Manages DAO registry operations
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');

// Import DAO service
const DAOService = require('../../services/dao');

class DAOCLI {
  constructor() {
    this.daoService = new DAOService();
  }

  async handleCommand(options) {
    if (options.list) {
      await this.listDAOs();
    } else if (options.get) {
      await this.getDAO(options.get);
    } else if (options.create) {
      await this.createDAO();
    } else if (options.update) {
      await this.updateDAO(options.update);
    } else if (options.delete) {
      await this.deleteDAO(options.delete);
    } else {
      await this.startInteractive();
    }
  }

  async startInteractive() {
    console.log(chalk.cyan.bold('\n=== DAO Management ===\n'));

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Select DAO action:',
          choices: [
            { name: 'List All DAOs', value: 'list' },
            { name: 'Get DAO Details', value: 'get' },
            { name: 'Create New DAO', value: 'create' },
            { name: 'Update DAO', value: 'update' },
            { name: 'Delete DAO', value: 'delete' },
            { name: 'DAO Analytics', value: 'analytics' },
            { name: 'Back to Main Menu', value: 'back' }
          ]
        }
      ]);

      if (action === 'back') break;

      await this.handleDAOAction(action);
    }
  }

  async handleDAOAction(action) {
    const spinner = ora('Processing...').start();

    try {
      switch (action) {
        case 'list':
          await this.listDAOs();
          break;
        case 'get':
          await this.interactiveGetDAO();
          break;
        case 'create':
          await this.createDAO();
          break;
        case 'update':
          await this.interactiveUpdateDAO();
          break;
        case 'delete':
          await this.interactiveDeleteDAO();
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

  async listDAOs() {
    console.log(chalk.cyan.bold('\n=== All DAOs ===\n'));

    const daos = this.daoService.getAllDAOs();
    
    const table = new Table({
      head: ['ID', 'Name', 'Symbol', 'Chain ID', 'Status', 'Verified'],
      colWidths: [5, 20, 10, 10, 15, 10]
    });

    daos.forEach(dao => {
      table.push([
        dao.id,
        dao.name,
        dao.symbol,
        dao.chainId,
        dao.status,
        dao.verified ? '✓' : '✗'
      ]);
    });

    console.log(table.toString());
    console.log(chalk.green(`\nTotal: ${daos.length} DAOs`));
  }

  async interactiveGetDAO() {
    const { daoId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'daoId',
        message: 'Enter DAO ID:',
        validate: input => input.length > 0 ? true : 'DAO ID is required'
      }
    ]);

    await this.getDAO(daoId);
  }

  async getDAO(daoId) {
    console.log(chalk.cyan.bold(`\n=== DAO Details: ${daoId} ===\n`));

    try {
      const dao = this.daoService.getDAOById(daoId);
      
      console.log(chalk.white('ID:'), chalk.yellow(dao.id));
      console.log(chalk.white('Name:'), chalk.yellow(dao.name));
      console.log(chalk.white('Symbol:'), chalk.yellow(dao.symbol));
      console.log(chalk.white('Description:'), chalk.yellow(dao.description));
      console.log(chalk.white('Chain ID:'), chalk.yellow(dao.chainId));
      console.log(chalk.white('Status:'), chalk.yellow(dao.status));
      console.log(chalk.white('Verified:'), dao.verified ? chalk.green('YES') : chalk.red('NO'));
      
      console.log(chalk.cyan('\nContract Addresses:'));
      console.log(chalk.white('  Main Contract:'), chalk.green(dao.contractAddress));
      console.log(chalk.white('  Token Address:'), chalk.green(dao.tokenAddress));
      console.log(chalk.white('  Treasury:'), chalk.green(dao.treasuryAddress));
      console.log(chalk.white('  Governance:'), chalk.green(dao.governanceAddress));
      
      if (dao.ensDomain) {
        console.log(chalk.cyan('\nENS Information:'));
        console.log(chalk.white('  Domain:'), chalk.yellow(dao.ensDomain));
        if (dao.ensSubdomains) {
          Object.entries(dao.ensSubdomains).forEach(([key, value]) => {
            console.log(chalk.white(`  ${key}:`), chalk.yellow(value));
          });
        }
      }
      
      if (dao.socialLinks) {
        console.log(chalk.cyan('\nSocial Links:'));
        Object.entries(dao.socialLinks).forEach(([platform, url]) => {
          console.log(chalk.white(`  ${platform}:`), chalk.blue(url));
        });
      }
      
      if (dao.tags && dao.tags.length > 0) {
        console.log(chalk.cyan('\nTags:'), chalk.yellow(dao.tags.join(', ')));
      }
      
    } catch (error) {
      console.log(chalk.red('DAO not found:'), error.message);
    }
  }

  async createDAO() {
    console.log(chalk.cyan.bold('\n=== Create New DAO ===\n'));

    const daoData = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'DAO Name:',
        validate: input => input.length > 0 ? true : 'Name is required'
      },
      {
        type: 'input',
        name: 'symbol',
        message: 'Token Symbol:',
        validate: input => input.length > 0 ? true : 'Symbol is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: ''
      },
      {
        type: 'input',
        name: 'contractAddress',
        message: 'Contract Address:',
        validate: input => /^0x[a-fA-F0-9]{40}$/.test(input) ? true : 'Invalid Ethereum address'
      },
      {
        type: 'number',
        name: 'chainId',
        message: 'Chain ID:',
        default: 1
      },
      {
        type: 'list',
        name: 'governanceType',
        message: 'Governance Type:',
        choices: ['TokenWeighted', 'NFTWeighted', 'Quadratic', 'Custom']
      }
    ]);

    try {
      const newDAO = this.daoService.createDAO(daoData);
      console.log(chalk.green('\n✓ DAO created successfully!'));
      console.log(chalk.white('DAO ID:'), chalk.yellow(newDAO.id));
    } catch (error) {
      console.log(chalk.red('Failed to create DAO:'), error.message);
    }
  }

  async interactiveUpdateDAO() {
    const { daoId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'daoId',
        message: 'Enter DAO ID to update:',
        validate: input => input.length > 0 ? true : 'DAO ID is required'
      }
    ]);

    await this.updateDAO(daoId);
  }

  async updateDAO(daoId) {
    console.log(chalk.cyan.bold(`\n=== Update DAO: ${daoId} ===\n`));

    const updateData = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'New Name (leave empty to keep current):'
      },
      {
        type: 'input',
        name: 'description',
        message: 'New Description (leave empty to keep current):'
      },
      {
        type: 'confirm',
        name: 'verified',
        message: 'Mark as verified?',
        default: false
      }
    ]);

    // Remove empty fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        delete updateData[key];
      }
    });

    try {
      const updatedDAO = this.daoService.updateDAO(daoId, updateData);
      console.log(chalk.green('\n✓ DAO updated successfully!'));
      console.log(chalk.white('Updated fields:'), chalk.yellow(Object.keys(updateData).join(', ')));
    } catch (error) {
      console.log(chalk.red('Failed to update DAO:'), error.message);
    }
  }

  async interactiveDeleteDAO() {
    const { daoId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'daoId',
        message: 'Enter DAO ID to delete:',
        validate: input => input.length > 0 ? true : 'DAO ID is required'
      }
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete DAO ${daoId}?`,
        default: false
      }
    ]);

    if (confirm) {
      await this.deleteDAO(daoId);
    } else {
      console.log(chalk.yellow('Deletion cancelled'));
    }
  }

  async deleteDAO(daoId) {
    console.log(chalk.cyan.bold(`\n=== Delete DAO: ${daoId} ===\n`));

    try {
      this.daoService.deleteDAO(daoId);
      console.log(chalk.green('\n✓ DAO deleted successfully!'));
    } catch (error) {
      console.log(chalk.red('Failed to delete DAO:'), error.message);
    }
  }

  async showAnalytics() {
    console.log(chalk.cyan.bold('\n=== DAO Analytics ===\n'));

    const daos = this.daoService.getAllDAOs();
    
    console.log(chalk.white('Total DAOs:'), chalk.yellow(daos.length));
    
    const verifiedCount = daos.filter(dao => dao.verified).length;
    console.log(chalk.white('Verified DAOs:'), chalk.yellow(verifiedCount));
    
    const activeCount = daos.filter(dao => dao.status === 'Active').length;
    console.log(chalk.white('Active DAOs:'), chalk.yellow(activeCount));
    
    // Chain distribution
    const chainDistribution = {};
    daos.forEach(dao => {
      chainDistribution[dao.chainId] = (chainDistribution[dao.chainId] || 0) + 1;
    });
    
    console.log(chalk.cyan('\nBy Chain ID:'));
    Object.entries(chainDistribution).forEach(([chainId, count]) => {
      console.log(chalk.white(`  Chain ${chainId}:`), chalk.yellow(count));
    });
    
    // Governance type distribution
    const governanceDistribution = {};
    daos.forEach(dao => {
      governanceDistribution[dao.governanceType] = (governanceDistribution[dao.governanceType] || 0) + 1;
    });
    
    console.log(chalk.cyan('\nBy Governance Type:'));
    Object.entries(governanceDistribution).forEach(([type, count]) => {
      console.log(chalk.white(`  ${type}:`), chalk.yellow(count));
    });
  }
}

module.exports = DAOCLI; 