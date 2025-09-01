const express = require('express');
const { body, validationResult } = require('express-validator');
const { EmergencyRequest, User, Organization } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's own requests (for victims)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const requests = await EmergencyRequest.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'assignedVolunteer',
          attributes: ['firstName', 'lastName', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch your requests'
    });
  }
});

// Get available requests (for volunteers)
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const requests = await EmergencyRequest.findAll({
      where: { 
        status: 'pending',
        assignedVolunteerId: null 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Get available requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch available requests',
      error: error.message
    });
  }
});

// Get all requests (for organizations)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    
    if (role !== 'organization' && role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const requests = await EmergencyRequest.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'assignedVolunteer',
          attributes: ['firstName', 'lastName', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});

// Accept request (for volunteers)
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    if (role !== 'volunteer') {
      return res.status(403).json({
        message: 'Only volunteers can accept requests'
      });
    }

    const request = await EmergencyRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        message: 'Request is no longer available'
      });
    }

    await request.update({
      assignedVolunteerId: userId,
      status: 'assigned'
    });

    res.json({
      message: 'Request accepted successfully',
      data: request
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      message: 'Failed to accept request'
    });
  }
});

// Create emergency request (simplified for mobile)
router.post('/', [
  authenticateToken,
  body('type').isIn(['medical', 'natural_disaster', 'fire', 'security', 'infrastructure', 'supplies', 'other']).withMessage('Invalid emergency type'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').notEmpty().withMessage('Location is required'),
  body('urgency').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (req.user.role !== 'victim') {
      return res.status(403).json({
        message: 'Only victims can create emergency requests'
      });
    }

    const { type, description, location, urgency, contactInfo } = req.body;

    const request = await EmergencyRequest.create({
      userId: req.user.userId,
      type,
      description,
      location,
      urgency,
      contactInfo,
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      message: 'Failed to create request'
    });
  }
});

// Update request status
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const { userId, role } = req.user;

    const request = await EmergencyRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    // Check permissions
    if (role === 'victim' && request.userId !== userId) {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    if (role === 'volunteer' && request.assignedVolunteerId !== userId) {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    // Organizations can update any request
    if (role !== 'organization' && role !== 'admin') {
      // Additional permission checks for other roles
    }

    await request.update({
      status,
      ...(status === 'completed' && { completedAt: new Date() })
    });

    res.json({
      message: 'Request status updated',
      data: request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      message: 'Failed to update request status'
    });
  }
});

module.exports = router;

module.exports = router;