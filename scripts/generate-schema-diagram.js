const fs = require('fs');
const path = require('path');

// Mermaid diagram content
const mermaidDiagram = `
graph TB
    %% Administrator Actions
    Admin[Administrator] --> Init[Initialize Schema Creation]
    
    %% Schema Creation Process
    Init --> ValidateInput[Validate Input Parameters]
    ValidateInput --> CheckPermissions{Check Administrator Permissions}
    CheckPermissions -->|Authorized| ValidateSchema[Validate Schema Structure]
    CheckPermissions -->|Unauthorized| Error1[Error: Insufficient Permissions]
    
    %% Schema Validation
    ValidateSchema --> CheckFields{Validate Field Definitions}
    CheckFields -->|Valid| CheckMetadata[Validate Required Metadata]
    CheckFields -->|Invalid| Error2[Error: Invalid Field Structure]
    
    %% Metadata Validation
    CheckMetadata --> CheckPriority[Assign Priority Level]
    CheckPriority --> CRITICAL[CRITICAL: Core System Schemas]
    CheckPriority --> HIGH[HIGH: Important Operational]
    CheckPriority --> MEDIUM[MEDIUM: Standard Features]
    CheckPriority --> LOW[LOW: Optional Enhancements]
    
    %% Schema Storage
    CRITICAL --> StoreSchema[Store Schema in Contract State]
    HIGH --> StoreSchema
    MEDIUM --> StoreSchema
    LOW --> StoreSchema
    
    %% State Management
    StoreSchema --> UpdateStats[Update Statistics Counters]
    UpdateStats --> UpdateMappings[Update Storage Mappings]
    UpdateMappings --> EmitEvent[Emit SchemaDefined Event]
    
    %% Querying Process
    EmitEvent --> QuerySystem[Query System Initialization]
    QuerySystem --> OnChainQuery[On-Chain Schema Queries]
    QuerySystem --> OffChainQuery[Off-Chain API Queries]
    
    %% Schema Retrieval
    OnChainQuery --> GetSchema[Get Complete Schema Definition]
    OffChainQuery --> GetSchema
    GetSchema --> FieldQuery[Field-Level Queries]
    FieldQuery --> SchemaValidation[Schema Validation]
    
    %% Schema Updates
    SchemaValidation --> UpdateProcess[Schema Update Process]
    UpdateProcess --> StoreOldVersion[Store Old Version Info]
    StoreOldVersion --> RemoveOldSchema[Remove Old Schema]
    RemoveOldSchema --> AddNewSchema[Add New Schema]
    AddNewSchema --> UpdateVersion[Update Version Number]
    UpdateVersion --> EmitUpdateEvent[Emit SchemaUpdated Event]
    
    %% Schema Removal
    EmitUpdateEvent --> RemovalProcess[Schema Removal Process]
    RemovalProcess --> DecrementStats[Decrement Statistics Counters]
    DecrementStats --> ClearMappings[Clear Storage Mappings]
    ClearMappings --> RemoveReferences[Remove All References]
    RemoveReferences --> EmitRemovalEvent[Emit SchemaDeprecated Event]
    
    %% Access Control
    EmitRemovalEvent --> AccessControl[Multi-Tier Access Control]
    AccessControl --> Owner[Contract Owner: Full Privileges]
    AccessControl --> Admin[Administrators: Schema Management]
    AccessControl --> Moderator[Moderators: Data Management]
    AccessControl --> DataProvider[Data Providers: CCIP Data Storage]
    
    %% CCIP Integration
    DataProvider --> CCIPIntegration[CCIP Cross-Chain Integration]
    CCIPIntegration --> StandardizedData[Standardized Data Source]
    StandardizedData --> CrossChainQuery[Cross-Chain Applications]
    CrossChainQuery --> UnifiedDataLayer[Unified Data Layer]
    
    %% Event System
    UnifiedDataLayer --> EventSystem[Comprehensive Event Logging]
    EventSystem --> SchemaEvents[Schema Creation/Update/Removal Events]
    EventSystem --> UsageEvents[Usage Pattern Tracking]
    EventSystem --> AuditTrail[Audit Trail Maintenance]
    
    %% Statistical Tracking
    AuditTrail --> Statistics[Statistical Tracking System]
    Statistics --> TotalSchemas[Total Schema Count]
    Statistics --> PriorityStats[Schemas by Priority Level]
    Statistics --> CategoryStats[Schemas by Category]
    Statistics --> UsageTrends[Usage Trend Analysis]
    
    %% Error Handling
    UsageTrends --> ErrorHandling[Comprehensive Error Handling]
    ErrorHandling --> InputValidation[Input Validation]
    ErrorHandling --> BusinessLogic[Business Logic Validation]
    ErrorHandling --> DescriptiveErrors[Descriptive Error Messages]
    
    %% Gas Optimization
    DescriptiveErrors --> GasOptimization[Gas-Efficient Operations]
    GasOptimization --> OptimizedStorage[Optimized Storage Patterns]
    GasOptimization --> ModularDesign[Modular Design]
    GasOptimization --> EasyExtension[Easy Extension Capability]
    
    %% External Integration
    EasyExtension --> ExternalIntegration[External System Integration]
    ExternalIntegration --> APIEndpoints[API Endpoint Discovery]
    ExternalIntegration --> DocumentationURLs[Documentation URL Access]
    ExternalIntegration --> WebApps[Web Application Integration]
    ExternalIntegration --> MobileApps[Mobile App Integration]
    ExternalIntegration --> BlockchainSystems[Other Blockchain Systems]
    
    %% Validation System
    BlockchainSystems --> ValidationSystem[Data Integrity Validation]
    ValidationSystem --> SchemaLevel[Schema-Level Validation]
    ValidationSystem --> FieldLevel[Field-Level Validation]
    ValidationSystem --> CustomRules[Custom Validation Rules]
    ValidationSystem --> DataCorruption[Prevent Data Corruption]
    
    %% Version Control
    DataCorruption --> VersionControl[Version Control System]
    VersionControl --> SemanticVersioning[Semantic Versioning]
    VersionControl --> BackwardCompatibility[Backward Compatibility]
    VersionControl --> GradualTransitions[Gradual Schema Transitions]
    VersionControl --> BreakingChanges[Prevent Breaking Changes]
    
    %% Category System
    BreakingChanges --> CategorySystem[Organizational Category System]
    CategorySystem --> FunctionGrouping[Function-Based Grouping]
    CategorySystem --> DomainGrouping[Domain-Based Grouping]
    CategorySystem --> EfficientQuerying[Efficient Schema Querying]
    CategorySystem --> Discovery[Schema Discovery]
    
    %% Final Integration
    Discovery --> FinalIntegration[Final System Integration]
    FinalIntegration --> InteroperableApps[Interoperable Applications]
    FinalIntegration --> CrossChainPlatforms[Cross-Chain Platform Support]
    FinalIntegration --> DAOPlatforms[DAO Platform Compatibility]
    FinalIntegration --> FutureProof[Future-Proof Architecture]
    
    %% Error Handling Connections
    Error1 --> ErrorHandling
    Error2 --> ErrorHandling
    
    %% Styling
    classDef adminAction fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef validation fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef storage fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef integration fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class Admin,Init adminAction
    class ValidateInput,CheckPermissions,ValidateSchema,CheckFields,CheckMetadata,CheckPriority validation
    class StoreSchema,UpdateStats,UpdateMappings,EmitEvent,GetSchema,FieldQuery storage
    class CCIPIntegration,StandardizedData,CrossChainQuery,UnifiedDataLayer,ExternalIntegration integration
    class Error1,Error2 error
`;

// HTML template for rendering the diagram
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Schema Management Process Flow</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .mermaid {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>DAO Registry - Schema Management Process Flow</h1>
        <div class="mermaid">
            ${mermaidDiagram}
        </div>
    </div>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    </script>
</body>
</html>
`;

// Create the HTML file
const outputDir = path.join(__dirname, '..', 'docs', 'images');
const htmlFile = path.join(outputDir, 'schema-management-flow.html');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write the HTML file
fs.writeFileSync(htmlFile, htmlTemplate);

console.log('Schema management flow diagram generated!');
console.log(`HTML file created: ${htmlFile}`);
console.log('Open the HTML file in a browser to view the diagram');
console.log('You can also use browser automation tools to convert to PNG/SVG');

// Also create a simplified version for better rendering
const simplifiedDiagram = `
graph TB
    Admin[Administrator] --> Init[Initialize Schema Creation]
    Init --> ValidateInput[Validate Input Parameters]
    ValidateInput --> CheckPermissions{Check Permissions}
    CheckPermissions -->|Authorized| ValidateSchema[Validate Schema Structure]
    CheckPermissions -->|Unauthorized| Error1[Error: Insufficient Permissions]
    
    ValidateSchema --> CheckFields{Validate Fields}
    CheckFields -->|Valid| CheckMetadata[Validate Metadata]
    CheckFields -->|Invalid| Error2[Error: Invalid Structure]
    
    CheckMetadata --> CheckPriority[Assign Priority Level]
    CheckPriority --> CRITICAL[CRITICAL: Core System]
    CheckPriority --> HIGH[HIGH: Important Operational]
    CheckPriority --> MEDIUM[MEDIUM: Standard Features]
    CheckPriority --> LOW[LOW: Optional Enhancements]
    
    CRITICAL --> StoreSchema[Store Schema]
    HIGH --> StoreSchema
    MEDIUM --> StoreSchema
    LOW --> StoreSchema
    
    StoreSchema --> UpdateStats[Update Statistics]
    UpdateStats --> EmitEvent[Emit SchemaDefined Event]
    
    EmitEvent --> QuerySystem[Query System]
    QuerySystem --> OnChainQuery[On-Chain Queries]
    QuerySystem --> OffChainQuery[Off-Chain API Queries]
    
    OnChainQuery --> GetSchema[Get Schema Definition]
    OffChainQuery --> GetSchema
    GetSchema --> FieldQuery[Field-Level Queries]
    
    FieldQuery --> UpdateProcess[Schema Update Process]
    UpdateProcess --> StoreOldVersion[Store Old Version]
    StoreOldVersion --> RemoveOldSchema[Remove Old Schema]
    RemoveOldSchema --> AddNewSchema[Add New Schema]
    AddNewSchema --> EmitUpdateEvent[Emit SchemaUpdated Event]
    
    EmitUpdateEvent --> AccessControl[Access Control]
    AccessControl --> Owner[Contract Owner]
    AccessControl --> Admin[Administrators]
    AccessControl --> Moderator[Moderators]
    AccessControl --> DataProvider[Data Providers]
    
    DataProvider --> CCIPIntegration[CCIP Integration]
    CCIPIntegration --> StandardizedData[Standardized Data]
    StandardizedData --> CrossChainQuery[Cross-Chain Apps]
    CrossChainQuery --> UnifiedDataLayer[Unified Data Layer]
    
    UnifiedDataLayer --> EventSystem[Event Logging]
    EventSystem --> Statistics[Statistics Tracking]
    Statistics --> ErrorHandling[Error Handling]
    ErrorHandling --> GasOptimization[Gas Optimization]
    GasOptimization --> ExternalIntegration[External Integration]
    ExternalIntegration --> ValidationSystem[Data Validation]
    ValidationSystem --> VersionControl[Version Control]
    VersionControl --> CategorySystem[Category System]
    CategorySystem --> FinalIntegration[Final Integration]
    FinalIntegration --> InteroperableApps[Interoperable Apps]
    
    Error1 --> ErrorHandling
    Error2 --> ErrorHandling
    
    classDef adminAction fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef validation fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef storage fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef integration fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class Admin,Init adminAction
    class ValidateInput,CheckPermissions,ValidateSchema,CheckFields,CheckMetadata,CheckPriority validation
    class StoreSchema,UpdateStats,EmitEvent,GetSchema,FieldQuery storage
    class CCIPIntegration,StandardizedData,CrossChainQuery,UnifiedDataLayer,ExternalIntegration integration
    class Error1,Error2 error
`;

const simplifiedHtmlFile = path.join(outputDir, 'schema-management-flow-simplified.html');
const simplifiedHtmlTemplate = htmlTemplate.replace(mermaidDiagram, simplifiedDiagram);
fs.writeFileSync(simplifiedHtmlFile, simplifiedHtmlTemplate);

console.log(`Simplified HTML file created: ${simplifiedHtmlFile}`);
console.log('The simplified version may render better in browsers');
console.log('Both files are ready for viewing and conversion to images'); 