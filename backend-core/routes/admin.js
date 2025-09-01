const express = require('express');
const { User, Organization, EmergencyRequest } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get simple stats for dashboard
router.get('/stats', [
  authenticateToken,
  authorizeRoles(['admin'])
], async (req, res) => {
  try {
    const [
      totalUsers,
      totalRequests,
      totalOrganizations,
      activeRequests
    ] = await Promise.all([
      User.count(),
      EmergencyRequest.count(),
      Organization.count(),
      EmergencyRequest.count({ where: { status: ['pending', 'assigned', 'in_progress'] } })
    ]);

    res.json({
      totalUsers,
      totalRequests,
      totalOrganizations,
      activeRequests
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
});

// Get dashboard stats
router.get('/dashboard', [
  authenticateToken,
  authorizeRoles(['admin'])
], async (req, res) => {
  try {
    const [
      totalUsers,
      pendingUsers,
      totalRequests,
      activeRequests,
      totalOrganizations,
      verifiedOrganizations
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: 'pending' } }),
      EmergencyRequest.count(),
      EmergencyRequest.count({ where: { status: ['pending', 'assigned', 'in_progress'] } }),
      User.count({ where: { role: 'organization' } }),
      Organization.count({ where: { verified: true } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        pendingUsers,
        totalRequests,
        activeRequests,
        totalOrganizations,
        verifiedOrganizations
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// Get all users
router.get('/users', [
  authenticateToken,
  authorizeRoles(['admin'])
], async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Organization,
          as: 'organization',
          required: false
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Update user status
router.patch('/users/:id/status', [
  authenticateToken,
  authorizeRoles(['admin'])
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ status });

    res.json({
      success: true,
      message: 'User status updated',
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// Get all requests (admin view)
router.get('/requests', [
  authenticateToken,
  authorizeRoles(['admin'])
], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const { count, rows: requests } = await EmergencyRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'assignedOrganization',
          attributes: ['firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: User,
          as: 'assignedVolunteer',
          attributes: ['firstName', 'lastName', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get admin requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

module.exports = router;