/**
 * DAO Registry - Main Entry Point
 * 
 * Integrates all components:
 * - URL Encoding Service
 * - Reserved Subdomains Service
 * - ENS Integration
 * - Metadata Services
 * - ISO Standards
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { URLEncodingService, SubdomainEncodingService } from './services/metadata/url-encoding-service';
import { ReservedSubdomainsService } from './services/metadata/reserved-subdomains-service';
import { ISOMetadataService } from './services/metadata/iso-metadata-service';
import { MetadataRegistry } from './services/metadata/metadata-registry';

// Mock ENS resolver service (replace with actual implementation)
class MockENSResolverService {
  private domains = new Map<string, string>();

  async resolveAddress(domain: string): Promise<string | null> {
    return this.domains.get(domain) || null;
  }

  async registerDomain(domain: string, address: string): Promise<void> {
    this.domains.set(domain, address);
  }

  async isAvailable(domain: string): Promise<boolean> {
    return !this.domains.has(domain);
  }
}

/**
 * DAO Registry Application
 */
export class DAORegistryApp {
  private app: express.Application;
  private ensResolver: MockENSResolverService;
  private reservedSubdomainsService: ReservedSubdomainsService;
  private isoMetadataService: ISOMetadataService;
  private metadataRegistry: MetadataRegistry;

  constructor() {
    this.app = express();
    this.ensResolver = new MockENSResolverService();
    this.reservedSubdomainsService = new ReservedSubdomainsService(this.ensResolver);
    this.isoMetadataService = new ISOMetadataService();
    this.metadataRegistry = new MetadataRegistry();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          urlEncoding: 'active',
          reservedSubdomains: 'active',
          ensIntegration: 'active',
          isoMetadata: 'active'
        }
      });
    });

    // Subdomain validation endpoint
    this.app.post('/api/subdomain/validate', async (req, res) => {
      try {
        const { subdomain, parentDomain } = req.body;
        
        if (!subdomain) {
          return res.status(400).json({ error: 'Subdomain is required' });
        }

        // Validate subdomain format with URL encoding
        const subdomainValidation = this.reservedSubdomainsService.validateSubdomain(subdomain);
        
        // Validate ENS subdomain if parent domain provided
        let ensValidation = null;
        if (parentDomain) {
          ensValidation = await this.reservedSubdomainsService.validateENSSubdomain(parentDomain, subdomain);
        }

        res.json({
          subdomain,
          parentDomain,
          validation: {
            format: subdomainValidation,
            ens: ensValidation
          },
          encoding: {
            dnsSafe: URLEncodingService.isDNSSafe(subdomain),
            ensSafe: URLEncodingService.isENSSafe(subdomain),
            sanitized: URLEncodingService.sanitizeSubdomain(subdomain),
            stats: URLEncodingService.getEncodingStats(subdomain)
          },
          suggestions: subdomainValidation.isValid ? 
            this.reservedSubdomainsService.generateSafeVariations(subdomain) : []
        });
      } catch (error) {
        res.status(500).json({ error: 'Validation failed', details: error.message });
      }
    });

    // Reserved subdomains endpoint
    this.app.get('/api/reserved-subdomains', (req, res) => {
      try {
        const { priority, category } = req.query;
        
        let reservedWords: any[] = [];
        
        if (priority) {
          const priorityEnum = parseInt(priority as string);
          const words = this.reservedSubdomainsService.getReservedWordsByPriority(priorityEnum);
          reservedWords = words.map(word => ({
            subdomain: word,
            info: this.reservedSubdomainsService.getReservedSubdomainInfo(word)
          }));
        } else if (category) {
          reservedWords = this.reservedSubdomainsService.getReservedWordsByCategory(category as string);
        } else {
          const allWords = this.reservedSubdomainsService.getAllReservedWords();
          reservedWords = Array.from(allWords.entries()).map(([word, info]) => ({
            subdomain: word,
            info
          }));
        }

        res.json({
          reservedWords,
          summary: this.reservedSubdomainsService.getReservedWordsSummary()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve reserved subdomains' });
      }
    });

    // URL encoding endpoint
    this.app.post('/api/encode', (req, res) => {
      try {
        const { input, type = 'dns' } = req.body;
        
        if (!input) {
          return res.status(400).json({ error: 'Input is required' });
        }

        let result: any = {};
        
        switch (type) {
          case 'url':
            result.encoded = URLEncodingService.encodeURL(input);
            result.decoded = URLEncodingService.decodeURL(result.encoded);
            break;
          case 'dns':
            result.encoded = URLEncodingService.encodeDNS(input);
            result.sanitized = URLEncodingService.sanitizeSubdomain(input);
            break;
          case 'ens':
            result.encoded = URLEncodingService.encodeENS(input);
            result.sanitized = URLEncodingService.sanitizeSubdomain(input);
            break;
          default:
            return res.status(400).json({ error: 'Invalid encoding type' });
        }

        result.stats = URLEncodingService.getEncodingStats(input);
        result.validation = URLEncodingService.validateSubdomainFormat(input);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Encoding failed', details: error.message });
      }
    });

    // Domain manipulation endpoint
    this.app.post('/api/domain/manipulate', (req, res) => {
      try {
        const { domain, operation } = req.body;
        
        if (!domain || !operation) {
          return res.status(400).json({ error: 'Domain and operation are required' });
        }

        let result: any = {};
        
        switch (operation) {
          case 'extract-subdomain':
            result.subdomain = URLEncodingService.extractSubdomain(domain);
            break;
          case 'extract-tld':
            result.tld = URLEncodingService.extractTLD(domain);
            break;
          case 'normalize':
            result.normalized = URLEncodingService.normalizeDomain(domain);
            break;
          case 'validate':
            result.validation = URLEncodingService.validateDomainFormat(domain);
            break;
          default:
            return res.status(400).json({ error: 'Invalid operation' });
        }
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Domain manipulation failed', details: error.message });
      }
    });

    // ISO metadata endpoint
    this.app.post('/api/metadata/iso', async (req, res) => {
      try {
        const { metadata, standard } = req.body;
        
        if (!metadata) {
          return res.status(400).json({ error: 'Metadata is required' });
        }

        const result = await this.isoMetadataService.validateMetadata(metadata, standard);
        
        res.json({
          isValid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          validatedMetadata: result.validatedMetadata
        });
      } catch (error) {
        res.status(500).json({ error: 'Metadata validation failed', details: error.message });
      }
    });

    // Metadata registry endpoint
    this.app.post('/api/metadata/register', async (req, res) => {
      try {
        const { metadata, daoId, standard } = req.body;
        
        if (!metadata || !daoId) {
          return res.status(400).json({ error: 'Metadata and DAO ID are required' });
        }

        const result = await this.metadataRegistry.registerMetadata(daoId, metadata, standard);
        
        res.json({
          success: true,
          metadataId: result.metadataId,
          daoId: result.daoId,
          timestamp: result.timestamp
        });
      } catch (error) {
        res.status(500).json({ error: 'Metadata registration failed', details: error.message });
      }
    });

    // Get metadata endpoint
    this.app.get('/api/metadata/:daoId', async (req, res) => {
      try {
        const { daoId } = req.params;
        const { standard } = req.query;
        
        const metadata = await this.metadataRegistry.getMetadata(daoId, standard as string);
        
        if (!metadata) {
          return res.status(404).json({ error: 'Metadata not found' });
        }
        
        res.json(metadata);
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve metadata', details: error.message });
      }
    });

    // Subdomain availability check
    this.app.post('/api/subdomain/check-availability', async (req, res) => {
      try {
        const { subdomain, parentDomain } = req.body;
        
        if (!subdomain) {
          return res.status(400).json({ error: 'Subdomain is required' });
        }

        // Check if subdomain is reserved
        const isReserved = this.reservedSubdomainsService.isReserved(subdomain);
        const priority = this.reservedSubdomainsService.getPriority(subdomain);
        const info = this.reservedSubdomainsService.getReservedSubdomainInfo(subdomain);

        // Check ENS availability if parent domain provided
        let ensAvailable = null;
        if (parentDomain) {
          const fullDomain = `${subdomain}.${parentDomain}`;
          ensAvailable = await this.ensResolver.isAvailable(fullDomain);
        }

        // Generate alternatives if not available
        const alternatives = isReserved || (ensAvailable === false) ? 
          this.reservedSubdomainsService.generateSafeVariations(subdomain) : [];

        res.json({
          subdomain,
          parentDomain,
          available: !isReserved && (ensAvailable !== false),
          isReserved,
          priority: isReserved ? priority : null,
          info: isReserved ? info : null,
          ensAvailable,
          alternatives
        });
      } catch (error) {
        res.status(500).json({ error: 'Availability check failed', details: error.message });
      }
    });

    // System information endpoint
    this.app.get('/api/system/info', (req, res) => {
      res.json({
        system: 'DAO Registry',
        version: '1.0.0',
        features: {
          urlEncoding: true,
          reservedSubdomains: true,
          ensIntegration: true,
          isoMetadata: true,
          metadataRegistry: true
        },
        encodingPatterns: {
          dnsSafe: URLEncodingService.URL_ENCODING_PATTERNS.DNS_SAFE_CHARS.source,
          ensSafe: URLEncodingService.URL_ENCODING_PATTERNS.ENS_SAFE_CHARS.source,
          urlSafe: URLEncodingService.URL_ENCODING_PATTERNS.URL_SAFE_CHARS.source
        },
        reservedSubdomains: {
          total: this.reservedSubdomainsService.getReservedWordsSummary().total,
          categories: Object.keys(this.reservedSubdomainsService.getReservedWordsSummary().byCategory)
        }
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    });

    this.app.use((req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start the application
   */
  public start(port: number = 3000): void {
    this.app.listen(port, () => {
          console.log(`DAO Registry running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`System info: http://localhost:${port}/api/system/info`);
    console.log(`API documentation: http://localhost:${port}/api/docs`);
    });
  }

  /**
   * Get the Express app instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Get service instances for testing
   */
  public getServices() {
    return {
      reservedSubdomainsService: this.reservedSubdomainsService,
      isoMetadataService: this.isoMetadataService,
      metadataRegistry: this.metadataRegistry,
      ensResolver: this.ensResolver
    };
  }
}

// Export the main application class
export default DAORegistryApp;

// Example usage
if (require.main === module) {
  const app = new DAORegistryApp();
  app.start(3000);
} 