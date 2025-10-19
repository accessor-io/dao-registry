#!/usr/bin/env node

/**
 * Metadata Accessor CLI
 * Command-line interface for accessing and validating DAO Registry metadata
 */

const { Command } = require('commander');
const chalk = require('chalk');
const MetadataAccessor = require('../metadata/metadata-accessor');
const ENSDomainValidator = require('../ens/domain-validator');
const ENSMetadataIntegration = require('../ens/ens-metadata-integration');
const ContractNamingConventions = require('../contracts/naming-conventions');

const program = new Command();

// Initialize accessor
const accessor = new MetadataAccessor();
const ensValidator = new ENSDomainValidator();
const ensMetadataIntegration = new ENSMetadataIntegration();
const contractNaming = new ContractNamingConventions();

program
  .name('dao-accessor')
  .description('DAO Registry Metadata Accessor CLI')
  .version('1.0.0');

// Access command
program
  .command('access')
  .description('Access metadata properties')
  .argument('<path>', 'Property path to access')
  .option('-f, --file <file>', 'JSON file to read data from')
  .option('-p, --pattern <pattern>', 'Accessor pattern (direct, computed, validated, cached)', 'direct')
  .option('-s, --schema <schema>', 'Validation schema to use')
  .action((path, options) => {
    try {
      let data;
      
      if (options.file) {
        const fs = require('fs');
        data = JSON.parse(fs.readFileSync(options.file, 'utf8'));
      } else {
        // Use sample data
        data = getSampleDAO();
      }
      
      const value = accessor.get(data, path, options.pattern, {
        schema: options.schema ? accessor.schemas[options.schema] : null
      });
      
      console.log(chalk.green('✓ Access successful'));
      console.log(chalk.blue('Path:'), path);
      console.log(chalk.blue('Pattern:'), options.pattern);
      console.log(chalk.blue('Value:'), JSON.stringify(value, null, 2));
      
    } catch (error) {
      console.error(chalk.red('✗ Access failed:'), error.message);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate metadata against schemas')
  .argument('<type>', 'Type of metadata to validate (dao, ens, contract, governance)')
  .option('-f, --file <file>', 'JSON file to validate')
  .option('-s, --strict', 'Enable strict validation')
  .action((type, options) => {
    try {
      let data;
      
      if (options.file) {
        const fs = require('fs');
        data = JSON.parse(fs.readFileSync(options.file, 'utf8'));
      } else {
        data = getSampleData(type);
      }
      
      let result;
      switch (type) {
        case 'dao':
          result = accessor.validateDAO(data);
          break;
        case 'ens':
          result = accessor.validateENS(data);
          break;
        default:
          throw new Error(`Unknown validation type: ${type}`);
      }
      
      if (result.isValid) {
        console.log(chalk.green('✓ Validation passed'));
      } else {
        console.log(chalk.red('✗ Validation failed'));
        result.errors.forEach(error => {
          console.log(chalk.red('  Error:'), error);
        });
      }
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('⚠ Warnings:'));
        result.warnings.forEach(warning => {
          console.log(chalk.yellow('  Warning:'), warning);
        });
      }
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(chalk.blue('💡 Suggestions:'));
        result.suggestions.forEach(suggestion => {
          console.log(chalk.blue('  Suggestion:'), suggestion);
        });
      }
      
    } catch (error) {
      console.error(chalk.red('✗ Validation failed:'), error.message);
      process.exit(1);
    }
  });

// ENS command
program
  .command('ens')
  .description('ENS domain validation and management')
  .argument('<domain>', 'ENS domain to validate')
  .option('-t, --type <type>', 'Domain type (primary, subdomain)', 'primary')
  .option('-g, --generate', 'Generate standard subdomains')
  .action((domain, options) => {
    try {
      const result = ensValidator.validateDomain(domain, options.type);
      
      if (result.isValid) {
        console.log(chalk.green('✓ Domain is valid'));
        console.log(chalk.blue('Normalized:'), result.normalizedDomain);
      } else {
        console.log(chalk.red('✗ Domain is invalid'));
        result.errors.forEach(error => {
          console.log(chalk.red('  Error:'), error);
        });
      }
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('⚠ Warnings:'));
        result.warnings.forEach(warning => {
          console.log(chalk.yellow('  Warning:'), warning);
        });
      }
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(chalk.blue('💡 Suggestions:'));
        result.suggestions.forEach(suggestion => {
          console.log(chalk.blue('  Suggestion:'), suggestion);
        });
      }
      
      if (options.generate && result.isValid) {
        const subdomains = ensValidator.generateStandardSubdomains(result.normalizedDomain);
        console.log(chalk.green('📋 Standard subdomains:'));
        subdomains.forEach(subdomain => {
          console.log(chalk.blue('  '), subdomain);
        });
      }
      
    } catch (error) {
      console.error(chalk.red('✗ ENS validation failed:'), error.message);
      process.exit(1);
    }
  });

// Contract command
program
  .command('contract')
  .description('Contract naming validation and generation')
  .argument('<name>', 'Contract name to validate or DAO name to generate from')
  .option('-g, --generate', 'Generate contract names for DAO')
  .option('-t, --type <type>', 'Contract type for generation')
  .option('-v, --version <version>', 'Version number')
  .action((name, options) => {
    try {
      if (options.generate) {
        // Generate contract names
        const contracts = contractNaming.generateDAOContractNames(name, {
          includeInterfaces: true,
          includeImplementations: true,
          includeVersions: true
        });
        
        console.log(chalk.green('📋 Generated contract names for:'), name);
        Object.entries(contracts).forEach(([type, contractName]) => {
          console.log(chalk.blue(`  ${type}:`), contractName);
        });
        
      } else {
        // Validate contract name
        const result = contractNaming.validateContractName(name);
        
        if (result.isValid) {
          console.log(chalk.green('✓ Contract name is valid'));
          console.log(chalk.blue('Type:'), result.detectedType);
          console.log(chalk.blue('DAO:'), result.detectedDAO);
          if (result.detectedVersion) {
            console.log(chalk.blue('Version:'), result.detectedVersion);
          }
        } else {
          console.log(chalk.red('✗ Contract name is invalid'));
          result.errors.forEach(error => {
            console.log(chalk.red('  Error:'), error);
          });
        }
        
        if (result.warnings && result.warnings.length > 0) {
          console.log(chalk.yellow('⚠ Warnings:'));
          result.warnings.forEach(warning => {
            console.log(chalk.yellow('  Warning:'), warning);
          });
        }
        
        if (result.suggestions && result.suggestions.length > 0) {
          console.log(chalk.blue('💡 Suggestions:'));
          result.suggestions.forEach(suggestion => {
            console.log(chalk.blue('  Suggestion:'), suggestion);
          });
        }
      }
      
    } catch (error) {
      console.error(chalk.red('✗ Contract operation failed:'), error.message);
      process.exit(1);
    }
  });

// ENS metadata command
program
  .command('metadata')
  .description('ENS metadata service integration')
  .argument('<domain>', 'ENS domain to query')
  .option('-n, --network <network>', 'Network (mainnet, sepolia)', 'mainnet')
  .option('-v, --version <version>', 'NFT version (v1, v2)', 'v2')
  .option('-a, --availability', 'Check domain availability')
  .option('-h, --history', 'Get domain history')
  .option('-s, --suggestions', 'Get domain suggestions')
  .action(async (domain, options) => {
    try {
      if (options.availability) {
        const availability = await ensMetadataIntegration.checkDomainAvailability(domain, options.network);
        console.log(chalk.green('📋 Domain Availability:'));
        console.log(chalk.blue('  Domain:'), availability.domain);
        console.log(chalk.blue('  Available:'), availability.isAvailable ? 'Yes' : 'No');
        console.log(chalk.blue('  Registered:'), availability.isRegistered ? 'Yes' : 'No');
        console.log(chalk.blue('  Can Register:'), availability.canRegister ? 'Yes' : 'No');
        if (availability.expirationDate) {
          console.log(chalk.blue('  Expiration:'), availability.expirationDate.toISOString());
        }
        if (availability.errors.length > 0) {
          console.log(chalk.red('  Errors:'), availability.errors.join(', '));
        }
      } else if (options.history) {
        const history = await ensMetadataIntegration.getDomainHistory(domain, options.network);
        console.log(chalk.green('📋 Domain History:'));
        console.log(chalk.blue('  Domain:'), history.domain);
        console.log(chalk.blue('  Created:'), history.createdDate ? history.createdDate.toISOString() : 'Unknown');
        console.log(chalk.blue('  Registered:'), history.registrationDate ? history.registrationDate.toISOString() : 'Unknown');
        console.log(chalk.blue('  Expires:'), history.expirationDate ? history.expirationDate.toISOString() : 'Unknown');
        console.log(chalk.blue('  Length:'), history.length);
        console.log(chalk.blue('  Character Set:'), history.characterSet);
        console.log(chalk.blue('  Has Special Chars:'), history.hasSpecialCharacters ? 'Yes' : 'No');
        console.log(chalk.blue('  Is Emoji:'), history.isEmoji ? 'Yes' : 'No');
        console.log(chalk.blue('  Is Punycode:'), history.isPunycode ? 'Yes' : 'No');
      } else if (options.suggestions) {
        const baseName = domain.replace('.eth', '');
        const suggestions = await ensMetadataIntegration.getDomainSuggestions(baseName, options.network);
        console.log(chalk.green('💡 Domain Suggestions:'));
        suggestions.forEach(suggestion => {
          const status = suggestion.isAvailable ? chalk.green('Available') : 
                        suggestion.isExpired ? chalk.yellow('Expired') : 
                        chalk.red('Registered');
          console.log(chalk.blue(`  ${suggestion.domain}:`), status);
          if (suggestion.expirationDate) {
            console.log(chalk.gray(`    Expires: ${suggestion.expirationDate.toISOString()}`));
          }
        });
      } else {
        const metadata = await ensMetadataIntegration.getENSMetadata(domain, options.network, options.version);
        console.log(chalk.green('📋 ENS Metadata:'));
        console.log(chalk.blue('  Name:'), metadata.name);
        console.log(chalk.blue('  Description:'), metadata.description);
        console.log(chalk.blue('  Normalized:'), metadata.is_normalized ? 'Yes' : 'No');
        console.log(chalk.blue('  Image:'), metadata.image);
        if (metadata.url) {
          console.log(chalk.blue('  URL:'), metadata.url);
        }
        if (metadata.attributes && metadata.attributes.length > 0) {
          console.log(chalk.blue('  Attributes:'));
          metadata.attributes.forEach(attr => {
            console.log(chalk.gray(`    ${attr.trait_type}: ${attr.value}`));
          });
        }
      }
      
    } catch (error) {
      console.error(chalk.red('✗ ENS metadata operation failed:'), error.message);
      process.exit(1);
    }
  });

// Cache command
program
  .command('cache')
  .description('Cache management')
  .option('-c, --clear', 'Clear cache')
  .option('-s, --stats', 'Show cache statistics')
  .option('-p, --pattern <pattern>', 'Clear cache entries matching pattern')
  .action((options) => {
    try {
      if (options.clear) {
        accessor.clearCache(options.pattern);
        ensMetadataIntegration.clearCache(options.pattern);
        console.log(chalk.green('✓ Cache cleared'));
        if (options.pattern) {
          console.log(chalk.blue('Pattern:'), options.pattern);
        }
      }
      
      if (options.stats) {
        const accessorStats = accessor.getCacheStats();
        const metadataStats = ensMetadataIntegration.getCacheStats();
        console.log(chalk.green('📊 Cache Statistics:'));
        console.log(chalk.blue('  Accessor Cache Size:'), accessorStats.size);
        console.log(chalk.blue('  Metadata Cache Size:'), metadataStats.size);
        console.log(chalk.blue('  Total Keys:'), accessorStats.keys.length + metadataStats.keys.length);
        console.log(chalk.blue('  Memory Usage:'), Math.round(accessorStats.memoryUsage.heapUsed / 1024 / 1024), 'MB');
      }
      
    } catch (error) {
      console.error(chalk.red('✗ Cache operation failed:'), error.message);
      process.exit(1);
    }
  });

// Sample data functions
function getSampleDAO() {
  return {
    id: "1",
    name: "Uniswap DAO",
    symbol: "UNI",
    description: "Decentralized exchange governance protocol",
    chainId: 1,
    contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    treasuryAddress: "0x4750c43867EF5F89869132eccf19B9b6C4280E09",
    governanceAddress: "0x5e4be8Bc9637f0EAA1A755069e05802F9a6C424a",
    governanceType: "TokenWeighted",
    votingPeriod: 7,
    quorum: 40000000,
    proposalThreshold: 10000000,
    status: "Active",
    verified: true,
    active: true,
    ensDomain: "uniswap.eth",
    ensSubdomains: {
      governance: "gov.uniswap.eth",
      treasury: "treasury.uniswap.eth",
      forum: "forum.uniswap.eth",
      analytics: "analytics.uniswap.eth"
    },
    ensMetadata: {
      description: "Uniswap DAO official ENS domain",
      url: "https://uniswap.eth",
      avatar: "https://assets.uniswap.org/avatar.png",
      email: "contact@uniswap.eth"
    },
    socialLinks: {
      twitter: "https://twitter.com/Uniswap",
      discord: "https://discord.gg/uniswap",
      github: "https://github.com/Uniswap"
    },
    tags: ["DeFi", "DEX", "Governance", "Liquidity"],
    metadata: {
      recordId: "dao-1",
      systemId: "dao-registry-mainnet",
      externalId: "uniswap-eth",
      recordType: "DAO"
    },
    createdAt: "2021-05-01T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z"
  };
}

function getSampleData(type) {
  switch (type) {
    case 'ens':
      return {
        domain: "uniswap.eth",
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        textRecords: {
          description: "Uniswap DAO official ENS domain",
          url: "https://uniswap.eth",
          avatar: "https://assets.uniswap.org/avatar.png"
        },
        timestamp: "2024-01-15T00:00:00.000Z"
      };
    default:
      return getSampleDAO();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();
