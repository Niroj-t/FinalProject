import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Grid
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Storage,
  Refresh
} from '@mui/icons-material';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    fileUploads: true,
    systemLogging: true
  });

  const handleSettingChange = (setting: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked
    });
  };

  const handleSaveSettings = () => {
    // Placeholder for saving settings
    console.log('Saving settings:', settings);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Configure system-wide settings and preferences.
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={<Settings />}
              title="General Settings"
              subheader="Basic system configuration"
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={handleSettingChange('maintenanceMode')}
                    />
                  }
                  label="Maintenance Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.userRegistration}
                      onChange={handleSettingChange('userRegistration')}
                    />
                  }
                  label="Allow User Registration"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.fileUploads}
                      onChange={handleSettingChange('fileUploads')}
                    />
                  }
                  label="Enable File Uploads"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={<Security />}
              title="Security Settings"
              subheader="Security and access control"
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemLogging}
                      onChange={handleSettingChange('systemLogging')}
                    />
                  }
                  label="System Activity Logging"
                />
                <Alert severity="info" sx={{ mt: 1 }}>
                  Security settings are managed by the backend configuration.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={<Notifications />}
              title="Notification Settings"
              subheader="Email and system notifications"
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleSettingChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Email configuration is required for notifications to work.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={<Storage />}
              title="System Information"
              subheader="Current system status"
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>Version:</strong> 1.0.0
                </Typography>
                <Typography variant="body2">
                  <strong>Environment:</strong> {import.meta.env.MODE}
                </Typography>
                <Typography variant="body2">
                  <strong>API URL:</strong> {import.meta.env.VITE_API_URL}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">System Actions</Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                >
                  Refresh System
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettingsPage;
