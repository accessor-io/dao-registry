const express = require('express');
const { ReservedSubdomainsService } = require('../services/metadata/reserved-subdomains-service');
const { ENSResolverService } = require('../services/metadata/ens-resolver-service');

const router = express.Router();

// Initialize services
const ensResolver = new ENSResolverService(/* provider */);
const reservedSubdomainsService = new ReservedSubdomainsService(ensResolver);

/**
 * @route GET /api/v1/reserved-subdomains
 * @desc Get all reserved subdomains or filter by priority
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { priority, category, limit = 100, offset = 0 } = req.query;

    let result;

    if (priority) {
      const priorityLevel = parseInt(priority);
      const words = reservedSubdomainsService.getReservedWordsByPriority(priorityLevel);
      result = {
        priority: priorityLevel,
        count: words.length,
        subdomains: words
      };
    } else if (category) {
      const subdomains = reservedSubdomainsService.getReservedWordsByCategory(category);
      result = {
        category,
        count: subdomains.length,
        subdomains: subdomains.map(info => ({
          subdomain: info.subdomain,
          priority: info.priority,
          description: info.description,
          allowedFor: info.allowedFor,
          restrictions: info.restrictions
        }))
      };
    } else {
      const allWords = reservedSubdomainsService.getAllReservedWords();
      const summary = reservedSubdomainsService.getReservedWordsSummary();
      
      result = {
        summary,
        subdomains: Array.from(allWords.entries()).map(([subdomain, info]) => ({
          subdomain,
          priority: info.priority,
          category: info.category,
          description: info.description,
          allowedFor: info.allowedFor,
          restrictions: info.restrictions
        }))
      };
    }

    // Apply pagination
    if (limit || offset) {
      const limitNum = parseInt(limit) || 100;
      const offsetNum = parseInt(offset) || 0;
      
      if (result.subdomains) {
        result.subdomains = result.subdomains.slice(offsetNum, offsetNum + limitNum);
      }
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting reserved subdomains:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reserved subdomains',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/reserved-subdomains/check/:subdomain
 * @desc Check if a subdomain is reserved
 * @access Public
 */
router.get('/check/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    const isReserved = reservedSubdomainsService.isReserved(subdomain);
    const priority = reservedSubdomainsService.getPriority(subdomain);
    const info = reservedSubdomainsService.getReservedSubdomainInfo(subdomain);

    res.json({
      success: true,
      data: {
        subdomain,
        isReserved,
        priority: isReserved ? priority : 0,
        info: info ? {
          category: info.category,
          description: info.description,
          allowedFor: info.allowedFor,
          restrictions: info.restrictions
        } : null
      }
    });
  } catch (error) {
    console.error('Error checking reserved subdomain:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check reserved subdomain',
      message: error.message
    });
  }
});

/**
 * @route POST /api/v1/reserved-subdomains/validate
 * @desc Validate a subdomain
 * @access Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { subdomain, parentDomain } = req.body;

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain is required'
      });
    }

    // Basic subdomain validation
    const validation = reservedSubdomainsService.validateSubdomain(subdomain);

    // ENS validation if parent domain provided
    let ensValidation = null;
    if (parentDomain) {
      ensValidation = await reservedSubdomainsService.validateENSSubdomain(parentDomain, subdomain);
    }

    res.json({
      success: true,
      data: {
        subdomain,
        parentDomain,
        validation,
        ensValidation
      }
    });
  } catch (error) {
    console.error('Error validating subdomain:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate subdomain',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/reserved-subdomains/priority/:priority
 * @desc Get reserved subdomains by priority level
 * @access Public
 */
router.get('/priority/:priority', async (req, res) => {
  try {
    const { priority } = req.params;
    const priorityLevel = parseInt(priority);

    if (priorityLevel < 1 || priorityLevel > 4) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority level. Must be 1-4'
      });
    }

    const words = reservedSubdomainsService.getReservedWordsByPriority(priorityLevel);
    const subdomains = words.map(subdomain => {
      const info = reservedSubdomainsService.getReservedSubdomainInfo(subdomain);
      return {
        subdomain,
        priority: info?.priority || priorityLevel,
        category: info?.category || 'Unknown',
        description: info?.description || '',
        allowedFor: info?.allowedFor || [],
        restrictions: info?.restrictions || []
      };
    });

    res.json({
      success: true,
      data: {
        priority: priorityLevel,
        count: subdomains.length,
        subdomains
      }
    });
  } catch (error) {
    console.error('Error getting reserved subdomains by priority:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reserved subdomains by priority',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/reserved-subdomains/category/:category
 * @desc Get reserved subdomains by category
 * @access Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const subdomains = reservedSubdomainsService.getReservedWordsByCategory(category);

    res.json({
      success: true,
      data: {
        category,
        count: subdomains.length,
        subdomains: subdomains.map(info => ({
          subdomain: info.subdomain,
          priority: info.priority,
          description: info.description,
          allowedFor: info.allowedFor,
          restrictions: info.restrictions
        }))
      }
    });
  } catch (error) {
    console.error('Error getting reserved subdomains by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reserved subdomains by category',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/reserved-subdomains/summary
 * @desc Get reserved subdomains summary statistics
 * @access Public
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = reservedSubdomainsService.getReservedWordsSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting reserved subdomains summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reserved subdomains summary',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/reserved-subdomains/available/:role
 * @desc Get available subdomains for a specific user role
 * @access Public
 */
router.get('/available/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const available = reservedSubdomainsService.getAvailableSubdomainsForRole(role);

    res.json({
      success: true,
      data: {
        role,
        count: available.length,
        subdomains: available.map(info => ({
          subdomain: info.subdomain,
          priority: info.priority,
          category: info.category,
          description: info.description,
          restrictions: info.restrictions
        }))
      }
    });
  } catch (error) {
    console.error('Error getting available subdomains for role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available subdomains for role',
      message: error.message
    });
  }
});

/**
 * @route POST /api/v1/reserved-subdomains/can-register
 * @desc Check if a user can register a reserved subdomain
 * @access Public
 */
router.post('/can-register', async (req, res) => {
  try {
    const { subdomain, userRole } = req.body;

    if (!subdomain || !userRole) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain and userRole are required'
      });
    }

    const canRegister = reservedSubdomainsService.canRegisterReservedSubdomain(subdomain, userRole);
    const isReserved = reservedSubdomainsService.isReserved(subdomain);
    const info = reservedSubdomainsService.getReservedSubdomainInfo(subdomain);

    res.json({
      success: true,
      data: {
        subdomain,
        userRole,
        isReserved,
        canRegister,
        info: info ? {
          priority: info.priority,
          category: info.category,
          description: info.description,
          allowedFor: info.allowedFor,
          restrictions: info.restrictions
        } : null
      }
    });
  } catch (error) {
    console.error('Error checking if user can register subdomain:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check registration permission',
      message: error.message
    });
  }
});

/**
 * @route POST /api/v1/reserved-subdomains/batch-validate
 * @desc Validate multiple subdomains at once
 * @access Public
 */
router.post('/batch-validate', async (req, res) => {
  try {
    const { subdomains, parentDomain } = req.body;

    if (!subdomains || !Array.isArray(subdomains)) {
      return res.status(400).json({
        success: false,
        error: 'Subdomains array is required'
      });
    }

    const results = [];

    for (const subdomain of subdomains) {
      const validation = reservedSubdomainsService.validateSubdomain(subdomain);
      
      let ensValidation = null;
      if (parentDomain) {
        ensValidation = await reservedSubdomainsService.validateENSSubdomain(parentDomain, subdomain);
      }

      results.push({
        subdomain,
        validation,
        ensValidation
      });
    }

    res.json({
      success: true,
      data: {
        total: results.length,
        valid: results.filter(r => r.validation.isValid).length,
        invalid: results.filter(r => !r.validation.isValid).length,
        results
      }
    });
  } catch (error) {
    console.error('Error batch validating subdomains:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch validate subdomains',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/reserved-subdomains/categories
 * @desc Get all available categories
 * @access Public
 */
router.get('/categories', async (req, res) => {
  try {
    const allWords = reservedSubdomainsService.getAllReservedWords();
    const categories = new Set();

    for (const [subdomain, info] of allWords) {
      categories.add(info.category);
    }

    res.json({
      success: true,
      data: {
        categories: Array.from(categories),
        count: categories.size
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/reserved-subdomains/priorities
 * @desc Get all priority levels with counts
 * @access Public
 */
router.get('/priorities', async (req, res) => {
  try {
    const summary = reservedSubdomainsService.getReservedWordsSummary();

    res.json({
      success: true,
      data: {
        priorities: [
          { level: 1, name: 'CRITICAL', count: summary.byPriority[1] },
          { level: 2, name: 'HIGH', count: summary.byPriority[2] },
          { level: 3, name: 'MEDIUM', count: summary.byPriority[3] },
          { level: 4, name: 'LOW', count: summary.byPriority[4] }
        ],
        total: summary.total
      }
    });
  } catch (error) {
    console.error('Error getting priorities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get priorities',
      message: error.message
    });
  }
});

module.exports = router; 