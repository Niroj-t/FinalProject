import type { ReactNode } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  People,
  Assignment as AssignmentIcon,
  School,
  TrendingUp,
  Refresh,
  AdminPanelSettings,
  Notifications
} from '@mui/icons-material';
import { useAdmin } from '../contexts/AdminContext';

type StatCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  subtitle?: string;
};

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box color={color} sx={{ fontSize: 40 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboardPage = () => {
  const { stats, loading, error, fetchStats, clearError } = useAdmin();

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            System overview and management
          </Typography>
        </Box>
        <IconButton onClick={fetchStats} color="primary" size="large">
          <Refresh />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Top Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        {/* User Statistics */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={stats?.users.total || 0}
            icon={<People fontSize="large" />}
            color="primary.main"
            subtitle={`${stats?.users.active || 0} active`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Students"
            value={stats?.users.students || 0}
            icon={<School fontSize="large" />}
            color="success.main"
            subtitle={`${stats?.users.activeLast30Days || 0} active (30d)`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Teachers"
            value={stats?.users.teachers || 0}
            icon={<AssignmentIcon fontSize="large" />}
            color="warning.main"
            subtitle={`${stats?.users.recent || 0} new (7d)`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Admins"
            value={stats?.users.admins || 0}
            icon={<AdminPanelSettings fontSize="large" />}
            color="error.main"
          />
        </Grid>

        {/* Content Statistics */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Assignments"
            value={stats?.assignments.total || 0}
            icon={<AssignmentIcon fontSize="large" />}
            color="info.main"
            subtitle={`${stats?.assignments.active || 0} active`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Submissions"
            value={stats?.submissions.total || 0}
            icon={<TrendingUp fontSize="large" />}
            color="secondary.main"
            subtitle={`${stats?.submissions.recent || 0} recent`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Overdue"
            value={stats?.assignments.overdue || 0}
            icon={<AssignmentIcon fontSize="large" />}
            color="error.main"
            subtitle="assignments"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Notifications"
            value={stats?.notifications.total || 0}
            icon={<Notifications fontSize="large" />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* System Overview (cards) */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Active Users</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.users.active || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">New Users (7d)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.users.recent || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'info.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Active Assignments</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.assignments.active || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">New Assignments (7d)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.assignments.recent || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Recent Submissions (7d)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.submissions.recent || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'text.secondary' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Total Notifications</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.notifications.total || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* User Activity (cards to match System Overview) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                User Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Students</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.users.students || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Teachers</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.users.teachers || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Admins</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.users.admins || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'info.main' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Active (30 days)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(stats?.users.activeLast30Days || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'text.secondary' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="caption" color="textSecondary">Inactive Users</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{(((stats?.users.total || 0) - (stats?.users.active || 0)) || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
