import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || []);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'assigned':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Natural Disaster Reports
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>{request.type}</TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.priority}
                    color={getPriorityColor(request.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{request.location || 'N/A'}</TableCell>
                <TableCell>{request.user ? `${request.user.firstName} ${request.user.lastName}` : 'Unknown'}</TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small" color="secondary">
                    <EditIcon />
                  </IconButton>
                  {request.status === 'pending' && (
                    <>
                      <IconButton size="small" color="success">
                        <ApproveIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <RejectIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RequestsPage;