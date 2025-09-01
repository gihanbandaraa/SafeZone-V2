import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
} from '@mui/material';

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable email notifications"
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-approve emergency requests"
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={<Switch />}
              label="Maintenance mode"
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <TextField
              fullWidth
              label="Maximum response time (hours)"
              type="number"
              defaultValue={24}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Emergency hotline number"
              defaultValue="+1-800-EMERGENCY"
              sx={{ mb: 2 }}
            />
            
            <Button variant="contained" color="primary">
              Save Settings
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Admin Profile
            </Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              defaultValue="System Administrator"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Email"
              defaultValue="admin@safezone.com"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              defaultValue="+1-555-0123"
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Change Password
            </Typography>
            
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type="password"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              sx={{ mb: 2 }}
            />
            
            <Button variant="contained" color="secondary">
              Update Profile
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;