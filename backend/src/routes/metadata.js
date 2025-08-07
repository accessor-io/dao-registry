const express = require('express');
const router = express.Router();

// Simplified metadata service (no TypeScript dependencies)
const metadataService = {
  // Mock metadata storage
  metadata: new Map(),
  
  async getMetadata(id) {
    return this.metadata.get(id) || null;
  },
  
  async createMetadata(data) {
    const id = Date.now().toString();
    const metadata = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.metadata.set(id, metadata);
    return metadata;
  },
  
  async updateMetadata(id, data) {
    const existing = this.metadata.get(id);
    if (!existing) return null;
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.metadata.set(id, updated);
    return updated;
  },
  
  async validateMetadata(data) {
    // Basic validation
    const required = ['name', 'description'];
    const missing = required.filter(field => !data[field]);
    
    return {
      isValid: missing.length === 0,
      errors: missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : null
    };
  }
};

// Get metadata by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadata = await metadataService.getMetadata(id);
    
    if (!metadata) {
      return res.status(404).json({
        error: 'Metadata not found',
        id: id
      });
    }
    
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch metadata',
      message: error.message
    });
  }
});

// Create new metadata
router.post('/', async (req, res) => {
  try {
    const metadataData = req.body;
    
    // Validate the metadata
    const validationResult = await metadataService.validateMetadata(metadataData);
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid metadata',
        validation: validationResult
      });
    }
    
    const metadata = await metadataService.createMetadata(metadataData);
    res.status(201).json(metadata);
  } catch (error) {
    console.error('Error creating metadata:', error);
    res.status(500).json({
      error: 'Failed to create metadata',
      message: error.message
    });
  }
});

// Update metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataData = req.body;
    
    // Validate the metadata
    const validationResult = await metadataService.validateMetadata(metadataData);
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid metadata',
        validation: validationResult
      });
    }
    
    const metadata = await metadataService.updateMetadata(id, metadataData);
    
    if (!metadata) {
      return res.status(404).json({
        error: 'Metadata not found',
        id: id
      });
    }
    
    res.json(metadata);
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({
      error: 'Failed to update metadata',
      message: error.message
    });
  }
});

// Validate metadata without saving
router.post('/validate', async (req, res) => {
  try {
    const metadataData = req.body;
    const validationResult = await metadataService.validateMetadata(metadataData);
    
    res.json({
      isValid: validationResult.isValid,
      errors: validationResult.errors
    });
  } catch (error) {
    console.error('Error validating metadata:', error);
    res.status(500).json({
      error: 'Failed to validate metadata',
      message: error.message
    });
  }
});

// Get all metadata
router.get('/', async (req, res) => {
  try {
    const allMetadata = Array.from(metadataService.metadata.values());
    res.json({
      count: allMetadata.length,
      metadata: allMetadata
    });
  } catch (error) {
    console.error('Error fetching all metadata:', error);
    res.status(500).json({
      error: 'Failed to fetch metadata',
      message: error.message
    });
  }
});

module.exports = router;