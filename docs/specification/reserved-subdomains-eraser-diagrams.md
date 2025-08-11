# Reserved Subdomains Eraser Diagrams

## Overview

This specification defines Eraser diagrams for the DAO Registry reserved subdomains system using the official [Eraser syntax](https://docs.eraser.io/docs/syntax). The diagrams provide clear visual representation of the system architecture, entities, and relationships.

## Table of Contents

1. [System Architecture Diagram](#system-architecture-diagram)
2. [Priority-Based Architecture](#priority-based-architecture)
3. [Category-Based Architecture](#category-based-architecture)
4. [ENS Integration Architecture](#ens-integration-architecture)
5. [Validation Flow Architecture](#validation-flow-architecture)
6. [Complete System Overview](#complete-system-overview)

## System Architecture Diagram

### Main DAO Registry System
```eraser
direction right

DAO_Registry [icon: database, color: blue] {
  Registry_Core [icon: server]
  Metadata_Store [icon: storage]
  Validation_Engine [icon: engine]
}

Reserved_Subdomains [icon: shield, color: red] {
  Critical_Subdomains [icon: warning]
  High_Priority_Subdomains [icon: alert]
  Medium_Priority_Subdomains [icon: info]
}

ENS_Integration [icon: globe, color: green] {
  ENS_Registry [icon: database]
  ENS_Resolver [icon: link]
  Domain_Ownership [icon: key]
}

Validation_System [icon: check, color: orange] {
  Validation_Rules [icon: rules]
  Validation_Results [icon: results]
  Reserved_Patterns [icon: pattern]
}

DAO_Registry > Reserved_Subdomains: manages
DAO_Registry > ENS_Integration: owns
Reserved_Subdomains > Validation_System: enforces
ENS_Integration > Validation_System: validates
```

## Priority-Based Architecture

### Priority Hierarchy System
```eraser
direction down

Critical_Priority [icon: warning, color: red] {
  governance [icon: crown]
  treasury [icon: dollar]
  token [icon: coin]
  docs [icon: book]
  forum [icon: users]
  analytics [icon: chart]
  admin [icon: admin]
  system [icon: system]
}

High_Priority [icon: alert, color: orange] {
  voting [icon: vote]
  proposals [icon: document]
  executive [icon: executive]
  council [icon: council]
  vault [icon: vault]
  rewards [icon: gift]
  staking [icon: lock]
  liquidity [icon: liquid]
}

Medium_Priority [icon: info, color: yellow] {
  faq [icon: question]
  help [icon: help]
  support [icon: support]
  news [icon: news]
  announcements [icon: announcement]
  monitor [icon: monitor]
  status [icon: status]
  health [icon: health]
}

Validation_Rules [icon: rules, color: purple]

Critical_Priority > Validation_Rules: enforces_critical
High_Priority > Validation_Rules: enforces_high
Medium_Priority > Validation_Rules: enforces_medium
```

## Category-Based Architecture

### Core DAO Components
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Governance_Components [icon: crown, color: purple] {
  governance [icon: crown]
  voting [icon: vote]
  proposals [icon: document]
  executive [icon: executive]
  council [icon: council]
}

Financial_Components [icon: dollar, color: green] {
  treasury [icon: dollar]
  vault [icon: vault]
  rewards [icon: gift]
  staking [icon: lock]
  liquidity [icon: liquid]
}

Token_Components [icon: coin, color: gold] {
  token [icon: coin]
  erc20 [icon: token]
  nft [icon: nft]
  vesting [icon: vesting]
  airdrop [icon: airdrop]
}

DAO_Registry > Governance_Components: manages_governance
DAO_Registry > Financial_Components: manages_financial
DAO_Registry > Token_Components: manages_token
```

### Documentation & Information
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Documentation_Components [icon: book, color: blue] {
  docs [icon: book]
  wiki [icon: wiki]
  guide [icon: guide]
  api [icon: api]
  spec [icon: spec]
}

Information_Components [icon: info, color: cyan] {
  info [icon: info]
  about [icon: about]
  faq [icon: question]
  help [icon: help]
  support [icon: support]
}

DAO_Registry > Documentation_Components: manages_documentation
DAO_Registry > Information_Components: manages_information
```

### Community & Communication
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Community_Components [icon: users, color: pink] {
  forum [icon: users]
  chat [icon: chat]
  discord [icon: discord]
  telegram [icon: telegram]
  reddit [icon: reddit]
}

Communication_Components [icon: message, color: teal] {
  blog [icon: blog]
  news [icon: news]
  announcements [icon: announcement]
  updates [icon: update]
}

DAO_Registry > Community_Components: manages_community
DAO_Registry > Communication_Components: manages_communication
```

### Analytics & Monitoring
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Analytics_Components [icon: chart, color: cyan] {
  analytics [icon: chart]
  stats [icon: stats]
  metrics [icon: metrics]
  dashboard [icon: dashboard]
  reports [icon: reports]
}

Monitoring_Components [icon: monitor, color: orange] {
  monitor [icon: monitor]
  status [icon: status]
  health [icon: health]
  alerts [icon: alert]
}

DAO_Registry > Analytics_Components: manages_analytics
DAO_Registry > Monitoring_Components: manages_monitoring
```

### Development & Technical
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Development_Components [icon: code, color: purple] {
  dev [icon: code]
  github [icon: github]
  code [icon: code]
  test [icon: test]
  staging [icon: staging]
}

Technical_Components [icon: tech, color: gray] {
  tech [icon: tech]
  protocol [icon: protocol]
  contracts [icon: contract]
  audit [icon: audit]
  security [icon: security]
}

DAO_Registry > Development_Components: manages_development
DAO_Registry > Technical_Components: manages_technical
```

### Governance & Legal
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Governance_Legal_Components [icon: gov, color: purple] {
  gov [icon: gov]
  constitution [icon: constitution]
  bylaws [icon: bylaws]
  policies [icon: policies]
}

Compliance_Components [icon: compliance, color: red] {
  compliance [icon: compliance]
  regulatory [icon: regulatory]
  kyc [icon: kyc]
  aml [icon: aml]
}

DAO_Registry > Governance_Legal_Components: manages_governance_legal
DAO_Registry > Compliance_Components: manages_compliance
```

### Marketing & Brand
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Marketing_Components [icon: marketing, color: pink] {
  marketing [icon: marketing]
  brand [icon: brand]
  media [icon: media]
  press [icon: press]
}

Social_Components [icon: social, color: blue] {
  social [icon: social]
  twitter [icon: twitter]
  linkedin [icon: linkedin]
  youtube [icon: youtube]
}

DAO_Registry > Marketing_Components: manages_marketing
DAO_Registry > Social_Components: manages_social
```

### Administrative
```eraser
direction right

DAO_Registry [icon: database, color: blue]

Administrative_Components [icon: admin, color: gray] {
  admin [icon: admin]
  manage [icon: manage]
  settings [icon: settings]
  config [icon: config]
}

System_Components [icon: system, color: red] {
  system [icon: system]
  service [icon: service]
  maintenance [icon: maintenance]
  backup [icon: backup]
}

DAO_Registry > Administrative_Components: manages_administrative
DAO_Registry > System_Components: manages_system
```

## ENS Integration Architecture

### ENS System Integration
```eraser
direction right

DAO_Registry [icon: database, color: blue]

ENS_Registry [icon: globe, color: green] {
  Domain_Registration [icon: register]
  Owner_Management [icon: owner]
  Resolver_Configuration [icon: resolver]
}

ENS_Resolver [icon: link, color: blue] {
  Address_Resolution [icon: resolve]
  Interface_Management [icon: interface]
  Method_Handling [icon: method]
}

ENS_Domain_Ownership [icon: key, color: purple] {
  Ownership_Tracking [icon: track]
  Transfer_History [icon: transfer]
  Access_Control [icon: access]
}

DAO_Registry > ENS_Registry: registers
ENS_Registry > ENS_Resolver: configures
ENS_Registry > ENS_Domain_Ownership: tracks
```

## Validation Flow Architecture

### Subdomain Validation System
```eraser
direction down

Subdomain_Input [icon: input, color: gray] {
  Proposed_Subdomain [icon: text]
  Parent_Domain [icon: domain]
  Validation_Request [icon: request]
}

Validation_Engine [icon: engine, color: orange] {
  Format_Check [icon: check]
  Reserved_Word_Check [icon: shield]
  ENS_Availability_Check [icon: globe]
  Priority_Check [icon: priority]
}

Validation_Rules [icon: rules, color: red] {
  Critical_Rules [icon: warning]
  High_Priority_Rules [icon: alert]
  Medium_Priority_Rules [icon: info]
  Pattern_Rules [icon: pattern]
}

Validation_Results [icon: results, color: green] {
  Valid_Result [icon: success]
  Invalid_Result [icon: error]
  Error_Messages [icon: message]
  Validation_Log [icon: log]
}

Subdomain_Input > Validation_Engine: processes
Validation_Engine > Validation_Rules: applies
Validation_Rules > Validation_Results: produces
```

## Complete System Overview

### Full DAO Registry Architecture
```eraser
direction right

DAO_Registry [icon: database, color: blue] {
  Core_Registry [icon: server]
  Metadata_Management [icon: metadata]
  Access_Control [icon: access]
}

Reserved_Subdomains_System [icon: shield, color: red] {
  Critical_Subdomains [icon: warning, color: red] {
    governance [icon: crown]
    treasury [icon: dollar]
    token [icon: coin]
    docs [icon: book]
    forum [icon: users]
    analytics [icon: chart]
    admin [icon: admin]
    system [icon: system]
  }
  
  High_Priority_Subdomains [icon: alert, color: orange] {
    voting [icon: vote]
    proposals [icon: document]
    executive [icon: executive]
    council [icon: council]
    vault [icon: vault]
    rewards [icon: gift]
    staking [icon: lock]
    liquidity [icon: liquid]
  }
  
  Medium_Priority_Subdomains [icon: info, color: yellow] {
    faq [icon: question]
    help [icon: help]
    support [icon: support]
    news [icon: news]
    announcements [icon: announcement]
    monitor [icon: monitor]
    status [icon: status]
    health [icon: health]
  }
}

ENS_Integration_System [icon: globe, color: green] {
  ENS_Registry [icon: database]
  ENS_Resolver [icon: link]
  Domain_Ownership [icon: key]
}

Validation_System [icon: check, color: orange] {
  Validation_Rules [icon: rules]
  Validation_Results [icon: results]
  Reserved_Patterns [icon: pattern]
}

Category_Management [icon: folder, color: purple] {
  Governance_Components [icon: crown]
  Financial_Components [icon: dollar]
  Token_Components [icon: coin]
  Documentation_Components [icon: book]
  Information_Components [icon: info]
  Community_Components [icon: users]
  Communication_Components [icon: message]
  Analytics_Components [icon: chart]
  Monitoring_Components [icon: monitor]
  Development_Components [icon: code]
  Technical_Components [icon: tech]
  Governance_Legal_Components [icon: gov]
  Compliance_Components [icon: compliance]
  Marketing_Components [icon: marketing]
  Social_Components [icon: social]
  Administrative_Components [icon: admin]
  System_Components [icon: system]
}

DAO_Registry > Reserved_Subdomains_System: manages
DAO_Registry > ENS_Integration_System: owns
DAO_Registry > Validation_System: validates
DAO_Registry > Category_Management: organizes

Reserved_Subdomains_System > Validation_System: enforces
ENS_Integration_System > Validation_System: validates
Category_Management > Validation_System: validates
```

## Styling Options

### Color Modes
```eraser
colorMode pastel

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

```eraser
colorMode bold

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

```eraser
colorMode outline

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

### Style Modes
```eraser
styleMode shadow

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

```eraser
styleMode plain

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

```eraser
styleMode watercolor

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

### Typeface Options
```eraser
typeface rough

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

```eraser
typeface clean

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

```eraser
typeface mono

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
```

## Connection Types

### Different Connection Styles
```eraser
direction right

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]
Validation_System [icon: check, color: orange]

DAO_Registry > Reserved_Subdomains: manages
DAO_Registry < ENS_Integration: owns
DAO_Registry <> Validation_System: validates
Reserved_Subdomains - ENS_Integration: relates
```

### Labeled Connections
```eraser
direction right

DAO_Registry [icon: database, color: blue]
Reserved_Subdomains [icon: shield, color: red]
ENS_Integration [icon: globe, color: green]

DAO_Registry > Reserved_Subdomains: manages_subdomains
DAO_Registry > ENS_Integration: owns_domains
Reserved_Subdomains > ENS_Integration: validates_registration
```

### One-to-Many Connections
```eraser
direction right

DAO_Registry [icon: database, color: blue]
Governance_Components [icon: crown, color: purple]
Financial_Components [icon: dollar, color: green]
Token_Components [icon: coin, color: gold]

DAO_Registry > Governance_Components, Financial_Components, Token_Components: manages
```

This Eraser diagram specification provides comprehensive visual representation of the DAO registry reserved subdomains system using the official [Eraser syntax](https://docs.eraser.io/docs/syntax), with proper nodes, groups, properties, connections, and styling options. 