# Reserved Subdomains Diagram Language Specification

## Overview

This specification defines a diagram language for visualizing DAO registry relationships, subdomain hierarchies, and system architecture. The language provides a comprehensive way to represent the reserved subdomains system, ENS relationships, and DAO registry components.

## Table of Contents

1. [Language Fundamentals](#language-fundamentals)
2. [Entity Definitions](#entity-definitions)
3. [Relationship Types](#relationship-types)
4. [Subdomain Categories](#subdomain-categories)
5. [Priority Visualization](#priority-visualization)
6. [ENS Integration](#ens-integration)
7. [System Architecture](#system-architecture)
8. [Diagram Properties](#diagram-properties)
9. [Examples](#examples)

## Language Fundamentals

### Basic Syntax

```mermaid
# Define diagram properties
title DAO Registry Subdomain Architecture
colorMode pastel
styleMode shadow
typeface clean
notation crows-foot

# Define entities
dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
  owner address
  created_at timestamp
}

reserved_subdomains [icon: shield, color: red] {
  subdomain string pk
  priority integer
  category string
  description string
  is_critical boolean
}

ens_domains [icon: globe, color: green] {
  domain string pk
  owner address
  resolver address
  ttl integer
}

validation_rules [icon: check, color: orange] {
  rule_id string pk
  rule_type string
  pattern string
  priority integer
  is_active boolean
}
```

## Entity Definitions

### Core Entities

#### DAO Registry Entity
```mermaid
dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
  owner address
  created_at timestamp
  updated_at timestamp
  status string
  metadata json
}
```

#### Reserved Subdomains Entity
```mermaid
reserved_subdomains [icon: shield, color: red] {
  subdomain string pk
  priority integer
  category string
  description string
  is_critical boolean
  created_at timestamp
  updated_at timestamp
}
```

#### ENS Domains Entity
```mermaid
ens_domains [icon: globe, color: green] {
  domain string pk
  owner address
  resolver address
  ttl integer
  created_at timestamp
  updated_at timestamp
}
```

#### Validation Rules Entity
```mermaid
validation_rules [icon: check, color: orange] {
  rule_id string pk
  rule_type string
  pattern string
  priority integer
  is_active boolean
  created_at timestamp
  updated_at timestamp
}
```

### Subdomain Category Entities

#### Core DAO Components
```mermaid
governance_subdomains [icon: crown, color: purple] {
  subdomain string pk
  purpose string
  priority integer
  example string
}

financial_subdomains [icon: dollar, color: green] {
  subdomain string pk
  purpose string
  priority integer
  example string
}

token_subdomains [icon: coin, color: gold] {
  subdomain string pk
  purpose string
  priority integer
  example string
}
```

#### Documentation & Information
```mermaid
documentation_subdomains [icon: book, color: blue] {
  subdomain string pk
  purpose string
  priority integer
  example string
}

information_subdomains [icon: info, color: cyan] {
  subdomain string pk
  purpose string
  priority integer
  example string
}
```

#### Community & Communication
```mermaid
community_subdomains [icon: users, color: pink] {
  subdomain string pk
  purpose string
  priority integer
  example string
}

communication_subdomains [icon: message, color: teal] {
  subdomain string pk
  purpose string
  priority integer
  example string
}
```

## Relationship Types

### Primary Relationships

#### One-to-Many Relationships
```mermaid
# DAO Registry to Reserved Subdomains
dao_registry.id *> reserved_subdomains.dao_id

# DAO Registry to ENS Domains
dao_registry.id *> ens_domains.dao_id

# Reserved Subdomains to Validation Rules
reserved_subdomains.subdomain *> validation_rules.subdomain
```

#### Many-to-Many Relationships
```mermaid
# DAO Registry to Subdomain Categories
dao_registry.id <> governance_subdomains.dao_id
dao_registry.id <> financial_subdomains.dao_id
dao_registry.id <> token_subdomains.dao_id
dao_registry.id <> documentation_subdomains.dao_id
dao_registry.id <> information_subdomains.dao_id
dao_registry.id <> community_subdomains.dao_id
dao_registry.id <> communication_subdomains.dao_id
```

#### One-to-One Relationships
```mermaid
# ENS Domain to DAO Registry
ens_domains.domain - dao_registry.domain

# Validation Rule to Reserved Subdomain
validation_rules.rule_id - reserved_subdomains.validation_rule_id
```

### Priority Relationships

#### Critical Priority Relationships
```mermaid
critical_subdomains [icon: warning, color: red] {
  subdomain string pk
  priority integer
  category string
  description string
}

# Critical subdomains are never available
critical_subdomains.subdomain *> validation_rules.subdomain : [color: red, style: dashed]
```

#### High Priority Relationships
```mermaid
high_priority_subdomains [icon: alert, color: orange] {
  subdomain string pk
  priority integer
  category string
  description string
}

# High priority subdomains require special permission
high_priority_subdomains.subdomain *> validation_rules.subdomain : [color: orange, style: dotted]
```

#### Medium Priority Relationships
```mermaid
medium_priority_subdomains [icon: info, color: yellow] {
  subdomain string pk
  priority integer
  category string
  description string
}

# Medium priority subdomains available with registration
medium_priority_subdomains.subdomain *> validation_rules.subdomain : [color: yellow, style: solid]
```

## Subdomain Categories

### Core DAO Components Diagram
```mermaid
title Core DAO Components Subdomain Categories

governance_subdomains [icon: crown, color: purple] {
  governance string pk
  voting string
  proposals string
  executive string
  council string
}

financial_subdomains [icon: dollar, color: green] {
  treasury string pk
  vault string
  rewards string
  staking string
  liquidity string
}

token_subdomains [icon: coin, color: gold] {
  token string pk
  erc20 string
  nft string
  vesting string
  airdrop string
}

# Relationships
governance_subdomains.governance *> dao_registry.id
financial_subdomains.treasury *> dao_registry.id
token_subdomains.token *> dao_registry.id
```

### Documentation & Information Diagram
```mermaid
title Documentation & Information Subdomain Categories

documentation_subdomains [icon: book, color: blue] {
  docs string pk
  wiki string
  guide string
  api string
  spec string
}

information_subdomains [icon: info, color: cyan] {
  info string pk
  about string
  faq string
  help string
  support string
}

# Relationships
documentation_subdomains.docs *> dao_registry.id
information_subdomains.info *> dao_registry.id
```

### Community & Communication Diagram
```mermaid
title Community & Communication Subdomain Categories

community_subdomains [icon: users, color: pink] {
  forum string pk
  chat string
  discord string
  telegram string
  reddit string
}

communication_subdomains [icon: message, color: teal] {
  blog string pk
  news string
  announcements string
  updates string
}

# Relationships
community_subdomains.forum *> dao_registry.id
communication_subdomains.blog *> dao_registry.id
```

## Priority Visualization

### Priority Hierarchy Diagram
```mermaid
title Reserved Subdomains Priority Hierarchy

critical_priority [icon: warning, color: red] {
  governance string pk
  treasury string
  token string
  docs string
  forum string
  analytics string
  admin string
  system string
}

high_priority [icon: alert, color: orange] {
  voting string pk
  proposals string
  executive string
  council string
  vault string
  rewards string
  staking string
  liquidity string
}

medium_priority [icon: info, color: yellow] {
  faq string pk
  help string
  support string
  news string
  announcements string
  monitor string
  status string
  health string
}

# Priority relationships
critical_priority *> validation_rules : [color: red, style: dashed]
high_priority *> validation_rules : [color: orange, style: dotted]
medium_priority *> validation_rules : [color: yellow, style: solid]
```

## ENS Integration

### ENS Domain Relationships
```mermaid
title ENS Integration Architecture

ens_registry [icon: globe, color: green] {
  domain string pk
  owner address
  resolver address
  ttl integer
}

ens_resolver [icon: link, color: blue] {
  address string pk
  interface string
  methods json
}

dao_registry [icon: database, color: purple] {
  id string pk
  name string
  domain string
  owner address
}

# Relationships
ens_registry.domain *> ens_resolver.address
dao_registry.domain *> ens_registry.domain
ens_resolver.address *> dao_registry.owner
```

### Subdomain Validation Flow
```mermaid
title Subdomain Validation Flow

subdomain_input [icon: input, color: gray] {
  subdomain string
  parent_domain string
  proposed_name string
}

validation_engine [icon: engine, color: orange] {
  format_check boolean
  reserved_check boolean
  ens_check boolean
  priority_check integer
}

validation_rules [icon: rules, color: red] {
  rule_id string pk
  rule_type string
  pattern string
  priority integer
}

reserved_subdomains [icon: shield, color: red] {
  subdomain string pk
  priority integer
  category string
}

# Validation flow
subdomain_input *> validation_engine
validation_engine *> validation_rules
validation_rules *> reserved_subdomains
validation_engine *> reserved_subdomains
```

## System Architecture

### Complete System Architecture
```mermaid
title DAO Registry System Architecture

frontend [icon: monitor, color: blue] {
  ui_components json
  user_interface string
  validation_client boolean
}

api_gateway [icon: gateway, color: green] {
  endpoints json
  authentication boolean
  rate_limiting boolean
}

backend_services [icon: server, color: purple] {
  dao_service string
  validation_service string
  ens_service string
  reserved_subdomains_service string
}

database [icon: database, color: orange] {
  dao_registry table
  reserved_subdomains table
  validation_rules table
  ens_domains table
}

blockchain [icon: blockchain, color: red] {
  smart_contracts json
  ens_registry address
  dao_registry_contract address
}

# System relationships
frontend *> api_gateway
api_gateway *> backend_services
backend_services *> database
backend_services *> blockchain
database *> blockchain
```

### Service Layer Architecture
```mermaid
title Service Layer Architecture

dao_service [icon: service, color: blue] {
  create_dao function
  update_dao function
  delete_dao function
  get_dao function
}

validation_service [icon: service, color: orange] {
  validate_subdomain function
  check_reserved_words function
  validate_format function
  check_ens_availability function
}

ens_service [icon: service, color: green] {
  resolve_domain function
  check_ownership function
  register_subdomain function
  update_resolver function
}

reserved_subdomains_service [icon: service, color: red] {
  is_reserved function
  get_priority function
  get_reserved_words function
  validate_reserved_word function
}

# Service relationships
dao_service *> validation_service
validation_service *> reserved_subdomains_service
validation_service *> ens_service
ens_service *> reserved_subdomains_service
```

## Diagram Properties

### Color Schemes

#### Priority-Based Colors
```mermaid
# Critical Priority - Red
critical_entities [icon: warning, color: red] {
  entity string
  priority integer
}

# High Priority - Orange
high_priority_entities [icon: alert, color: orange] {
  entity string
  priority integer
}

# Medium Priority - Yellow
medium_priority_entities [icon: info, color: yellow] {
  entity string
  priority integer
}

# Available - Green
available_entities [icon: check, color: green] {
  entity string
  priority integer
}
```

#### Category-Based Colors
```mermaid
# Core DAO Components - Purple
core_components [icon: crown, color: purple] {
  governance string
  treasury string
  token string
}

# Documentation - Blue
documentation [icon: book, color: blue] {
  docs string
  wiki string
  guide string
}

# Community - Pink
community [icon: users, color: pink] {
  forum string
  chat string
  discord string
}

# Analytics - Cyan
analytics [icon: chart, color: cyan] {
  analytics string
  stats string
  metrics string
}
```

### Style Modes

#### Shadow Mode
```mermaid
styleMode shadow

dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
}

reserved_subdomains [icon: shield, color: red] {
  subdomain string pk
  priority integer
}

dao_registry.id *> reserved_subdomains.dao_id
```

#### Plain Mode
```mermaid
styleMode plain

dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
}

reserved_subdomains [icon: shield, color: red] {
  subdomain string pk
  priority integer
}

dao_registry.id *> reserved_subdomains.dao_id
```

#### Watercolor Mode
```mermaid
styleMode watercolor

dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
}

reserved_subdomains [icon: shield, color: red] {
  subdomain string pk
  priority integer
}

dao_registry.id *> reserved_subdomains.dao_id
```

### Typeface Options

#### Clean Typeface
```mermaid
typeface clean

dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
}
```

#### Rough Typeface
```mermaid
typeface rough

dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
}
```

#### Mono Typeface
```mermaid
typeface mono

dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
}
```

## Examples

### Complete DAO Registry Diagram
```mermaid
title Complete DAO Registry System

# Define diagram properties
colorMode pastel
styleMode shadow
typeface clean
notation crows-foot

# Core entities
dao_registry [icon: database, color: blue] {
  id string pk
  name string
  domain string
  owner address
  created_at timestamp
}

reserved_subdomains [icon: shield, color: red] {
  subdomain string pk
  priority integer
  category string
  description string
}

ens_domains [icon: globe, color: green] {
  domain string pk
  owner address
  resolver address
  ttl integer
}

validation_rules [icon: check, color: orange] {
  rule_id string pk
  rule_type string
  pattern string
  priority integer
}

# Relationships
dao_registry.id *> reserved_subdomains.dao_id
dao_registry.domain *> ens_domains.domain
reserved_subdomains.subdomain *> validation_rules.subdomain
ens_domains.domain *> validation_rules.domain

# Comments
// DAO Registry manages reserved subdomains
// ENS domains are linked to DAO registry
// Validation rules apply to all subdomains
```

### Priority-Based Subdomain Management
```mermaid
title Priority-Based Subdomain Management

# Critical Priority
critical_subdomains [icon: warning, color: red] {
  governance string pk
  treasury string
  token string
  docs string
  forum string
  analytics string
  admin string
  system string
}

# High Priority
high_priority_subdomains [icon: alert, color: orange] {
  voting string pk
  proposals string
  executive string
  council string
  vault string
  rewards string
  staking string
  liquidity string
}

# Medium Priority
medium_priority_subdomains [icon: info, color: yellow] {
  faq string pk
  help string
  support string
  news string
  announcements string
  monitor string
  status string
  health string
}

# Relationships with validation
critical_subdomains *> validation_rules : [color: red, style: dashed]
high_priority_subdomains *> validation_rules : [color: orange, style: dotted]
medium_priority_subdomains *> validation_rules : [color: yellow, style: solid]

# Comments
// Critical subdomains are never available
// High priority requires special permission
// Medium priority available with registration
```

### Category-Based Organization
```mermaid
title Category-Based Subdomain Organization

# Core DAO Components
core_components [icon: crown, color: purple] {
  governance string pk
  treasury string
  token string
  voting string
  proposals string
}

# Documentation & Information
documentation [icon: book, color: blue] {
  docs string pk
  wiki string
  guide string
  api string
  spec string
}

# Community & Communication
community [icon: users, color: pink] {
  forum string pk
  chat string
  discord string
  telegram string
  reddit string
}

# Analytics & Monitoring
analytics [icon: chart, color: cyan] {
  analytics string pk
  stats string
  metrics string
  dashboard string
  reports string
}

# Relationships to DAO Registry
core_components *> dao_registry.id
documentation *> dao_registry.id
community *> dao_registry.id
analytics *> dao_registry.id

# Comments
// Each category has specific validation rules
// Categories can have different priority levels
// Some categories are more critical than others
```

This diagram language specification provides a comprehensive way to visualize the DAO registry system, reserved subdomains, and their relationships. It supports multiple visualization styles, priority-based coloring, and detailed entity relationships that accurately represent the system architecture. 