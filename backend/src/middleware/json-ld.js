const JSONLDService = require('../services/json-ld-service');

class JSONLDMiddleware {
  constructor() {
    this.jsonldService = new JSONLDService();
  }

  /**
   * Middleware to handle JSON-LD content negotiation
   * Checks Accept header and converts responses to JSON-LD when requested
   */
  handleContentNegotiation() {
    return (req, res, next) => {
      // Check if client accepts JSON-LD
      const acceptHeader = req.get('Accept') || '';
      const acceptsJSONLD = acceptHeader.includes('application/ld+json') || 
                           acceptHeader.includes('application/json') ||
                           req.query.format === 'jsonld';

      // Store preference in request object
      req.prefersJSONLD = acceptsJSONLD;
      
      // Set appropriate content type for JSON-LD responses
      if (acceptsJSONLD) {
        res.setHeader('Content-Type', 'application/ld+json');
      }

      next();
    };
  }

  /**
   * Middleware to convert response data to JSON-LD format
   */
  convertToJSONLD() {
    return (req, res, next) => {
      if (!req.prefersJSONLD) {
        return next();
      }

      // Store original send method
      const originalSend = res.send;

      // Override send method to convert to JSON-LD
      const self = this;
      res.send = function(data) {
        try {
          let jsonData;
          
          // Parse data if it's a string
          if (typeof data === 'string') {
            jsonData = JSON.parse(data);
          } else {
            jsonData = data;
          }

          // Convert to JSON-LD based on response structure
          let jsonldData;
          
          if (jsonData.success === false) {
            // Error response
            jsonldData = self.jsonldService.toJSONLDError(
              jsonData.error,
              jsonData.details,
              res.statusCode,
              req.protocol + '://' + req.get('host')
            );
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            // Collection response
            jsonldData = self.jsonldService.toJSONLDCollection(
              jsonData.data,
              jsonData.pagination,
              req.protocol + '://' + req.get('host')
            );
          } else if (jsonData.data && jsonData.data.id) {
            // Single entity response
            jsonldData = self.jsonldService.toJSONLDSuccess(
              self.jsonldService.toJSONLD(jsonData.data, req.protocol + '://' + req.get('host')),
              jsonData.message,
              req.protocol + '://' + req.get('host')
            );
          } else {
            // Generic success response
            jsonldData = self.jsonldService.toJSONLDSuccess(
              jsonData.data || jsonData,
              jsonData.message,
              req.protocol + '://' + req.get('host')
            );
          }

          // Call original send with JSON-LD data
          return originalSend.call(res, JSON.stringify(jsonldData));
        } catch (error) {
          // If conversion fails, send original data
          console.error('JSON-LD conversion error:', error);
          return originalSend.call(res, data);
        }
      };

      next();
    };
  }

  /**
   * Middleware to parse JSON-LD input
   */
  parseJSONLDInput() {
    return (req, res, next) => {
      const contentType = req.get('Content-Type') || '';
      
      if (contentType.includes('application/ld+json')) {
        try {
          // Convert JSON-LD input back to regular JSON
          if (req.body && req.body['@context']) {
            req.body = this.jsonldService.fromJSONLD(req.body);
          }
        } catch (error) {
          console.error('JSON-LD input parsing error:', error);
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON-LD input',
            details: error.message
          });
        }
      }

      next();
    };
  }

  /**
   * Middleware to validate JSON-LD structure
   */
  validateJSONLD() {
    return (req, res, next) => {
      const contentType = req.get('Content-Type') || '';
      
      if (contentType.includes('application/ld+json')) {
        const validation = this.jsonldService.validateJSONLD(req.body);
        
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON-LD structure',
            details: validation.errors
          });
        }
      }

      next();
    };
  }

  /**
   * Middleware to add JSON-LD context to response headers
   */
  addContextHeader() {
    return (req, res, next) => {
      if (req.prefersJSONLD) {
        const context = this.jsonldService.getContext();
        if (context) {
          res.setHeader('Link', `<${req.protocol}://${req.get('host')}/api/contexts/dao.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`);
        }
      }
      next();
    };
  }

  /**
   * Complete JSON-LD middleware stack
   */
  jsonld() {
    return [
      this.handleContentNegotiation(),
      this.parseJSONLDInput(),
      this.validateJSONLD(),
      this.addContextHeader(),
      this.convertToJSONLD()
    ];
  }
}

module.exports = new JSONLDMiddleware();
