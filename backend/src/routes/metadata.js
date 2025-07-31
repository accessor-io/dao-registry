const express = require('express');
const router = express.Router();

// Import the working metadata services
const metadataService = require('../services/metadata');
const isoMetadataService = require('../services/metadata/iso/iso-metadata-service');
const metadataRegistry = require('../services/metadata/registry/metadata-registry');

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
    
    // Validate the metadata using ISO service
    const validationResult = await isoMetadataService.validateMetadata(metadataData);
    
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
    
    // Validate the metadata using ISO service
    const validationResult = await isoMetadataService.validateMetadata(metadataData);
    
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
    const validationResult = await isoMetadataService.validateMetadata(metadataData);
    
    res.json({
      isValid: validationResult.isValid,
      validation: validationResult,
      isoCompliant: validationResult.isoCompliant || false
    });
  } catch (error) {
    console.error('Error validating metadata:', error);
    res.status(500).json({
      error: 'Failed to validate metadata',
      message: error.message
    });
  }
});

// Get metadata schema information
router.get('/schema/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const schema = await metadataRegistry.getSchema(type);
    
    if (!schema) {
      return res.status(404).json({
        error: 'Schema not found',
        type: type
      });
    }
    
    res.json(schema);
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({
      error: 'Failed to fetch schema',
      message: error.message
    });
  }
});

module.exports = router;