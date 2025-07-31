#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

const program = new Command();

// ASCII art banner
const banner = boxen(
  chalk.blue.bold('DAO Registry CLI'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue'
  }
);

console.log(banner);

program
  .name('dao-registry')
  .description('CLI tool for DAO Registry integration')
  .version('1.0.0');

// Initialize project
program
  .command('init')
  .description('Initialize DAO Registry in your project')
  .option('-f, --framework <framework>', 'Framework to use (react, vue, angular, vanilla)')
  .option('-p, --package-manager <manager>', 'Package manager (npm, yarn, pnpm)')
  .action(async (options) => {
    const spinner = ora('Initializing DAO Registry...').start();

    try {
      // Detect framework if not specified
      let framework = options.framework;
      if (!framework) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'framework',
            message: 'What framework are you using?',
            choices: [
              { name: 'React/Next.js', value: 'react' },
              { name: 'Vue.js/Nuxt.js', value: 'vue' },
              { name: 'Angular', value: 'angular' },
              { name: 'Vanilla JavaScript', value: 'vanilla' }
            ]
          }
        ]);
        framework = answers.framework;
      }

      // Detect package manager if not specified
      let packageManager = options.packageManager;
      if (!packageManager) {
        if (fs.existsSync('yarn.lock')) {
          packageManager = 'yarn';
        } else if (fs.existsSync('pnpm-lock.yaml')) {
          packageManager = 'pnpm';
        } else {
          packageManager = 'npm';
        }
      }

      // Install dependencies
      spinner.text = 'Installing dependencies...';
      
      const { execSync } = require('child_process');
      
      // Install core package
      execSync(`${packageManager} add @dao-registry/core`, { stdio: 'inherit' });
      
      // Install framework-specific package
      if (framework !== 'vanilla') {
        execSync(`${packageManager} add @dao-registry/${framework}`, { stdio: 'inherit' });
      }

      // Create example files
      spinner.text = 'Creating example files...';
      
      const examplesDir = path.join(process.cwd(), 'dao-registry-examples');
      if (!fs.existsSync(examplesDir)) {
        fs.mkdirSync(examplesDir, { recursive: true });
      }

      // Create framework-specific example
      const exampleContent = getExampleContent(framework);
      fs.writeFileSync(
        path.join(examplesDir, `dao-example.${framework === 'react' ? 'tsx' : 'js'}`),
        exampleContent
      );

      // Create configuration file
      const configContent = getConfigContent(framework);
      fs.writeFileSync(
        path.join(process.cwd(), 'dao-registry.config.js'),
        configContent
      );

      spinner.succeed(chalk.green('DAO Registry initialized successfully!'));

      console.log(chalk.blue('\nNext steps:'));
      console.log(chalk.white('1. Check out the example in dao-registry-examples/'));
      console.log(chalk.white('2. Configure your DAO in dao-registry.config.js'));
      console.log(chalk.white('3. Start building with the SDK!'));

    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize DAO Registry'));
      console.error(error);
    }
  });

// Generate components
program
  .command('generate')
  .description('Generate DAO components')
  .argument('<type>', 'Component type (governance, treasury, token, analytics, social)')
  .option('-d, --dao <dao>', 'DAO identifier (e.g., dao-name.eth)')
  .option('-f, --framework <framework>', 'Framework to use')
  .option('-o, --output <path>', 'Output directory')
  .action(async (type, options) => {
    const spinner = ora(`Generating ${type} component...`).start();

    try {
      const framework = options.framework || 'react';
      const outputDir = options.output || 'src/components/dao';
      const dao = options.dao || 'example.eth';

      // Create output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate component
      const componentContent = getComponentContent(type, framework, dao);
      const fileName = `${type}-component.${framework === 'react' ? 'tsx' : 'js'}`;
      
      fs.writeFileSync(path.join(outputDir, fileName), componentContent);

      spinner.succeed(chalk.green(`${type} component generated successfully!`));
      console.log(chalk.blue(`File created: ${outputDir}/${fileName}`));

    } catch (error) {
      spinner.fail(chalk.red(`Failed to generate ${type} component`));
      console.error(error);
    }
  });

// Deploy to platforms
program
  .command('deploy')
  .description('Deploy DAO Registry integration')
  .option('-p, --platform <platform>', 'Platform (vercel, netlify, github)')
  .option('-d, --dao <dao>', 'DAO identifier')
  .action(async (options) => {
    const spinner = ora('Deploying DAO Registry integration...').start();

    try {
      const platform = options.platform || 'vercel';
      const dao = options.dao;

      // Platform-specific deployment logic
      switch (platform) {
        case 'vercel':
          await deployToVercel(dao);
          break;
        case 'netlify':
          await deployToNetlify(dao);
          break;
        case 'github':
          await deployToGitHub(dao);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      spinner.succeed(chalk.green(`Deployed to ${platform} successfully!`));

    } catch (error) {
      spinner.fail(chalk.red('Deployment failed'));
      console.error(error);
    }
  });

// Search DAOs
program
  .command('search')
  .description('Search for DAOs')
  .argument('<query>', 'Search query')
  .action(async (query) => {
    const spinner = ora('Searching for DAOs...').start();

    try {
      const { DAORegistry } = require('@dao-registry/core');
      const registry = new DAORegistry();
      
      const results = await registry.search(query);
      
      spinner.succeed(chalk.green(`Found ${results.length} DAOs`));
      
      results.forEach((dao: any, index: number) => {
        console.log(chalk.blue(`${index + 1}. ${dao.name} (${dao.ens})`));
        if (dao.social?.description) {
          console.log(chalk.gray(`   ${dao.social.description}`));
        }
      });

    } catch (error) {
      spinner.fail(chalk.red('Search failed'));
      console.error(error);
    }
  });

// Get DAO info
program
  .command('info')
  .description('Get information about a DAO')
  .argument('<dao>', 'DAO identifier (e.g., dao-name.eth)')
  .action(async (dao) => {
    const spinner = ora(`Fetching information for ${dao}...`).start();

    try {
      const { DAORegistry } = require('@dao-registry/core');
      const registry = new DAORegistry();
      
      const daoData = await registry.get(dao);
      
      spinner.succeed(chalk.green('DAO information retrieved'));
      
      console.log(chalk.blue('\nDAO Information:'));
      console.log(chalk.white(`Name: ${daoData.name}`));
      console.log(chalk.white(`ENS: ${daoData.ens}`));
      
      if (daoData.governance) {
        console.log(chalk.blue('\nGovernance:'));
        console.log(chalk.white(`Active Proposals: ${daoData.governance.activeProposals.length}`));
        console.log(chalk.white(`Total Members: ${daoData.governance.totalMembers}`));
        console.log(chalk.white(`Quorum: ${daoData.governance.quorum}`));
      }
      
      if (daoData.treasury) {
        console.log(chalk.blue('\nTreasury:'));
        console.log(chalk.white(`Total Value: ${daoData.treasury.totalValue}`));
        console.log(chalk.white(`ETH Balance: ${daoData.treasury.ethBalance}`));
      }
      
      if (daoData.social) {
        console.log(chalk.blue('\nSocial:'));
        if (daoData.social.website) console.log(chalk.white(`Website: ${daoData.social.website}`));
        if (daoData.social.twitter) console.log(chalk.white(`Twitter: ${daoData.social.twitter}`));
        if (daoData.social.discord) console.log(chalk.white(`Discord: ${daoData.social.discord}`));
      }

    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch DAO information'));
      console.error(error);
    }
  });

// Helper functions
function getExampleContent(framework: string): string {
  switch (framework) {
    case 'react':
      return `import React from 'react';
import { useDAO, useDAOGovernance, useDAOTreasury } from '@dao-registry/react';

function DAOExample() {
  const { data: dao, loading, error } = useDAO('example.eth');
  const { data: governance } = useDAOGovernance('example.eth');
  const { data: treasury } = useDAOTreasury('example.eth');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{dao?.name}</h1>
      <p>ENS: {dao?.ens}</p>
      
      {governance && (
        <div>
          <h2>Governance</h2>
          <p>Active Proposals: {governance.activeProposals.length}</p>
          <p>Total Members: {governance.totalMembers}</p>
        </div>
      )}
      
      {treasury && (
        <div>
          <h2>Treasury</h2>
          <p>Total Value: {treasury.totalValue}</p>
          <p>ETH Balance: {treasury.ethBalance}</p>
        </div>
      )}
    </div>
  );
}

export default DAOExample;`;

    case 'vue':
      return `import { defineComponent } from 'vue';
import { useDAO } from '@dao-registry/vue';

export default defineComponent({
  name: 'DAOExample',
  setup() {
    const { data: dao, loading, error } = useDAO('example.eth');

    return {
      dao,
      loading,
      error
    };
  },
  template: \`
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <h1>{{ dao?.name }}</h1>
      <p>ENS: {{ dao?.ens }}</p>
    </div>
  \`
});`;

    case 'angular':
      return `import { Component, OnInit } from '@angular/core';
import { DAORegistry } from '@dao-registry/core';

@Component({
  selector: 'app-dao-example',
  template: \`
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error">Error: {{ error.message }}</div>
    <div *ngIf="dao">
      <h1>{{ dao.name }}</h1>
      <p>ENS: {{ dao.ens }}</p>
    </div>
  \`
})
export class DAOExampleComponent implements OnInit {
  dao: any;
  loading = true;
  error: any;

  async ngOnInit() {
    try {
      const registry = new DAORegistry();
      this.dao = await registry.get('example.eth');
    } catch (err) {
      this.error = err;
    } finally {
      this.loading = false;
    }
  }
}`;

    default: // vanilla
      return `import { DAORegistry } from '@dao-registry/core';

async function displayDAO() {
  const registry = new DAORegistry();
  
  try {
    const dao = await registry.get('example.eth');
    
    document.getElementById('dao-name').textContent = dao.name;
    document.getElementById('dao-ens').textContent = dao.ens;
    
    if (dao.governance) {
      document.getElementById('proposal-count').textContent = 
        dao.governance.activeProposals.length;
    }
    
    if (dao.treasury) {
      document.getElementById('treasury-value').textContent = 
        dao.treasury.totalValue;
    }
  } catch (error) {
    console.error('Failed to fetch DAO data:', error);
  }
}

// Call the function when page loads
document.addEventListener('DOMContentLoaded', displayDAO);`;
  }
}

function getConfigContent(framework: string): string {
  return `module.exports = {
  framework: '${framework}',
  apiUrl: 'https://api.dao-registry.com',
  defaultDAO: 'example.eth',
  
  // Custom configuration
  features: {
    governance: true,
    treasury: true,
    token: true,
    analytics: true,
    social: true
  },
  
  // UI customization
  ui: {
    theme: 'light',
    language: 'en',
    currency: 'USD'
  }
};`;
}

function getComponentContent(type: string, framework: string, dao: string): string {
  const componentName = type.charAt(0).toUpperCase() + type.slice(1);
  
  switch (framework) {
    case 'react':
      return `import React from 'react';
import { useDAO${componentName} } from '@dao-registry/react';

function ${componentName}Component() {
  const { data, loading, error } = useDAO${componentName}('${dao}');

  if (loading) return <div>Loading ${type}...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No ${type} data available</div>;

  return (
    <div className="${type}-component">
      <h2>${componentName}</h2>
      {/* Add your ${type} specific rendering here */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default ${componentName}Component;`;

    default:
      return `// ${componentName} component for ${framework}
// This is a basic template - customize based on your needs

function ${componentName}Component() {
  // Add your ${type} component logic here
  console.log('${componentName} component for ${dao}');
}

export default ${componentName}Component;`;
  }
}

async function deployToVercel(dao: string) {
  // Implementation for Vercel deployment
  console.log(`Deploying to Vercel for DAO: ${dao}`);
}

async function deployToNetlify(dao: string) {
  // Implementation for Netlify deployment
  console.log(`Deploying to Netlify for DAO: ${dao}`);
}

async function deployToGitHub(dao: string) {
  // Implementation for GitHub deployment
  console.log(`Deploying to GitHub for DAO: ${dao}`);
}

program.parse(); 