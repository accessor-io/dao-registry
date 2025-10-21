/**
 * ENS Integration Types
 * RFC-001: DAO Registry Specification - ENS Integration Types
 */

export interface ENSRegistration {
  id: string;                   // Unique identifier
  daoId: string;               // Associated DAO ID
  primaryDomain: string;       // Primary ENS domain
  subdomains: ENSSubdomain[];  // ENS subdomains
  metadata: ENSMetadata;       // ENS metadata
  verified: boolean;           // Verification status
  registrationDate: Date;      // Registration timestamp
}

export interface ENSSubdomain {
  name: string;                // Subdomain name
  fullDomain: string;          // Full domain (e.g., "governance.dao.eth")
  target: string;              // Target address or content
  type: ENSSubdomainType;      // Subdomain type
  verified: boolean;           // Verification status
}

export enum ENSSubdomainType {
  ADDRESS = "address",
  CONTENT_HASH = "content_hash",
  TEXT_RECORD = "text_record"
}

export interface ENSMetadata {
  textRecords: Record<string, string>; // ENS text records
  contentHash?: string;         // ENS content hash
  reverseRecord?: string;       // Reverse ENS record
  avatar?: string;              // Avatar URL
  description?: string;         // Description
  keywords?: string[];          // Keywords
  url?: string;                 // Website URL
}

export interface ENSContractMetadata extends ENSMetadata {
  contractAddress: string;
  ensName: string;
  resolverAddress?: string;
  implementedInterfaces: string[];
  reverseRecordClaimed: boolean;
  lastUpdated: Date;
}

export interface ENSTextRecordValidation {
  key: string;
  value: string;
  isValid: boolean;
  errors: string[];
  maxLength: number;
}

export interface ENSContractIntegration {
  enabled: boolean;
  registered: boolean;
  lastSynced?: Date;
  syncStatus: 'synced' | 'pending' | 'failed' | 'not_synced';
}

export interface ENSContractValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedAt: Date;
}

export interface CompleteENSContractMetadata {
  contractAddress: string;
  ensName: string;
  textRecords: Record<string, string>;
  reverseRecord?: string;
  resolverAddress?: string;
  metadata: {
    name: string;
    description: string;
    version: string;
    url?: string;
    avatar?: string;
    email?: string;
    notice?: string;
    keywords: string[];
    socialLinks: string[];
    author: string;
    createdAt: Date;
    updatedAt: Date;
    verified: boolean;
    implementedInterfaces: string[];
  };
  integration: ENSContractIntegration;
  validation: ENSContractValidation;
}

export interface ENSResolution {
  domain: string;              // ENS domain
  address?: string;            // Resolved address
  contentHash?: string;        // Content hash
  textRecords: Record<string, string>; // Text records
  avatar?: string;             // Avatar
  description?: string;        // Description
  error?: string;              // Resolution error
}

export enum ENSResolutionStatus {
  RESOLVED = "resolved",
  UNRESOLVED = "unresolved",
  EXPIRED = "expired",
  INVALID = "invalid"
}

export interface ENSResolutionClassification {
  status: ENSResolutionStatus;
  domain: string;
  resolvedAddress?: string;
  confidence: number;
}

// Request/Response Types
export interface ENSRegistrationRequest {
  daoId: string;
  primaryDomain: string;
  subdomains: ENSSubdomainRequest[];
  metadata: ENSMetadata;
}

export interface ENSSubdomainRequest {
  name: string;
  target: string;
  type: ENSSubdomainType;
}

export interface ENSUpdateRequest {
  daoId: string;
  subdomains?: ENSSubdomainRequest[];
  metadata?: ENSMetadata;
}

export interface ENSOwnershipVerificationRequest {
  domain: string;
  address: string;
  signature: string;
}

export interface ENSResponse {
  data: ENSRegistration;
  resolution: ENSResolution;
  verification: ENSVerification;
}

export interface ENSVerification {
  ownershipVerified: boolean;
  domainValid: boolean;
  subdomainsValid: boolean;
  metadataValid: boolean;
}

export interface ENSListResponse {
  data: ENSRegistration[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
} 