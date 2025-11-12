import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Stack, Badge, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, TextField, InputAdornment
} from '@mui/material';
import { blue, orange, green, red } from '@mui/material/colors';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../assets/react.svg';

interface Assignment {
  id: string;
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  isActive: boolean;
  createdBy?: { name: string; email: string };
}

const AssignmentsPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<{ [assignmentId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/assignments', {
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(res.data.data.assignments || []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAssignments();
  }, [token]);

  // Refresh assignments function
  const refreshAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/assignments', {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data.data.assignments || []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh assignments when component comes into focus
  useEffect(() => {
    const handleFocus = () => {
      if (token) refreshAssignments();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  useEffect(() => {
    if (!token || assignments.length === 0) return;
    const fetchCounts = async () => {
      const counts: { [assignmentId: string]: number } = {};
      await Promise.all(assignments.map(async (a) => {
        try {
          const res = await axios.get(`/api/submissions/assignment/${a._id || a.id}`, {
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
            headers: { Authorization: `Bearer ${token}` },
          });
          counts[a._id || a.id] = res.data.data.pagination?.total || 0;
        } catch {
          counts[a._id || a.id] = 0;
        }
      }));
      setSubmissionCounts(counts);
    };
    fetchCounts();
  }, [token, assignments]);

  if (!user) return null;

  // --- User Avatar Helper ---
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.isActive).length;
  const now = new Date();
  const overdueAssignments = assignments.filter(a => {
    const due = new Date(a.dueDate);
    return a.isActive && due < now;
  }).length;
  const upcomingAssignments = assignments.filter(a => {
    const due = new Date(a.dueDate);
    return a.isActive && due >= now;
  }).length;

  return (
    <Box sx={{ bgcolor: '#f7fafd', minHeight: '100vh', pb: 6 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1, borderRadius: 2, mb: 4, px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={logo} sx={{ mr: 1, bgcolor: 'transparent', width: 40, height: 40 }} />
          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>
            Class Sync
          </Typography>
          <Stack direction="row" spacing={2} sx={{ ml: 4 }}>
            <Button component={RouterLink} to="/dashboard" color="inherit" sx={{ fontWeight: 500 }}>Dashboard</Button>
            <Button component={RouterLink} to="/assignments" color="primary" sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'primary.main', borderRadius: 0 }}>Assignments</Button>
            <Button component={RouterLink} to="/profile" color="inherit" sx={{ fontWeight: 500 }}>Profile</Button>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Badge color="error" variant="dot" invisible={!hasUnread} sx={{ mr: 1 }}>
            <IconButton color="primary" onClick={() => setHasUnread(false)}>
              <NotificationsIcon />
            </IconButton>
          </Badge>
          <Avatar sx={{ bgcolor: blue[500], width: 36, height: 36, fontWeight: 700 }}>{getInitials(user.name)}</Avatar>
          <Typography fontWeight={600}>{user.name}</Typography>
          <IconButton
            color="error"
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: blue[100], color: blue[700], mr: 2, width: 48, height: 48 }}>
                <AssignmentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{totalAssignments}</Typography>
                <Typography color="text.secondary" fontSize={15}>Total Assignments</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: green[100], color: green[700], mr: 2, width: 48, height: 48 }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{activeAssignments}</Typography>
                <Typography color="text.secondary" fontSize={15}>Active</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: orange[100], color: orange[700], mr: 2, width: 48, height: 48 }}>
                <AccessTimeIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{upcomingAssignments}</Typography>
                <Typography color="text.secondary" fontSize={15}>Upcoming</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: red[100], color: red[700], mr: 2, width: 48, height: 48 }}>
                <WarningAmberIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{overdueAssignments}</Typography>
                <Typography color="text.secondary" fontSize={15}>Overdue</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={700}>All Assignments</Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              onClick={refreshAssignments}
              disabled={loading}
              sx={{ fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
        <Box sx={{ maxWidth: 250, mx: 'auto' }}>
          <TextField
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, width: '100%' }}
          />
        </Box>
      </Box>

      {/* Assignments Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Assignment</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Submissions</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssignments.map((a) => {
              // Compute status and color
              const due = new Date(a.dueDate);
              let status = 'Active';
              let color = blue[700] as string;
              let bg = blue[100] as string;
              if (!a.isActive) {
                status = 'Inactive';
                color = red[700] as string;
                bg = red[100] as string;
              } else if (due < now) {
                status = 'Overdue';
                color = orange[700] as string;
                bg = orange[100] as string;
              }
              return (
                <TableRow key={a._id || a.id}>
                  <TableCell>
                    <Typography fontWeight={600}>{a.title}</Typography>
                    <Typography fontSize={13} color="text.secondary">{a.description}</Typography>
                  </TableCell>
                  <TableCell>{due.toLocaleDateString()}</TableCell>
                  <TableCell>{submissionCounts[a._id || a.id] ?? 0}</TableCell>
                  <TableCell>
                    <Chip label={status} size="small" sx={{ fontWeight: 600, bgcolor: bg, color: color }} />
                  </TableCell>
                  <TableCell>
                    <Button component={RouterLink} to={`/assignments/${a._id || a.id}`} size="small" sx={{ textTransform: 'none', fontWeight: 500 }}>View</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAssignments.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No assignments found matching your search.' : 'No assignments created yet.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first assignment to get started.'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AssignmentsPage; 