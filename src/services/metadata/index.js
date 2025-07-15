// Metadata Services Index
// Organized metadata services for DAO Registry

// Reserved Subdomains
const { ReservedSubdomainsService } = require('./reserved/subdomains/reserved-subdomains-service');

// URL Encoding
const { URLEncodingService } = require('./reserved/encoding/url-encoding-service');

// ENS Resolution
const { ENSResolverService } = require('./ens/ens-resolver-service');

// ISO Metadata (TypeScript - would need compilation)
// const { ISOMetadataService } = require('./iso/iso-metadata-service');

// Metadata Registry (TypeScript - would need compilation)
// const { MetadataRegistry } = require('./registry/metadata-registry');

module.exports = {
  ReservedSubdomainsService,
  URLEncodingService,
  ENSResolverService,
  // ISOMetadataService,
  // MetadataRegistry
}; 