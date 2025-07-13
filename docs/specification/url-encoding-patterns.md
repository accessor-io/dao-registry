# URL Encoding Patterns and Regex Expressions

## Overview

This document outlines the comprehensive URL encoding patterns and regex expressions used in the DAO Registry system for subdomain validation, sanitization, and proper handling of special characters.

## Core URL Encoding Patterns

### Basic Character Validation

```typescript
// Valid subdomain characters (DNS-safe)
VALID_SUBDOMAIN_CHARS: /^[a-z0-9-]+$/

// URL-safe characters (RFC 3986)
URL_SAFE_CHARS: /^[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/

// DNS-safe characters (RFC 1123)
DNS_SAFE_CHARS: /^[a-z0-9-]+$/

// ENS-safe characters (Ethereum Name Service)
ENS_SAFE_CHARS: /^[a-z0-9-]+$/
```

### Special Character Patterns

```typescript
// Punycode pattern for internationalized domain names
PUNYCODE_PATTERN: /^xn--[a-z0-9]+$/

// URL encoding patterns
URL_ENCODED_CHARS: /%[0-9A-Fa-f]{2}/g

// Special characters that need encoding
SPECIAL_CHARS: /[^A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]/g

// Characters that need encoding in URLs
URL_ENCODE_CHARS: /[^A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]/g

// Characters that need encoding in DNS
DNS_ENCODE_CHARS: /[^a-z0-9-]/g

// Characters that need encoding in ENS
ENS_ENCODE_CHARS: /[^a-z0-9-]/g
```

### Unicode and Control Character Patterns

```typescript
// Unicode characters
UNICODE_CHARS: /[\u0080-\uFFFF]/g

// Control characters
CONTROL_CHARS: /[\u0000-\u001F\u007F-\u009F]/g

// Whitespace characters
WHITESPACE_CHARS: /\s+/g

// Multiple hyphens
MULTIPLE_HYPHENS: /-+/g

// Leading/trailing hyphens
LEADING_TRAILING_HYPHENS: /^-+|-+$/g
```

### Invalid Domain Patterns

```typescript
INVALID_DOMAIN_PATTERNS: [
  /^-/,           // Starts with hyphen
  /-$/,           // Ends with hyphen
  /--/,           // Consecutive hyphens
  /^[0-9]/,       // Starts with number
  /[^a-z0-9-]/,   // Contains invalid characters
  /^$/,           // Empty string
  /^\./,          // Starts with dot
  /\.$/,          // Ends with dot
  /\.\./,         // Consecutive dots
]
```

### Length Validation

```typescript
// Subdomain length validation
SUBDOMAIN_LENGTH: {
  MIN: 1,
  MAX: 63
}

// Full domain length validation
DOMAIN_LENGTH: {
  MIN: 1,
  MAX: 253
}

// Valid TLD patterns
VALID_TLD_PATTERN: /^[a-z]{2,}$/
```

## URL Encoding Service Functions

### Core Encoding Functions

#### `encodeURL(str: string): string`
Encodes a string for URL usage using `encodeURIComponent()`.

```typescript
// Example
const encoded = URLEncodingService.encodeURL("hello world");
// Result: "hello%20world"
```

#### `decodeURL(str: string): string`
Decodes a URL-encoded string using `decodeURIComponent()`.

```typescript
// Example
const decoded = URLEncodingService.decodeURL("hello%20world");
// Result: "hello world"
```

#### `encodeDNS(str: string): string`
Encodes a string for DNS usage (subdomain-safe).

```typescript
// Example
const dnsSafe = URLEncodingService.encodeDNS("Hello World!");
// Result: "hello-world"
```

#### `encodeENS(str: string): string`
Encodes a string for ENS usage.

```typescript
// Example
const ensSafe = URLEncodingService.encodeENS("My Domain");
// Result: "my-domain"
```

### Sanitization Functions

#### `sanitizeSubdomain(subdomain: string): string`
Sanitizes a subdomain for safe usage.

```typescript
// Example
const sanitized = URLEncodingService.sanitizeSubdomain("  My-Subdomain!  ");
// Result: "my-subdomain"
```

### Validation Functions

#### `validateSubdomainFormat(subdomain: string)`
Validates subdomain format with comprehensive checks.

```typescript
// Example
const validation = URLEncodingService.validateSubdomainFormat("my-subdomain");
// Returns: { isValid: boolean, errors: string[], sanitized?: string }
```

#### `validateDomainFormat(domain: string)`
Validates full domain format.

```typescript
// Example
const validation = URLEncodingService.validateDomainFormat("example.com");
// Returns: { isValid: boolean, errors: string[], sanitized?: string }
```

### Unicode and Internationalization Functions

#### `toPunycode(str: string): string`
Converts string to punycode for internationalized domain names.

```typescript
// Example
const punycode = URLEncodingService.toPunycode("müller");
// Result: "xn--mller-kva"
```

#### `fromPunycode(str: string): string`
Converts punycode to Unicode.

```typescript
// Example
const unicode = URLEncodingService.fromPunycode("xn--mller-kva");
// Result: "müller"
```

#### `hasUnicode(str: string): boolean`
Checks if string contains Unicode characters.

```typescript
// Example
const hasUnicode = URLEncodingService.hasUnicode("café");
// Result: true
```

#### `isPunycode(str: string): boolean`
Checks if string is punycode encoded.

```typescript
// Example
const isPunycode = URLEncodingService.isPunycode("xn--mller-kva");
// Result: true
```

### Domain Manipulation Functions

#### `extractSubdomain(domain: string): string | null`
Extracts subdomain from full domain.

```typescript
// Example
const subdomain = URLEncodingService.extractSubdomain("sub.example.com");
// Result: "sub"
```

#### `extractTLD(domain: string): string | null`
Extracts TLD from full domain.

```typescript
// Example
const tld = URLEncodingService.extractTLD("sub.example.com");
// Result: "com"
```

#### `buildDomain(subdomain: string, tld: string): string`
Builds full domain from subdomain and TLD.

```typescript
// Example
const domain = URLEncodingService.buildDomain("sub", "example.com");
// Result: "sub.example.com"
```

### Utility Functions

#### `escapeRegex(str: string): string`
Escapes special characters for regex usage.

```typescript
// Example
const escaped = URLEncodingService.escapeRegex("user.name");
// Result: "user\\.name"
```

#### `createSubdomainPattern(subdomain: string): RegExp`
Creates regex pattern for subdomain matching.

```typescript
// Example
const pattern = URLEncodingService.createSubdomainPattern("test");
// Result: /^test$/i
```

#### `getEncodingStats(input: string)`
Gets encoding statistics for a string.

```typescript
// Example
const stats = URLEncodingService.getEncodingStats("Hello World!");
// Returns: {
//   originalLength: 12,
//   encodedLength: 11,
//   hasUnicode: false,
//   isPunycode: false,
//   encodingRatio: 0.9166666666666666
// }
```

## Subdomain Encoding Service

### Core Functions

#### `encodeForDNS(subdomain: string): URLEncodingValidation`
Validates and encodes subdomain for DNS usage.

```typescript
// Example
const validation = SubdomainEncodingService.encodeForDNS("My Subdomain");
// Returns: { isValid: boolean, errors: string[], sanitized?: string, encodingStats?: {...} }
```

#### `encodeForENS(subdomain: string): URLEncodingValidation`
Validates and encodes subdomain for ENS usage.

```typescript
// Example
const validation = SubdomainEncodingService.encodeForENS("My Subdomain");
// Returns: { isValid: boolean, errors: string[], sanitized?: string, encodingStats?: {...} }
```

### Variation Generation

#### `generateVariations(input: string): string[]`
Generates multiple safe variations of a subdomain.

```typescript
// Example
const variations = SubdomainEncodingService.generateVariations("myapp");
// Result: ["myapp", "myapp-1", "myapp-2", "myapp-3", "myapp-4", "myapp-5", 
//          "myapp-app", "myapp-web", "myapp-site", "myapp-online", "myapp-digital"]
```

#### `findAvailableSubdomain(input: string, reservedList: string[]): string | null`
Finds available subdomain from input.

```typescript
// Example
const available = SubdomainEncodingService.findAvailableSubdomain("admin", ["admin", "admin-1"]);
// Result: "admin-2"
```

## Integration with Reserved Subdomains Service

The URL encoding service is integrated with the Reserved Subdomains Service to provide comprehensive validation:

### Enhanced Validation

```typescript
// Before URL encoding integration
const oldValidation = reservedService.validateSubdomain("My Subdomain");

// After URL encoding integration
const newValidation = reservedService.validateSubdomain("My Subdomain");
// Now includes: sanitized version, encoding stats, comprehensive error checking
```

### URL-Safe Operations

```typescript
// Check if subdomain is DNS safe
const isDNSSafe = reservedService.isDNSSafe("my-subdomain");

// Check if subdomain is ENS safe
const isENSSafe = reservedService.isENSSafe("my-subdomain");

// Normalize subdomain for consistent handling
const normalized = reservedService.normalizeSubdomain("  My Subdomain!  ");
```

## Security Considerations

### Input Sanitization

All subdomain inputs are sanitized using the URL encoding patterns:

1. **Character Filtering**: Remove invalid characters
2. **Case Normalization**: Convert to lowercase
3. **Whitespace Handling**: Replace with hyphens
4. **Hyphen Normalization**: Remove leading/trailing hyphens
5. **Length Validation**: Ensure within DNS limits

### Unicode Security

- **Punycode Support**: Handle internationalized domain names
- **Unicode Detection**: Identify and handle Unicode characters
- **Encoding Validation**: Ensure proper encoding/decoding

### DNS Compliance

- **RFC 1123 Compliance**: Follow DNS naming standards
- **Length Limits**: Respect DNS length constraints
- **Character Set**: Use only DNS-safe characters

## Error Handling

### Validation Errors

Common validation errors include:

```typescript
// Length errors
"Subdomain must be at least 1 character long"
"Subdomain cannot exceed 63 characters"

// Character errors
"Subdomain can only contain lowercase letters, numbers, and hyphens"

// Format errors
"Subdomain cannot start with a hyphen"
"Subdomain cannot end with a hyphen"
"Subdomain cannot contain consecutive hyphens"
```

### Encoding Errors

```typescript
// Unicode errors
"Subdomain contains Unicode characters that need encoding"

// Punycode errors
"Invalid punycode format"

// URL encoding errors
"Invalid URL encoding sequence"
```

## Testing Patterns

### Unit Test Examples

```typescript
// Test basic validation
describe('URL Encoding Service', () => {
  it('should validate valid subdomains', () => {
    const result = URLEncodingService.validateSubdomainFormat('valid-subdomain');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid subdomains', () => {
    const result = URLEncodingService.validateSubdomainFormat('invalid@subdomain');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Subdomain can only contain lowercase letters, numbers, and hyphens');
  });

  it('should sanitize subdomains correctly', () => {
    const sanitized = URLEncodingService.sanitizeSubdomain('  My Subdomain!  ');
    expect(sanitized).toBe('my-subdomain');
  });
});
```

### Integration Test Examples

```typescript
// Test reserved subdomains integration
describe('Reserved Subdomains with URL Encoding', () => {
  it('should validate reserved subdomains with encoding', () => {
    const result = reservedService.validateSubdomain('  governance  ');
    expect(result.isReserved).toBe(true);
    expect(result.sanitized).toBe('governance');
  });

  it('should handle Unicode subdomains', () => {
    const result = reservedService.validateSubdomain('café');
    expect(result.encodingStats?.hasUnicode).toBe(true);
  });
});
```

## Performance Considerations

### Regex Optimization

- **Compiled Patterns**: Use pre-compiled regex patterns
- **Efficient Matching**: Use appropriate regex flags
- **Pattern Caching**: Cache frequently used patterns

### Memory Management

- **String Immutability**: Avoid unnecessary string mutations
- **Garbage Collection**: Clean up temporary objects
- **Buffer Management**: Use appropriate buffer sizes

## Future Enhancements

### Planned Features

1. **Advanced Unicode Support**: Enhanced internationalization
2. **Custom Pattern Support**: User-defined validation patterns
3. **Performance Monitoring**: Encoding performance metrics
4. **Caching Layer**: Intelligent pattern caching
5. **Machine Learning**: Pattern learning and optimization

### Extension Points

```typescript
// Custom pattern support
interface CustomPattern {
  name: string;
  pattern: RegExp;
  description: string;
  priority: number;
}

// Performance monitoring
interface EncodingMetrics {
  encodingTime: number;
  memoryUsage: number;
  cacheHits: number;
  cacheMisses: number;
}
```

## Conclusion

The URL encoding patterns and regex expressions provide a robust foundation for subdomain validation and sanitization in the DAO Registry system. The comprehensive patterns ensure DNS compliance, ENS compatibility, and proper handling of internationalized domain names while maintaining security and performance standards. 