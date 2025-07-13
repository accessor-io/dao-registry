import { URLEncodingService, SubdomainEncodingService, URL_ENCODING_PATTERNS } from '../url-encoding-service';

describe('URL Encoding Service', () => {
  describe('URL_ENCODING_PATTERNS', () => {
    it('should have valid regex patterns', () => {
      expect(URL_ENCODING_PATTERNS.VALID_SUBDOMAIN_CHARS).toBeInstanceOf(RegExp);
      expect(URL_ENCODING_PATTERNS.URL_SAFE_CHARS).toBeInstanceOf(RegExp);
      expect(URL_ENCODING_PATTERNS.DNS_SAFE_CHARS).toBeInstanceOf(RegExp);
      expect(URL_ENCODING_PATTERNS.ENS_SAFE_CHARS).toBeInstanceOf(RegExp);
      expect(URL_ENCODING_PATTERNS.PUNYCODE_PATTERN).toBeInstanceOf(RegExp);
    });

    it('should validate DNS-safe characters', () => {
      expect(URL_ENCODING_PATTERNS.DNS_SAFE_CHARS.test('valid-subdomain')).toBe(true);
      expect(URL_ENCODING_PATTERNS.DNS_SAFE_CHARS.test('invalid@subdomain')).toBe(false);
      expect(URL_ENCODING_PATTERNS.DNS_SAFE_CHARS.test('UPPERCASE')).toBe(false);
    });

    it('should validate ENS-safe characters', () => {
      expect(URL_ENCODING_PATTERNS.ENS_SAFE_CHARS.test('valid-subdomain')).toBe(true);
      expect(URL_ENCODING_PATTERNS.ENS_SAFE_CHARS.test('invalid@subdomain')).toBe(false);
      expect(URL_ENCODING_PATTERNS.ENS_SAFE_CHARS.test('UPPERCASE')).toBe(false);
    });

    it('should detect punycode patterns', () => {
      expect(URL_ENCODING_PATTERNS.PUNYCODE_PATTERN.test('xn--mller-kva')).toBe(true);
      expect(URL_ENCODING_PATTERNS.PUNYCODE_PATTERN.test('normal-domain')).toBe(false);
    });
  });

  describe('Core Encoding Functions', () => {
    describe('encodeURL', () => {
      it('should encode URL components correctly', () => {
        expect(URLEncodingService.encodeURL('hello world')).toBe('hello%20world');
        expect(URLEncodingService.encodeURL('user@domain.com')).toBe('user%40domain.com');
        expect(URLEncodingService.encodeURL('path/to/file')).toBe('path%2Fto%2Ffile');
      });
    });

    describe('decodeURL', () => {
      it('should decode URL components correctly', () => {
        expect(URLEncodingService.decodeURL('hello%20world')).toBe('hello world');
        expect(URLEncodingService.decodeURL('user%40domain.com')).toBe('user@domain.com');
        expect(URLEncodingService.decodeURL('path%2Fto%2Ffile')).toBe('path/to/file');
      });
    });

    describe('encodeDNS', () => {
      it('should encode strings for DNS usage', () => {
        expect(URLEncodingService.encodeDNS('Hello World!')).toBe('hello-world');
        expect(URLEncodingService.encodeDNS('My Subdomain')).toBe('my-subdomain');
        expect(URLEncodingService.encodeDNS('test@domain')).toBe('testdomain');
      });

      it('should handle special characters', () => {
        expect(URLEncodingService.encodeDNS('user.name')).toBe('username');
        expect(URLEncodingService.encodeDNS('test--domain')).toBe('test-domain');
        expect(URLEncodingService.encodeDNS('-test-domain-')).toBe('test-domain');
      });
    });

    describe('encodeENS', () => {
      it('should encode strings for ENS usage', () => {
        expect(URLEncodingService.encodeENS('Hello World!')).toBe('hello-world');
        expect(URLEncodingService.encodeENS('My Subdomain')).toBe('my-subdomain');
        expect(URLEncodingService.encodeENS('test@domain')).toBe('testdomain');
      });

      it('should handle special characters', () => {
        expect(URLEncodingService.encodeENS('user.name')).toBe('username');
        expect(URLEncodingService.encodeENS('test--domain')).toBe('test-domain');
        expect(URLEncodingService.encodeENS('-test-domain-')).toBe('test-domain');
      });
    });
  });

  describe('Sanitization Functions', () => {
    describe('sanitizeSubdomain', () => {
      it('should sanitize subdomains correctly', () => {
        expect(URLEncodingService.sanitizeSubdomain('  My Subdomain!  ')).toBe('my-subdomain');
        expect(URLEncodingService.sanitizeSubdomain('Test@Domain')).toBe('testdomain');
        expect(URLEncodingService.sanitizeSubdomain('user.name')).toBe('username');
      });

      it('should handle edge cases', () => {
        expect(URLEncodingService.sanitizeSubdomain('')).toBe('');
        expect(URLEncodingService.sanitizeSubdomain('   ')).toBe('');
        expect(URLEncodingService.sanitizeSubdomain('---')).toBe('');
      });

      it('should normalize hyphens', () => {
        expect(URLEncodingService.sanitizeSubdomain('test--domain')).toBe('test-domain');
        expect(URLEncodingService.sanitizeSubdomain('-test-domain-')).toBe('test-domain');
        expect(URLEncodingService.sanitizeSubdomain('test---domain')).toBe('test-domain');
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateSubdomainFormat', () => {
      it('should validate correct subdomains', () => {
        const result = URLEncodingService.validateSubdomainFormat('valid-subdomain');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitized).toBe('valid-subdomain');
      });

      it('should reject subdomains that are too short', () => {
        const result = URLEncodingService.validateSubdomainFormat('');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Subdomain must be at least 1 character long');
      });

      it('should reject subdomains that are too long', () => {
        const longSubdomain = 'a'.repeat(64);
        const result = URLEncodingService.validateSubdomainFormat(longSubdomain);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Subdomain cannot exceed 63 characters');
      });

      it('should reject subdomains with invalid characters', () => {
        const result = URLEncodingService.validateSubdomainFormat('invalid@subdomain');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Subdomain can only contain lowercase letters, numbers, and hyphens');
      });

      it('should reject subdomains starting with hyphen', () => {
        const result = URLEncodingService.validateSubdomainFormat('-test');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Subdomain contains invalid pattern: /^-/');
      });

      it('should reject subdomains ending with hyphen', () => {
        const result = URLEncodingService.validateSubdomainFormat('test-');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Subdomain contains invalid pattern: /-$/');
      });

      it('should reject subdomains with consecutive hyphens', () => {
        const result = URLEncodingService.validateSubdomainFormat('test--domain');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Subdomain contains invalid pattern: /--/');
      });
    });

    describe('validateDomainFormat', () => {
      it('should validate correct domains', () => {
        const result = URLEncodingService.validateDomainFormat('example.com');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitized).toBe('example.com');
      });

      it('should reject domains without dots', () => {
        const result = URLEncodingService.validateDomainFormat('example');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Domain must contain at least one dot (.)');
      });

      it('should reject domains with consecutive dots', () => {
        const result = URLEncodingService.validateDomainFormat('example..com');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Domain cannot contain consecutive dots');
      });

      it('should reject domains starting with dot', () => {
        const result = URLEncodingService.validateDomainFormat('.example.com');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Domain cannot start or end with a dot');
      });

      it('should reject domains ending with dot', () => {
        const result = URLEncodingService.validateDomainFormat('example.com.');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Domain cannot start or end with a dot');
      });
    });
  });

  describe('Unicode and Internationalization Functions', () => {
    describe('hasUnicode', () => {
      it('should detect Unicode characters', () => {
        expect(URLEncodingService.hasUnicode('café')).toBe(true);
        expect(URLEncodingService.hasUnicode('müller')).toBe(true);
        expect(URLEncodingService.hasUnicode('normal-text')).toBe(false);
      });
    });

    describe('isPunycode', () => {
      it('should detect punycode patterns', () => {
        expect(URLEncodingService.isPunycode('xn--mller-kva')).toBe(true);
        expect(URLEncodingService.isPunycode('normal-domain')).toBe(false);
      });
    });

    describe('normalizeDomain', () => {
      it('should normalize domains correctly', () => {
        expect(URLEncodingService.normalizeDomain('  EXAMPLE.COM  ')).toBe('example.com');
        expect(URLEncodingService.normalizeDomain('test--domain')).toBe('test-domain');
      });
    });
  });

  describe('Domain Manipulation Functions', () => {
    describe('extractSubdomain', () => {
      it('should extract subdomain from full domain', () => {
        expect(URLEncodingService.extractSubdomain('sub.example.com')).toBe('sub');
        expect(URLEncodingService.extractSubdomain('sub.sub.example.com')).toBe('sub.sub');
      });

      it('should return null for invalid domains', () => {
        expect(URLEncodingService.extractSubdomain('example.com')).toBe(null);
        expect(URLEncodingService.extractSubdomain('')).toBe(null);
      });
    });

    describe('extractTLD', () => {
      it('should extract TLD from full domain', () => {
        expect(URLEncodingService.extractTLD('sub.example.com')).toBe('com');
        expect(URLEncodingService.extractTLD('example.org')).toBe('org');
      });

      it('should return null for invalid domains', () => {
        expect(URLEncodingService.extractTLD('example')).toBe(null);
        expect(URLEncodingService.extractTLD('')).toBe(null);
      });
    });

    describe('buildDomain', () => {
      it('should build full domain from subdomain and TLD', () => {
        expect(URLEncodingService.buildDomain('sub', 'example.com')).toBe('sub.example.com');
        expect(URLEncodingService.buildDomain('test', 'domain.org')).toBe('test.domain.org');
      });
    });
  });

  describe('Utility Functions', () => {
    describe('escapeRegex', () => {
      it('should escape special regex characters', () => {
        expect(URLEncodingService.escapeRegex('user.name')).toBe('user\\.name');
        expect(URLEncodingService.escapeRegex('test*domain')).toBe('test\\*domain');
        expect(URLEncodingService.escapeRegex('path/to/file')).toBe('path/to/file');
      });
    });

    describe('createSubdomainPattern', () => {
      it('should create regex pattern for subdomain matching', () => {
        const pattern = URLEncodingService.createSubdomainPattern('test');
        expect(pattern.test('test')).toBe(true);
        expect(pattern.test('TEST')).toBe(true);
        expect(pattern.test('other')).toBe(false);
      });
    });

    describe('getEncodingStats', () => {
      it('should return encoding statistics', () => {
        const stats = URLEncodingService.getEncodingStats('Hello World!');
        expect(stats.originalLength).toBe(12);
        expect(stats.encodedLength).toBe(11);
        expect(stats.hasUnicode).toBe(false);
        expect(stats.isPunycode).toBe(false);
        expect(stats.encodingRatio).toBeCloseTo(0.916, 3);
      });

      it('should handle Unicode characters', () => {
        const stats = URLEncodingService.getEncodingStats('café');
        expect(stats.hasUnicode).toBe(true);
      });
    });
  });

  describe('Safety Checks', () => {
    describe('isDNSSafe', () => {
      it('should check DNS safety', () => {
        expect(URLEncodingService.isDNSSafe('valid-subdomain')).toBe(true);
        expect(URLEncodingService.isDNSSafe('invalid@subdomain')).toBe(false);
        expect(URLEncodingService.isDNSSafe('UPPERCASE')).toBe(false);
      });
    });

    describe('isENSSafe', () => {
      it('should check ENS safety', () => {
        expect(URLEncodingService.isENSSafe('valid-subdomain')).toBe(true);
        expect(URLEncodingService.isENSSafe('invalid@subdomain')).toBe(false);
        expect(URLEncodingService.isENSSafe('UPPERCASE')).toBe(false);
      });
    });
  });
});

describe('Subdomain Encoding Service', () => {
  describe('encodeForDNS', () => {
    it('should encode subdomain for DNS usage', () => {
      const result = SubdomainEncodingService.encodeForDNS('My Subdomain');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('my-subdomain');
      expect(result.encodingStats).toBeDefined();
    });

    it('should handle invalid subdomains', () => {
      const result = SubdomainEncodingService.encodeForDNS('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Subdomain must be at least 1 character long');
    });
  });

  describe('encodeForENS', () => {
    it('should encode subdomain for ENS usage', () => {
      const result = SubdomainEncodingService.encodeForENS('My Subdomain');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('my-subdomain');
      expect(result.encodingStats).toBeDefined();
    });

    it('should handle invalid subdomains', () => {
      const result = SubdomainEncodingService.encodeForENS('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Subdomain must be at least 1 character long');
    });
  });

  describe('generateVariations', () => {
    it('should generate safe subdomain variations', () => {
      const variations = SubdomainEncodingService.generateVariations('myapp');
      expect(variations).toContain('myapp');
      expect(variations).toContain('myapp-1');
      expect(variations).toContain('myapp-app');
      expect(variations).toContain('myapp-web');
    });

    it('should handle special characters in input', () => {
      const variations = SubdomainEncodingService.generateVariations('My App!');
      expect(variations[0]).toBe('my-app');
    });
  });

  describe('isAvailable', () => {
    it('should check subdomain availability', () => {
      const reservedList = ['admin', 'test'];
      expect(SubdomainEncodingService.isAvailable('available', reservedList)).toBe(true);
      expect(SubdomainEncodingService.isAvailable('admin', reservedList)).toBe(false);
    });
  });

  describe('findAvailableSubdomain', () => {
    it('should find available subdomain from input', () => {
      const reservedList = ['myapp', 'myapp-1'];
      const available = SubdomainEncodingService.findAvailableSubdomain('myapp', reservedList);
      expect(available).toBe('myapp-2');
    });

    it('should return null if no variations are available', () => {
      const reservedList = ['myapp', 'myapp-1', 'myapp-2', 'myapp-3', 'myapp-4', 'myapp-5', 
                           'myapp-app', 'myapp-web', 'myapp-site', 'myapp-online', 'myapp-digital'];
      const available = SubdomainEncodingService.findAvailableSubdomain('myapp', reservedList);
      expect(available).toBe(null);
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complex subdomain scenarios', () => {
    // Test a complex subdomain with various issues
    const complexSubdomain = '  My@Complex#Subdomain!  ';
    
    // Sanitize
    const sanitized = URLEncodingService.sanitizeSubdomain(complexSubdomain);
    expect(sanitized).toBe('mycomplexsubdomain');
    
    // Validate
    const validation = URLEncodingService.validateSubdomainFormat(complexSubdomain);
    expect(validation.isValid).toBe(true);
    expect(validation.sanitized).toBe('mycomplexsubdomain');
    
    // Check DNS safety
    expect(URLEncodingService.isDNSSafe(sanitized)).toBe(true);
    expect(URLEncodingService.isENSSafe(sanitized)).toBe(true);
  });

  it('should handle Unicode subdomains', () => {
    const unicodeSubdomain = 'café-domain';
    
    // Check Unicode detection
    expect(URLEncodingService.hasUnicode(unicodeSubdomain)).toBe(true);
    
    // Get encoding stats
    const stats = URLEncodingService.getEncodingStats(unicodeSubdomain);
    expect(stats.hasUnicode).toBe(true);
    expect(stats.originalLength).toBe(unicodeSubdomain.length);
  });

  it('should handle punycode domains', () => {
    const punycodeDomain = 'xn--mller-kva.com';
    
    // Check punycode detection
    expect(URLEncodingService.isPunycode('xn--mller-kva')).toBe(true);
    
    // Extract subdomain and TLD
    const subdomain = URLEncodingService.extractSubdomain(punycodeDomain);
    const tld = URLEncodingService.extractTLD(punycodeDomain);
    
    expect(subdomain).toBe('xn--mller-kva');
    expect(tld).toBe('com');
  });
}); 