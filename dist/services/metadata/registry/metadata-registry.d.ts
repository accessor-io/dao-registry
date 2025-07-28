/**
 * Metadata Registry Service
 * Implements ISO 23081-2:2021 metadata registry standards for DAO records
 */
export declare class MetadataRegistryService {
    private registry;
    private schemas;
    private encodingSchemes;
    private controlledVocabularies;
    constructor();
    /**
     * Register a new metadata schema
     */
    registerSchema(schema: SchemaDefinition): Promise<RegistrationResult>;
    /**
     * Retrieve a metadata schema by ID
     */
    getSchema(schemaId: string): Promise<SchemaDefinition | null>;
    /**
     * List all registered schemas
     */
    listSchemas(): Promise<SchemaSummary[]>;
    /**
     * Update an existing schema
     */
    updateSchema(schemaId: string, updates: Partial<SchemaDefinition>): Promise<UpdateResult>;
    /**
     * Delete a schema
     */
    deleteSchema(schemaId: string): Promise<DeleteResult>;
    /**
     * Register an encoding scheme
     */
    registerEncodingScheme(scheme: EncodingScheme): Promise<RegistrationResult>;
    /**
     * Get encoding scheme by ID
     */
    getEncodingScheme(schemeId: string): Promise<EncodingScheme | null>;
    /**
     * List all encoding schemes
     */
    listEncodingSchemes(): Promise<EncodingSchemeSummary[]>;
    /**
     * Register a controlled vocabulary
     */
    registerControlledVocabulary(vocabulary: ControlledVocabulary): Promise<RegistrationResult>;
    /**
     * Get controlled vocabulary by ID
     */
    getControlledVocabulary(vocabularyId: string): Promise<ControlledVocabulary | null>;
    /**
     * List all controlled vocabularies
     */
    listControlledVocabularies(): Promise<VocabularySummary[]>;
    /**
     * Design a metadata schema for managing records
     */
    designSchema(requirements: SchemaRequirements): Promise<SchemaDesign>;
    /**
     * Validate a metadata schema
     */
    validateSchema(schema: SchemaDefinition): Promise<ValidationResult>;
    /**
     * Generate machine-readable schema presentation
     */
    generateMachineReadableSchema(schemaId: string, format: SchemaFormat): Promise<string>;
    /**
     * Generate human-readable schema documentation
     */
    generateSchemaDocumentation(schemaId: string): Promise<SchemaDocumentation>;
    /**
     * Generate implementation code for a schema
     */
    generateImplementationCode(schemaId: string, language: ImplementationLanguage): Promise<string>;
    /**
     * Generate validation code for a schema
     */
    generateValidationCode(schemaId: string, framework: ValidationFramework): Promise<string>;
    private initializeDefaultSchemas;
    private initializeEncodingSchemes;
    private initializeControlledVocabularies;
    private createMetadataSchema;
    private createIdentitySchema;
    private createDescriptionSchema;
    private createUseSchema;
    private createEventSchema;
    private createRelationSchema;
    private generateSchemaId;
    private incrementVersion;
    private checkSchemaDependencies;
    private validateElement;
    private validateElementGroup;
    private validateEncodingScheme;
    private validateControlledVocabulary;
    private selectRequiredElements;
    private structureElements;
    private selectEncodingSchemes;
    private selectControlledVocabularies;
    private establishValidationRules;
    private establishObligationLevels;
    private establishDefaultValues;
    private generateXMLSchema;
    private generateRDFSchema;
    private generateYAMLSchema;
    private getEncodingSchemeDetails;
    private getVocabularyDetails;
    private generateTypeScriptCode;
    private generatePythonCode;
    private generateJavaCode;
    private generateCSharpCode;
    private generateZodValidation;
    private generateJoiValidation;
    private generateYupValidation;
    private generateJSONSchemaValidation;
}
interface SchemaDefinition {
    schemaId: string;
    schemaName: string;
    schemaVersion: string;
    description: string;
    elements: MetadataElement[];
    elementGroups: ElementGroup[];
    encodingSchemes: string[];
    controlledVocabularies: string[];
    validationRules: ValidationRule[];
    obligationLevels: ObligationLevel[];
    defaultValues: DefaultValue[];
    registrationDate: Date;
    lastModified: Date;
}
interface MetadataElement {
    elementId: string;
    elementName: string;
    elementDefinition: string;
    dataType: DataType;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    obligationLevel: ObligationLevel;
    repeatability: Repeatability;
    defaultValue?: any;
    parentElement?: string;
    childElements?: string[];
    relatedElements?: string[];
    controlledVocabulary?: string;
    encodingScheme?: string;
}
interface ElementGroup {
    groupId: string;
    groupName: string;
    description: string;
    elements: string[];
    parentGroup?: string;
    childGroups?: string[];
}
interface EncodingScheme {
    schemeId: string;
    schemeName: string;
    schemeType: SchemeType;
    schemeValues: SchemeValue[];
    validationRules: ValidationRule[];
    formatSpecification: string;
    schemeDescription: string;
    schemeAuthority: string;
    schemeVersion: string;
}
interface SchemeValue {
    value: string;
    label: string;
    definition?: string;
}
interface ControlledVocabulary {
    vocabularyId: string;
    vocabularyName: string;
    vocabularyType: VocabularyType;
    vocabularyVersion: string;
    vocabularyDescription: string;
    terms: VocabularyTerm[];
    vocabularyAuthority: string;
    vocabularyURI: string;
}
interface VocabularyTerm {
    termId: string;
    termLabel: string;
    termDefinition: string;
    broaderTerm?: string;
    narrowerTerms?: string[];
    relatedTerms?: string[];
}
interface ValidationRule {
    ruleId: string;
    ruleName: string;
    ruleType: RuleType;
    ruleExpression: string;
    ruleDescription: string;
    errorMessage: string;
}
interface ObligationLevel {
    levelId: string;
    levelName: string;
    levelDescription: string;
    isRequired: boolean;
    isConditional: boolean;
    condition?: string;
}
interface DefaultValue {
    elementId: string;
    defaultValue: any;
    valueType: string;
    valueDescription: string;
}
interface SchemaRequirements {
    domain: string;
    schemaName: string;
    description: string;
    businessRequirements: string[];
    technicalRequirements: string[];
    complianceRequirements: string[];
}
interface SchemaDesign {
    schemaId: string;
    schemaName: string;
    schemaVersion: string;
    description: string;
    elements: MetadataElement[];
    elementGroups: ElementGroup[];
    encodingSchemes: string[];
    controlledVocabularies: string[];
    validationRules: ValidationRule[];
    obligationLevels: ObligationLevel[];
    defaultValues: DefaultValue[];
}
interface RegistrationResult {
    success: boolean;
    schemaId: string;
    registrationTimestamp: Date;
    schemaVersion?: string;
    error?: string;
}
interface UpdateResult {
    success: boolean;
    schemaId: string;
    updateTimestamp: Date;
    newVersion: string;
    error?: string;
}
interface DeleteResult {
    success: boolean;
    schemaId: string;
    deletionTimestamp: Date;
    dependencies?: string[];
    error?: string;
}
interface ValidationResult {
    valid: boolean;
    errors: string[];
}
interface SchemaSummary {
    schemaId: string;
    schemaName: string;
    schemaVersion: string;
    description: string;
    elementCount: number;
    registrationDate: Date;
}
interface EncodingSchemeSummary {
    schemeId: string;
    schemeName: string;
    schemeType: SchemeType;
    schemeVersion: string;
    description: string;
    valueCount: number;
}
interface VocabularySummary {
    vocabularyId: string;
    vocabularyName: string;
    vocabularyType: VocabularyType;
    vocabularyVersion: string;
    description: string;
    termCount: number;
}
interface SchemaDocumentation {
    schemaId: string;
    schemaName: string;
    schemaVersion: string;
    description: string;
    elements: ElementDocumentation[];
    elementGroups: GroupDocumentation[];
    encodingSchemes: EncodingSchemeSummary[];
    controlledVocabularies: VocabularySummary[];
    validationRules: ValidationRule[];
    obligationLevels: ObligationLevel[];
    defaultValues: DefaultValue[];
}
interface ElementDocumentation {
    elementId: string;
    elementName: string;
    definition: string;
    dataType: DataType;
    obligationLevel: ObligationLevel;
    repeatability: Repeatability;
}
interface GroupDocumentation {
    groupId: string;
    groupName: string;
    description: string;
    elements: string[];
}
type DataType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'ARRAY' | 'OBJECT' | 'ENUM';
type Repeatability = 'NOT_REPEATABLE' | 'REPEATABLE';
type SchemeType = 'LANGUAGE_CODES' | 'COUNTRY_CODES' | 'CURRENCY_CODES' | 'TIME_CODES' | 'CUSTOM';
type VocabularyType = 'RECORD_CLASSIFICATION' | 'SECURITY_CLASSIFICATION' | 'BUSINESS_CLASSIFICATION' | 'TECHNICAL_CLASSIFICATION';
type RuleType = 'REGEX' | 'RANGE' | 'ENUM' | 'CUSTOM';
type SchemaFormat = 'JSON' | 'XML' | 'RDF' | 'YAML';
type ImplementationLanguage = 'TypeScript' | 'Python' | 'Java' | 'C#';
type ValidationFramework = 'Zod' | 'Joi' | 'Yup' | 'JSON Schema';
export default MetadataRegistryService;
//# sourceMappingURL=metadata-registry.d.ts.map