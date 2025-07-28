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
declare class MockENSResolverService {
    private domains;
    resolveAddress(domain: string): Promise<string | null>;
    registerDomain(domain: string, address: string): Promise<void>;
    isAvailable(domain: string): Promise<boolean>;
}
/**
 * DAO Registry Application
 */
export declare class DAORegistryApp {
    private app;
    private ensResolver;
    private reservedSubdomainsService;
    private isoMetadataService;
    private metadataRegistry;
    constructor();
    /**
     * Setup middleware
     */
    private setupMiddleware;
    /**
     * Setup API routes
     */
    private setupRoutes;
    /**
     * Setup error handling
     */
    private setupErrorHandling;
    /**
     * Start the application
     */
    start(port?: number): void;
    /**
     * Get the Express app instance
     */
    getApp(): express.Application;
    /**
     * Get service instances for testing
     */
    getServices(): {
        reservedSubdomainsService: ReservedSubdomainsService;
        isoMetadataService: ISOMetadataService;
        metadataRegistry: MetadataRegistry;
        ensResolver: MockENSResolverService;
    };
}
export default DAORegistryApp;
//# sourceMappingURL=index.d.ts.map