const express = require('express');

// Reserved Subdomain Priority Levels
const ReservedSubdomainPriority = {
  CRITICAL: 1,    // Never available for public registration
  HIGH: 2,        // Requires special permission
  MEDIUM: 3,      // Available with registration
  LOW: 4          // Available with approval
};

// Comprehensive reserved subdomains data
const RESERVED_SUBDOMAINS = new Map([
  // Core DAO Components (CRITICAL)
  ['governance', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Core DAO Components',
    description: 'Main governance contract',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['treasury', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Core DAO Components',
    description: 'Treasury management',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['token', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Core DAO Components',
    description: 'DAO token contract',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['docs', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Documentation',
    description: 'Documentation hub',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['forum', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Communication',
    description: 'Community forum',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['analytics', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Analytics',
    description: 'Analytics dashboard',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['voting', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Core DAO Components',
    description: 'Voting mechanism',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['proposals', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Core DAO Components',
    description: 'Proposal management',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['members', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Core DAO Components',
    description: 'Member management',
    allowedFor: ['DAO owners', 'System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['admin', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Administration',
    description: 'Administrative functions',
    allowedFor: ['System administrators'],
    restrictions: ['Never available for public registration']
  }],
  ['api', {
    priority: ReservedSubdomainPriority.CRITICAL,
    category: 'Technical',
    description: 'API endpoints',
    allowedFor: ['System administrators'],
    restrictions: ['Never available for public registration']
  }],

  // HIGH Priority (Requires special permission)
  ['blog', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Communication',
    description: 'Blog and announcements',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['news', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Communication',
    description: 'News and updates',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['events', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Communication',
    description: 'Event management',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['grants', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Finance',
    description: 'Grant programs',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['bounties', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Finance',
    description: 'Bounty programs',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['rewards', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Finance',
    description: 'Reward programs',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['staking', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Finance',
    description: 'Staking mechanisms',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['liquidity', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Finance',
    description: 'Liquidity management',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['insurance', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Finance',
    description: 'Insurance programs',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['security', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Security',
    description: 'Security information',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['audit', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Security',
    description: 'Audit reports',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['bug-bounty', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Security',
    description: 'Bug bounty program',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['legal', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Legal',
    description: 'Legal documents',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['compliance', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Legal',
    description: 'Compliance information',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['privacy', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Legal',
    description: 'Privacy policy',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['terms', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Legal',
    description: 'Terms of service',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['support', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Support',
    description: 'Support portal',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['help', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Support',
    description: 'Help center',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['faq', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Support',
    description: 'Frequently asked questions',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['contact', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Support',
    description: 'Contact information',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['feedback', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Support',
    description: 'Feedback system',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['status', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'System status',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['monitoring', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'System monitoring',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['metrics', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Performance metrics',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['logs', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'System logs',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['backup', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Backup systems',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['recovery', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Recovery systems',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['testing', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Testing environment',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['staging', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Staging environment',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['dev', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Development environment',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['beta', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Beta testing',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['alpha', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Alpha testing',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['sandbox', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Sandbox environment',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['demo', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Demo environment',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],
  ['playground', {
    priority: ReservedSubdomainPriority.HIGH,
    category: 'Technical',
    description: 'Playground environment',
    allowedFor: ['DAO owners'],
    restrictions: ['Requires special permission']
  }],

  // MEDIUM Priority (Available with registration)
  ['community', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Community',
    description: 'Community portal',
    allowedFor: ['DAO owners', 'Community members'],
    restrictions: ['Available with registration']
  }],
  ['social', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Community',
    description: 'Social media links',
    allowedFor: ['DAO owners', 'Community members'],
    restrictions: ['Available with registration']
  }],
  ['chat', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Communication',
    description: 'Chat platform',
    allowedFor: ['DAO owners', 'Community members'],
    restrictions: ['Available with registration']
  }],
  ['discord', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Communication',
    description: 'Discord server',
    allowedFor: ['DAO owners', 'Community members'],
    restrictions: ['Available with registration']
  }],
  ['telegram', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Communication',
    description: 'Telegram channel',
    allowedFor: ['DAO owners', 'Community members'],
    restrictions: ['Available with registration']
  }],
  ['twitter', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Communication',
    description: 'Twitter account',
    allowedFor: ['DAO owners', 'Community members'],
    restrictions: ['Available with registration']
  }],
  ['github', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Development',
    description: 'GitHub repository',
    allowedFor: ['DAO owners', 'Developers'],
    restrictions: ['Available with registration']
  }],
  ['gitlab', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Development',
    description: 'GitLab repository',
    allowedFor: ['DAO owners', 'Developers'],
    restrictions: ['Available with registration']
  }],
  ['code', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Development',
    description: 'Code repository',
    allowedFor: ['DAO owners', 'Developers'],
    restrictions: ['Available with registration']
  }],
  ['developers', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Development',
    description: 'Developer portal',
    allowedFor: ['DAO owners', 'Developers'],
    restrictions: ['Available with registration']
  }],
  ['sdk', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Development',
    description: 'Software development kit',
    allowedFor: ['DAO owners', 'Developers'],
    restrictions: ['Available with registration']
  }],
  ['api-docs', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Development',
    description: 'API documentation',
    allowedFor: ['DAO owners', 'Developers'],
    restrictions: ['Available with registration']
  }],
  ['integrations', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Development',
    description: 'Third-party integrations',
    allowedFor: ['DAO owners', 'Developers'],
    restrictions: ['Available with registration']
  }],
  ['partners', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Partnership information',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['investors', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Investor information',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['careers', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Career opportunities',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['jobs', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Job listings',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['press', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Press releases',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['media', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Media resources',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['brand', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Brand guidelines',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['assets', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Brand assets',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['resources', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'General resources',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['tools', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Tools and utilities',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['marketplace', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Marketplace',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['shop', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Online store',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }],
  ['store', {
    priority: ReservedSubdomainPriority.MEDIUM,
    category: 'Business',
    description: 'Digital store',
    allowedFor: ['DAO owners'],
    restrictions: ['Available with registration']
  }]
]);

class ReservedSubdomainsService {
  constructor(ensResolver = null) {
    this.ensResolver = ensResolver;
  }

  // Check if a subdomain is reserved
  isReserved(subdomain) {
    return RESERVED_SUBDOMAINS.has(subdomain.toLowerCase());
  }

  // Get priority level for a subdomain
  getPriority(subdomain) {
    const info = RESERVED_SUBDOMAINS.get(subdomain.toLowerCase());
    return info ? info.priority : 0;
  }

  // Get detailed information for a reserved subdomain
  getReservedSubdomainInfo(subdomain) {
    return RESERVED_SUBDOMAINS.get(subdomain.toLowerCase()) || null;
  }

  // Get all reserved words
  getAllReservedWords() {
    return RESERVED_SUBDOMAINS;
  }

  // Get reserved words by priority level
  getReservedWordsByPriority(priority) {
    const words = [];
    for (const [subdomain, info] of RESERVED_SUBDOMAINS) {
      if (info.priority === priority) {
        words.push(subdomain);
      }
    }
    return words;
  }

  // Get reserved words by category
  getReservedWordsByCategory(category) {
    const words = [];
    for (const [subdomain, info] of RESERVED_SUBDOMAINS) {
      if (info.category === category) {
        words.push({
          subdomain,
          priority: info.priority,
          category: info.category,
          description: info.description,
          allowedFor: info.allowedFor,
          restrictions: info.restrictions
        });
      }
    }
    return words;
  }

  // Get summary statistics
  getReservedWordsSummary() {
    const summary = {
      total: RESERVED_SUBDOMAINS.size,
      byPriority: { 1: 0, 2: 0, 3: 0, 4: 0 },
      byCategory: {}
    };

    for (const [subdomain, info] of RESERVED_SUBDOMAINS) {
      summary.byPriority[info.priority]++;
      
      if (!summary.byCategory[info.category]) {
        summary.byCategory[info.category] = 0;
      }
      summary.byCategory[info.category]++;
    }

    return summary;
  }

  // Get available subdomains for a specific role
  getAvailableSubdomainsForRole(role) {
    const available = [];
    for (const [subdomain, info] of RESERVED_SUBDOMAINS) {
      if (info.allowedFor.includes(role)) {
        available.push({
          subdomain,
          priority: info.priority,
          category: info.category,
          description: info.description,
          restrictions: info.restrictions
        });
      }
    }
    return available;
  }

  // Check if a user can register a reserved subdomain
  canRegisterReservedSubdomain(subdomain, userRole) {
    const info = RESERVED_SUBDOMAINS.get(subdomain.toLowerCase());
    if (!info) return true; // Not reserved, can register
    
    return info.allowedFor.includes(userRole);
  }

  // Validate subdomain format
  validateSubdomain(subdomain) {
    const errors = [];
    
    if (!subdomain || typeof subdomain !== 'string') {
      errors.push('Subdomain is required');
      return { isValid: false, errors, isReserved: false, priority: 0 };
    }

    const cleanSubdomain = subdomain.toLowerCase().trim();
    
    // Check length
    if (cleanSubdomain.length < 1) {
      errors.push('Subdomain cannot be empty');
    }
    if (cleanSubdomain.length > 63) {
      errors.push('Subdomain cannot exceed 63 characters');
    }

    // Check for valid characters
    const validChars = /^[a-z0-9-]+$/;
    if (!validChars.test(cleanSubdomain)) {
      errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }

    // Check for consecutive hyphens
    if (cleanSubdomain.includes('--')) {
      errors.push('Subdomain cannot contain consecutive hyphens');
    }

    // Check for leading/trailing hyphens
    if (cleanSubdomain.startsWith('-') || cleanSubdomain.endsWith('-')) {
      errors.push('Subdomain cannot start or end with a hyphen');
    }

    // Check if reserved
    const isReserved = this.isReserved(cleanSubdomain);
    const priority = this.getPriority(cleanSubdomain);
    
    if (isReserved) {
      const info = this.getReservedSubdomainInfo(cleanSubdomain);
      errors.push(`Subdomain "${cleanSubdomain}" is reserved (${info.category})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      isReserved,
      priority
    };
  }

  // Validate ENS subdomain (async for potential ENS resolution)
  async validateENSSubdomain(parentDomain, subdomain) {
    const errors = [];
    
    if (!parentDomain || !subdomain) {
      errors.push('Parent domain and subdomain are required');
      return { isValid: false, errors, domain: null, exists: false };
    }

    const fullDomain = `${subdomain}.${parentDomain}`;
    
    // Basic validation
    const subdomainValidation = this.validateSubdomain(subdomain);
    if (!subdomainValidation.isValid) {
      errors.push(...subdomainValidation.errors);
    }

    // Check if domain exists (mock implementation)
    const exists = false; // In real implementation, would check ENS
    
    if (exists) {
      errors.push(`Domain "${fullDomain}" already exists`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      domain: fullDomain,
      exists
    };
  }
}

module.exports = { ReservedSubdomainsService, ReservedSubdomainPriority }; 