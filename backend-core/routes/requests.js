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

// Get assigned requests (for volunteers)
router.get('/assigned', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    if (role !== 'volunteer') {
      return res.status(403).json({
        message: 'Only volunteers can access assigned requests'
      });
    }

    const requests = await EmergencyRequest.findAll({
      where: { 
        assignedVolunteerId: userId,
        status: ['assigned', 'in_progress'] // Show both assigned and in progress
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'phone']
        }
      ],
      order: [['assignedAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Get assigned requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch assigned requests',
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
  body('type').isIn(['flood', 'earthquake', 'landslide', 'tsunami', 'wildfire', 'cyclone', 'drought', 'other']).withMessage('Invalid disaster type'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
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

    const { 
      type, 
      description, 
      location, 
      coordinates, 
      address, 
      urgency, 
      contactInfo 
    } = req.body;

    // Validate that we have either location or coordinates+address
    if (!location && (!coordinates || !address)) {
      return res.status(400).json({
        message: 'Either location or coordinates with address is required'
      });
    }

    // Validate coordinates format if provided
    if (coordinates) {
      if (!coordinates.latitude || !coordinates.longitude) {
        return res.status(400).json({
          message: 'Coordinates must include both latitude and longitude'
        });
      }
      
      const lat = parseFloat(coordinates.latitude);
      const lng = parseFloat(coordinates.longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          message: 'Invalid coordinate values'
        });
      }
    }

    const request = await EmergencyRequest.create({
      userId: req.user.userId,
      type,
      description,
      location: location || address, // Use provided location or address as fallback
      coordinates: coordinates || null,
      address: address || location, // Use provided address or location as fallback
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
  body('status').isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']),
  body('completedBy').optional().isIn(['victim', 'volunteer', 'organization'])
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
    const { status, completedBy } = req.body;
    const { userId, role } = req.user;

    const request = await EmergencyRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    // Check if status change is allowed
    const statusCheck = request.canChangeStatus(status, role, userId);
    if (!statusCheck.valid) {
      return res.status(403).json({
        message: statusCheck.reason
      });
    }

    const updateData = {
      status,
      ...(status === 'completed' && { 
        completedAt: new Date(),
        completedBy: completedBy || role
      })
    };

    await request.update(updateData);

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

// Send message between victim and volunteer
router.post('/send-message', [
  authenticateToken,
  body('requestId').isUUID().withMessage('Valid request ID required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'),
  body('messageType').isIn(['victim_to_volunteer', 'volunteer_to_victim']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { requestId, message, messageType, volunteerId } = req.body;
    const { userId, role } = req.user;

    const request = await EmergencyRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phone'] },
        { model: User, as: 'assignedVolunteer', attributes: ['id', 'firstName', 'lastName', 'phone'] }
      ]
    });

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    // Verify user permissions
    if (messageType === 'victim_to_volunteer') {
      if (role !== 'victim' || request.userId !== userId) {
        return res.status(403).json({
          message: 'Only the victim of this request can send messages to volunteers'
        });
      }
      if (!request.assignedVolunteerId) {
        return res.status(400).json({
          message: 'No volunteer is assigned to this request yet'
        });
      }
    } else if (messageType === 'volunteer_to_victim') {
      if (role !== 'volunteer' || request.assignedVolunteerId !== userId) {
        return res.status(403).json({
          message: 'Only the assigned volunteer can send messages to the victim'
        });
      }
    }

    // For this example, we'll just return success
    // In a real app, you would save the message to a messages table
    // and send push notifications
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        requestId,
        messageType,
        sentAt: new Date(),
        recipient: messageType === 'victim_to_volunteer' ? 
          request.assignedVolunteer : request.user
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Failed to send message'
    });
  }
});

// Delete request with enhanced permission checks
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const request = await EmergencyRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    // Check if deletion is allowed
    if (!request.canDelete(role, userId)) {
      return res.status(403).json({
        message: 'Cannot delete this request. Requests that are assigned or in progress can only be completed or cancelled.',
        canDelete: false,
        currentStatus: request.status
      });
    }

    await request.destroy();

    res.json({
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      message: 'Failed to delete request'
    });
  }
});

// Get single request by ID (must be last to avoid conflicts with other routes)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const request = await EmergencyRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'assignedVolunteer',
          attributes: ['id', 'firstName', 'lastName', 'phone']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      });
    }

    // Check permissions - users can only view requests they're involved with
    const canView = 
      role === 'organization' || 
      role === 'admin' ||
      request.userId === userId ||
      request.assignedVolunteerId === userId;

    if (!canView) {
      return res.status(403).json({
        message: 'Not authorized to view this request'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({
      message: 'Failed to fetch request details'
    });
  }
});

module.exports = router;