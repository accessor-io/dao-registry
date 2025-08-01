# DAO Registry Schema Glossary

## Overview

This glossary contains all schema-related terms, definitions, and concepts used throughout the DAO Registry system. It serves as a reference for developers, architects, and stakeholders working with the system's metadata schemas, data structures, and validation frameworks.

## Core Schema Terms

### Schema Definition
**SchemaDefinition** - The primary interface defining a complete metadata schema structure containing elements, groups, encoding schemes, validation rules, and other metadata components.

**SchemaId** - Unique identifier for a schema, typically generated from domain and schema name.

**SchemaName** - Human-readable name for the schema.

**SchemaVersion** - Version string indicating the schema's current version (e.g., "1.0.0").

**SchemaDescription** - Detailed description of the schema's purpose and scope.

### Metadata Elements

**MetadataElement** - Individual data field within a schema with specific properties and constraints.

**ElementId** - Unique identifier for a metadata element.

**ElementName** - Human-readable name for the element.

**ElementDefinition** - Detailed description of what the element represents.

**DataType** - The fundamental data type of the element (STRING, NUMBER, BOOLEAN, DATE, DATETIME, ARRAY, OBJECT, ENUM).

**MaxLength** - Maximum allowed length for string elements.

**MinLength** - Minimum required length for string elements.

**Pattern** - Regular expression pattern for validating element values.

**ObligationLevel** - Indicates whether the element is MANDATORY, OPTIONAL, or CONDITIONAL.

**Repeatability** - Indicates whether the element is NOT_REPEATABLE or REPEATABLE.

**DefaultValue** - Default value assigned to the element if not provided.

**ParentElement** - Reference to a parent element in hierarchical structures.

**ChildElements** - Array of child element IDs in hierarchical structures.

**RelatedElements** - Array of related element IDs for cross-references.

**ControlledVocabulary** - Reference to a controlled vocabulary for standardized values.

**EncodingScheme** - Reference to an encoding scheme for standardized formats.

### Element Groups

**ElementGroup** - Logical grouping of related metadata elements.

**GroupId** - Unique identifier for an element group.

**GroupName** - Human-readable name for the group.

**GroupDescription** - Description of the group's purpose and contents.

**ParentGroup** - Reference to a parent group in hierarchical structures.

**ChildGroups** - Array of child group IDs in hierarchical structures.

### Encoding Schemes

**EncodingScheme** - Standardized format for encoding specific types of data.

**SchemeId** - Unique identifier for an encoding scheme.

**SchemeName** - Human-readable name for the scheme.

**SchemeType** - Type of encoding scheme (LANGUAGE_CODES, COUNTRY_CODES, CURRENCY_CODES, TIME_CODES, CUSTOM).

**SchemeValues** - Array of valid values for the encoding scheme.

**SchemeDescription** - Description of the encoding scheme.

**SchemeAuthority** - Organization or standard body responsible for the scheme.

**SchemeVersion** - Version of the encoding scheme.

**FormatSpecification** - Technical specification for the encoding format.

**SchemeValue** - Individual value within an encoding scheme with label and definition.

### Controlled Vocabularies

**ControlledVocabulary** - Standardized set of terms and definitions for specific domains.

**VocabularyId** - Unique identifier for a controlled vocabulary.

**VocabularyName** - Human-readable name for the vocabulary.

**VocabularyType** - Type of vocabulary (RECORD_CLASSIFICATION, SECURITY_CLASSIFICATION, BUSINESS_CLASSIFICATION, TECHNICAL_CLASSIFICATION).

**VocabularyVersion** - Version of the controlled vocabulary.

**VocabularyDescription** - Description of the vocabulary's scope and purpose.

**VocabularyAuthority** - Organization responsible for maintaining the vocabulary.

**VocabularyURI** - URI reference to the vocabulary definition.

**VocabularyTerm** - Individual term within a controlled vocabulary.

**TermId** - Unique identifier for a vocabulary term.

**TermLabel** - Human-readable label for the term.

**TermDefinition** - Definition of the term's meaning.

**BroaderTerm** - Reference to a more general term in the hierarchy.

**NarrowerTerms** - Array of more specific terms in the hierarchy.

**RelatedTerms** - Array of related terms for cross-references.

### Validation Rules

**ValidationRule** - Rule for validating metadata element values.

**RuleId** - Unique identifier for a validation rule.

**RuleName** - Human-readable name for the rule.

**RuleType** - Type of validation rule (REGEX, RANGE, ENUM, CUSTOM).

**RuleExpression** - The actual validation expression or logic.

**RuleDescription** - Description of what the rule validates.

**ErrorMessage** - Error message displayed when validation fails.

### Obligation Levels

**ObligationLevel** - Defines the requirement level for metadata elements.

**LevelId** - Unique identifier for an obligation level.

**LevelName** - Human-readable name for the level.

**LevelDescription** - Description of the obligation level.

**IsRequired** - Boolean indicating if the element is mandatory.

**IsConditional** - Boolean indicating if the element is conditionally required.

**Condition** - Expression defining when conditional elements are required.

### Default Values

**DefaultValue** - Default value configuration for metadata elements.

**ValueType** - Data type of the default value.

**ValueDescription** - Description of the default value's purpose.

## Smart Contract Schema Terms

### Schema Priority Levels

**SchemaPriority** - Enumeration defining the importance level of schemas.

**CRITICAL** - Core system schemas (governance, treasury, etc.) that are never available for public registration.

**HIGH** - Important operational schemas that require special permission.

**MEDIUM** - Standard feature schemas available with registration.

**LOW** - Optional enhancement schemas available with approval.

### Data Types

**DataType** - Enumeration of supported data types for CCIP compatibility.

**STRING** - Text data type.

**UINT256** - Unsigned 256-bit integer.

**ADDRESS** - Ethereum address (20 bytes).

**BOOL** - Boolean true/false value.

**BYTES32** - 32-byte data type.

**ARRAY_STRING** - Array of strings.

**ARRAY_UINT256** - Array of unsigned integers.

**ARRAY_ADDRESS** - Array of addresses.

**STRUCT** - Custom structure type.

**MAPPING** - Key-value mapping type.

### Update Triggers

**UpdateTrigger** - Enumeration defining how data updates are triggered.

**MANUAL** - Manual updates only.

**TIME_BASED** - Time-based automatic updates.

**EVENT_BASED** - Event-driven updates.

**BLOCK_BASED** - Block-based updates.

**CONDITIONAL** - Conditional updates based on data changes.

**EXTERNAL_CALL** - External contract call triggers.

### Update Frequencies

**UpdateFrequency** - Enumeration defining update frequency intervals.

**NEVER** - No automatic updates.

**HOURLY** - Every hour.

**DAILY** - Every day.

**WEEKLY** - Every week.

**MONTHLY** - Every month.

**CUSTOM** - Custom interval in seconds.

### Auto-Update Configuration

**AutoUpdateConfig** - Configuration for automatic data updates.

**Enabled** - Boolean indicating if auto-update is enabled.

**Trigger** - The type of trigger for updates.

**Frequency** - The frequency of updates.

**LastUpdateTime** - Timestamp of the last update.

**NextUpdateTime** - Timestamp of the next scheduled update.

**CustomInterval** - Custom interval in seconds for CUSTOM frequency.

**UpdateFields** - Array of field names to auto-update.

**TriggerConditions** - Array of conditions for conditional updates.

**ExternalContract** - Address of external contract for EXTERNAL_CALL triggers.

**ExternalFunction** - Function selector for external calls.

**RequireDataChange** - Boolean indicating if updates require actual data changes.

**MaxUpdateAge** - Maximum age before forcing an update.

### Schema Fields

**SchemaField** - Definition of a field within a schema.

**FieldName** - Name of the field.

**Required** - Boolean indicating if the field is required.

**ValidationRule** - Validation rule for the field.

### Reserved Subdomain Schema

**ReservedSubdomainSchema** - Complete schema information for a reserved subdomain.

**Subdomain** - The subdomain name.

**Category** - Category classification for the schema.

**Version** - Schema version string.

**CcipInterface** - CCIP interface identifier.

**Fields** - Array of schema fields.

**AllowedRoles** - Array of roles allowed to use this schema.

**Restrictions** - Array of restrictions on schema usage.

**Active** - Boolean indicating if the schema is active.

**CreatedAt** - Timestamp when the schema was created.

**UpdatedAt** - Timestamp when the schema was last updated.

**ApiEndpoint** - API endpoint for the schema.

**DocumentationUrl** - URL to schema documentation.

### CCIP Data Structure

**CCIPData** - Cross-chain data structure for interoperability.

**DataHash** - Hash of the data for integrity verification.

**Timestamp** - Timestamp when the data was stored.

**DataProvider** - Address of the data provider.

**IsValid** - Boolean indicating if the data is valid.

**FieldNames** - Array of field names in the data.

**FieldValues** - Array of field values in the data.

## Service Layer Terms

### Registration Results

**RegistrationResult** - Result of schema registration operations.

**Success** - Boolean indicating if the operation was successful.

**RegistrationTimestamp** - Timestamp when the registration occurred.

**Error** - Error message if the operation failed.

### Update Results

**UpdateResult** - Result of schema update operations.

**NewVersion** - New version string after the update.

### Delete Results

**DeleteResult** - Result of schema deletion operations.

**Dependencies** - Array of dependent schemas that may be affected.

### Validation Results

**ValidationResult** - Result of schema validation operations.

**Valid** - Boolean indicating if the schema is valid.

**Errors** - Array of validation error messages.

### Schema Summaries

**SchemaSummary** - Summary information about a schema.

**ElementCount** - Number of elements in the schema.

**RegistrationDate** - Date when the schema was registered.

**EncodingSchemeSummary** - Summary information about an encoding scheme.

**ValueCount** - Number of values in the encoding scheme.

**VocabularySummary** - Summary information about a controlled vocabulary.

**TermCount** - Number of terms in the vocabulary.

### Schema Documentation

**SchemaDocumentation** - Complete documentation for a schema.

**ElementDocumentation** - Documentation for individual elements.

**GroupDocumentation** - Documentation for element groups.

## Implementation Terms

### Schema Formats

**SchemaFormat** - Supported formats for schema generation.

**JSON** - JavaScript Object Notation format.

**XML** - Extensible Markup Language format.

**RDF** - Resource Description Framework format.

**YAML** - YAML Ain't Markup Language format.

### Implementation Languages

**ImplementationLanguage** - Programming languages for code generation.

**TypeScript** - TypeScript language implementation.

**Python** - Python language implementation.

**Java** - Java language implementation.

**C#** - C# language implementation.

### Validation Frameworks

**ValidationFramework** - Frameworks for validation code generation.

**Zod** - TypeScript-first schema validation library.

**Joi** - JavaScript object schema validation library.

**Yup** - JavaScript schema builder for value parsing and validation.

**JSON Schema** - JSON-based format for defining the structure of JSON data.

## Metadata Capture Terms

**MetadataCaptureService** - Service for capturing metadata from various sources.

**SystemMetadata** - Metadata automatically captured from system operations.

**UserMetadata** - Metadata captured from user interactions.

**BusinessMetadata** - Metadata captured from business processes.

**ManualMetadata** - Metadata manually entered by users.

**QualityMetrics** - Metrics for assessing metadata quality.

**CompletenessCheck** - Validation of metadata completeness.

## Metadata Storage Terms

**MetadataStorageService** - Service for storing metadata in various formats.

**StorageResult** - Result of storage operations.

**JSONMetadata** - Metadata stored in JSON format.

**XMLMetadata** - Metadata stored in XML format.

**RDFMetadata** - Metadata stored in RDF format.

**BackupResult** - Result of backup operations.

**RestoreResult** - Result of restore operations.

**ArchiveResult** - Result of archive operations.

## Metadata Linking Terms

**MetadataLinkingService** - Service for linking metadata entities.

**EntityLink** - Link between metadata entities.

**RecordLink** - Link between metadata records.

**AgentLink** - Link between metadata agents.

**Relationship** - Relationship between metadata entities.

**RelationshipHistory** - History of relationship changes.

**LinkValidation** - Validation of metadata links.

**LinkResolution** - Resolution of broken or invalid links.

## Metadata Appraisal Terms

**MetadataAppraisalService** - Service for evaluating metadata value.

**RetentionValue** - Value assessment for retention decisions.

**ArchivalValue** - Value assessment for archival decisions.

**BusinessValue** - Value assessment for business purposes.

**RetentionDecision** - Decision about metadata retention.

**DispositionDecision** - Decision about metadata disposition.

**TransferDecision** - Decision about metadata transfer.

## Security and Compliance Terms

### Metadata Security

**MetadataSecurity** - Security configuration for metadata.

**AccessControl** - Access control mechanisms.

**Authentication** - Authentication mechanisms.

**Authorization** - Authorization mechanisms.

**Encryption** - Data encryption mechanisms.

**Integrity** - Data integrity mechanisms.

**Confidentiality** - Data confidentiality mechanisms.

**AuditLogging** - Audit logging mechanisms.

**Monitoring** - Monitoring mechanisms.

**Alerting** - Alert mechanisms.

### Compliance Requirements

**ComplianceRequirements** - Compliance requirements for metadata.

**RegulatoryStandard** - Regulatory standards to comply with.

**IndustryStandard** - Industry standards to comply with.

**OrganizationalPolicy** - Organizational policies to comply with.

**ComplianceMonitoring** - Monitoring of compliance status.

**ComplianceReporting** - Reporting of compliance status.

**ComplianceAuditing** - Auditing of compliance status.

**RiskAssessment** - Assessment of compliance risks.

**RiskMitigation** - Mitigation of compliance risks.

**RiskMonitoring** - Monitoring of compliance risks.

### Data Protection

**DataProtection** - Data protection mechanisms.

**PrivacyProtection** - Privacy protection mechanisms.

**DataMinimization** - Data minimization practices.

## Events and Notifications

### Schema Events

**SchemaDefined** - Event emitted when a schema is defined.

**SchemaUpdated** - Event emitted when a schema is updated.

**SchemaDeprecated** - Event emitted when a schema is deprecated.

### CCIP Events

**CCIPDataStored** - Event emitted when CCIP data is stored.

### Role Events

**RoleAdded** - Event emitted when a role is added.

**RoleRemoved** - Event emitted when a role is removed.

## Statistics and Analytics

**TotalSchemas** - Total number of registered schemas.

**SchemasByPriority** - Count of schemas by priority level.

**SubdomainDataHashes** - Array of data hashes for a subdomain.

## Access Control Terms

**Administrators** - Addresses with administrative privileges.

**Moderators** - Addresses with moderation privileges.

**DataProviders** - Addresses authorized to provide data.

## Cross-References

### Related Documents
- [Reserved Subdomains Implementation Guide](../reserved-subdomains-implementation.md)
- [ISO Metadata Standards RFC](../../rfc/rfc-004-iso-metadata-standards.md)
- [DAO Registry Specification RFC](../../rfc/rfc-001-dao-registry-specification.md)

### Related Services
- MetadataRegistryService
- ReservedSubdomainsService
- ENSResolverService
- MetadataCaptureService
- MetadataStorageService
- MetadataLinkingService
- MetadataAppraisalService

### Related Contracts
- ReservedSubdomains.sol
- DAORegistry.sol
- DataRegistry.sol

---

*This glossary is maintained as part of the DAO Registry documentation and should be updated when new schema terms are introduced or existing terms are modified.* 