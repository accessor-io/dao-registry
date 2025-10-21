/**
 * ENSIP-X Service - Frontend API client for ENSIP-X compliant contract naming
 */

class ENSIPXService {
  constructor(baseURL = '/api/ensip-x') {
    this.baseURL = baseURL;
  }

  // Health check
  async getHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('ENSIP-X health check error:', error);
      throw error;
    }
  }

  // Get ENSIP-X standards
  async getStandards() {
    try {
      const response = await fetch(`${this.baseURL}/standards`);
      if (!response.ok) {
        throw new Error(`Failed to fetch standards: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get ENSIP-X standards error:', error);
      throw error;
    }
  }

  // Register DAO with ENSIP-X compliant metadata
  async registerDAO(daoData) {
    try {
      const response = await fetch(`${this.baseURL}/register/dao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(daoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to register DAO: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Register DAO error:', error);
      throw error;
    }
  }

  // Generate contract names following ENSIP-X standards
  async generateContracts(daoName, contractTypes = []) {
    try {
      const response = await fetch(`${this.baseURL}/generate/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daoName, contractTypes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate contracts: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Generate contracts error:', error);
      throw error;
    }
  }

  // Generate ENS domains following ENSIP-X standards
  async generateENS(daoName, customDomain = null) {
    try {
      const response = await fetch(`${this.baseURL}/generate/ens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daoName, customDomain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate ENS domains: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Generate ENS domains error:', error);
      throw error;
    }
  }

  // Create contract metadata following ENSIP-X standards
  async createContractMetadata(daoData, contractNames) {
    try {
      const response = await fetch(`${this.baseURL}/metadata/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daoData, contractNames }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create contract metadata: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create contract metadata error:', error);
      throw error;
    }
  }

  // Create ENS metadata following ENSIP-X standards
  async createENSMetadata(daoData, ensDomains) {
    try {
      const response = await fetch(`${this.baseURL}/metadata/ens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daoData, ensDomains }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create ENS metadata: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create ENS metadata error:', error);
      throw error;
    }
  }

  // Create secure metadata signature (SOMU)
  async createSignature(daoData) {
    try {
      const response = await fetch(`${this.baseURL}/signature/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daoData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create signature: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create signature error:', error);
      throw error;
    }
  }

  // Validate ENSIP-X compliance
  async validateCompliance(metadata) {
    try {
      const response = await fetch(`${this.baseURL}/validate/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to validate compliance: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Validate compliance error:', error);
      throw error;
    }
  }

  // Get naming patterns
  async getNamingPatterns() {
    try {
      const response = await fetch(`${this.baseURL}/patterns/naming`);
      if (!response.ok) {
        throw new Error(`Failed to fetch naming patterns: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get naming patterns error:', error);
      throw error;
    }
  }

  // Get ENS patterns
  async getENSPatterns() {
    try {
      const response = await fetch(`${this.baseURL}/patterns/ens`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ENS patterns: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get ENS patterns error:', error);
      throw error;
    }
  }

  // Validate DAO data
  async validateDAO(daoData) {
    try {
      const response = await fetch(`${this.baseURL}/validate/dao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daoData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to validate DAO: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Validate DAO error:', error);
      throw error;
    }
  }

  // Get complete DAO structure with ENSIP-X compliance
  async getCompleteStructure(daoData) {
    try {
      const response = await fetch(`${this.baseURL}/structure/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daoData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get complete structure: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get complete structure error:', error);
      throw error;
    }
  }

  // Helper methods for common operations

  // Register complete DAO with all ENSIP-X components
  async registerCompleteDAO(daoData) {
    try {
      // First validate the DAO data
      const validation = await this.validateDAO(daoData);
      if (!validation.validation.isValid) {
        throw new Error(`Validation failed: ${validation.validation.errors.join(', ')}`);
      }

      // Register the DAO with full ENSIP-X compliance
      const result = await this.registerDAO(daoData);
      
      return {
        success: true,
        result,
        message: 'Complete DAO registered with ENSIP-X compliance'
      };
    } catch (error) {
      console.error('Register complete DAO error:', error);
      throw error;
    }
  }

  // Generate and validate complete DAO structure
  async generateAndValidateStructure(daoData) {
    try {
      const structure = await this.getCompleteStructure(daoData);
      const compliance = await this.validateCompliance(structure.dao);
      
      return {
        success: true,
        structure: structure.dao,
        compliance: compliance.compliance,
        message: 'Complete DAO structure generated and validated'
      };
    } catch (error) {
      console.error('Generate and validate structure error:', error);
      throw error;
    }
  }

  // Get all patterns
  async getAllPatterns() {
    try {
      const [namingPatterns, ensPatterns] = await Promise.all([
        this.getNamingPatterns(),
        this.getENSPatterns()
      ]);
      
      return {
        success: true,
        naming: namingPatterns.patterns,
        ens: ensPatterns.patterns,
        message: 'All ENSIP-X patterns retrieved'
      };
    } catch (error) {
      console.error('Get all patterns error:', error);
      throw error;
    }
  }

  // Validate input data
  validateInput(type, data) {
    const errors = [];

    switch (type) {
      case 'dao':
        if (!data.name) errors.push('DAO name is required');
        if (!data.description) errors.push('DAO description is required');
        if (data.name && !/^[A-Za-z0-9\s]+$/.test(data.name)) {
          errors.push('DAO name must contain only alphanumeric characters and spaces');
        }
        break;

      case 'contract':
        if (!data.name) errors.push('Contract name is required');
        if (!data.type) errors.push('Contract type is required');
        break;

      case 'ens':
        if (!data.domain) errors.push('ENS domain is required');
        if (data.domain && !data.domain.endsWith('.eth')) {
          errors.push('ENS domain must end with .eth');
        }
        break;

      default:
        errors.push(`Unknown validation type: ${type}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ENSIPXService;




