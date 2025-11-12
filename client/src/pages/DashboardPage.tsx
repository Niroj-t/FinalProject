import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Stack, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import { blue, orange, green, red } from '@mui/material/colors';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../assets/react.svg';
import NewAssignmentPage from './NewAssignmentPage';

interface Assignment {
  id: string;
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  isActive: boolean;
  createdBy?: { name: string; email: string };
}

interface Submission {
  _id: string;
  assignmentId: {
    _id: string;
    title: string;
    dueDate: string;
    maxScore?: number;
    description?: string;
  };
  status: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
}

const DashboardPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  
  // Password change modal state
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('/api/assignments', {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data.data.assignments || []);
    } catch {
      setAssignments([]);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.put('/api/users/change-password', {
        currentPassword,
        newPassword,
      }, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Close modal after successful password change
      setTimeout(() => {
        setOpenPasswordModal(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    setOpenPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  useEffect(() => {
    if (token) fetchAssignments();
  }, [token]);

  useEffect(() => {
    if (token && user?.role === 'student') {
      axios.get('/api/submissions/my', {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setSubmissions(res.data.data.submissions || []))
        .catch(() => setSubmissions([]));
    }
  }, [token, user]);

  if (!user) return null;

  // --- User Avatar Helper ---
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // --- TEACHER DASHBOARD ---
  if (user.role === 'teacher') {
    // For stats (use only available data)
    const totalAssignments = assignments.length;
    const [submissionCounts, setSubmissionCounts] = useState<{ [assignmentId: string]: number }>({});

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

    // If you want to show real submission/pending stats, fetch or compute them from backend or related data
    // For now, use placeholders or just totalAssignments
    const totalSubmissions = 0; // Placeholder, update with real data if available
    const totalPending = 0; // Placeholder

    // For the table
    const now = new Date();
    const recentAssignments = assignments.slice(0, 5); // or sort by date, etc.
    return (
      <Box sx={{ bgcolor: '#f7fafd', minHeight: '100vh', pb: 6 }}>
        {/* Navbar */}
        <Box sx={{ bgcolor: 'white', boxShadow: 1, borderRadius: 2, mb: 4, px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={logo} sx={{ mr: 1, bgcolor: 'transparent', width: 40, height: 40 }} />
            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>
              Class Sync
            </Typography>
            <Stack direction="row" spacing={2} sx={{ ml: 4 }}>
              <Button component={RouterLink} to="/dashboard" color="primary" sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'primary.main', borderRadius: 0 }}>Dashboard</Button>
              <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => setOpenCreate(true)}>Create Assignment</Button>
              <Button component={RouterLink} to="/assignments" color="inherit" sx={{ fontWeight: 500 }}>Assignments</Button>
              <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => setOpenPasswordModal(true)}>Profile</Button>
            </Stack>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
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
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
          <NewAssignmentPage 
            inDialog 
            onClose={() => setOpenCreate(false)} 
            onAssignmentCreated={fetchAssignments}
          />
        </Dialog>

        {/* Password Change Modal */}
        <Dialog open={openPasswordModal} onClose={handleClosePasswordModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Change Password</Typography>
              <IconButton onClick={handleClosePasswordModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleChangePassword}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              {passwordError && <Alert severity="error" sx={{ mt: 2 }}>{passwordError}</Alert>}
              {passwordSuccess && <Alert severity="success" sx={{ mt: 2 }}>{passwordSuccess}</Alert>}
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordModal} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              variant="contained"
              color="primary"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Stats Overview */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: green[100], color: green[700], mr: 2, width: 48, height: 48 }}>
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{totalSubmissions}</Typography>
                  <Typography color="text.secondary" fontSize={15}>Submissions</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: orange[100], color: orange[700], mr: 2, width: 48, height: 48 }}>
                  <AccessTimeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{totalPending}</Typography>
                  <Typography color="text.secondary" fontSize={15}>Pending</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Recent Assignments Table */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight={700}>Recent Assignments</Typography>
            <Button component={RouterLink} to="/assignments" size="small" sx={{ textTransform: 'none', fontWeight: 500 }}>View all</Button>
          </Stack>
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
                {recentAssignments.map((a) => {
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
        </Box>
      </Box>
    );
  }

  // --- STUDENT DASHBOARD ---
  if (user.role !== 'student') return null;

  // --- Summary Card Calculations (real data) ---
  const totalAssignments = assignments.length;
  const submittedIds = new Set(submissions.map(s => s.assignmentId?._id).filter(Boolean));
  const now = new Date();
  const pendingAssignments = assignments.filter(a => {
    const due = new Date(a.dueDate);
    return !submittedIds.has(a._id || a.id) && due >= now;
  });
  const overdueAssignments = assignments.filter(a => {
    const due = new Date(a.dueDate);
    return !submittedIds.has(a._id || a.id) && due < now;
  });
  const submittedCount = submissions.length;

  // --- Recent Assignments Table Data (real data) ---
  const recentAssignments = assignments
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

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
            <Button component={RouterLink} to="/dashboard" color="primary" sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'primary.main', borderRadius: 0 }}>Dashboard</Button>
            <Button component={RouterLink} to="/assignments" color="inherit" sx={{ fontWeight: 500 }}>Assignments</Button>
            <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => setOpenPasswordModal(true)}>Profile</Button>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: blue[500], width: 36, height: 36, fontWeight: 700 }}>{getInitials(user.name)}</Avatar>
          <Typography fontWeight={600}>{user.name}</Typography>
          <IconButton
            color="error"
            onClick={() => {
              logout();
              navigate('/'); // <-- redirect to landing page after logout
            }}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: blue[100], color: blue[700], mr: 2 }}>
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{totalAssignments}</Typography>
                <Typography color="text.secondary" fontSize={15}>Total Assignments</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: orange[100], color: orange[700], mr: 2 }}>
                <AccessTimeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{pendingAssignments.length}</Typography>
                <Typography color="text.secondary" fontSize={15}>Pending</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: green[100], color: green[700], mr: 2 }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{submittedCount}</Typography>
                <Typography color="text.secondary" fontSize={15}>Submitted</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: red[100], color: red[700], mr: 2 }}>
                <WarningAmberIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{overdueAssignments.length}</Typography>
                <Typography color="text.secondary" fontSize={15}>Overdue</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Assignments Table */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight={700}>Recent Assignments</Typography>
          <Button component={RouterLink} to="/assignments" size="small" sx={{ textTransform: 'none', fontWeight: 500 }}>View all</Button>
        </Stack>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Assignment</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentAssignments.map(a => {
                const due = new Date(a.dueDate);
                const isOverdue = due < now && !submittedIds.has(a._id || a.id);
                const isSubmitted = submittedIds.has(a._id || a.id);
                let status = 'Pending';
                let color = 'warning';
                if (isSubmitted) {
                  status = 'Submitted';
                  color = 'success';
                } else if (isOverdue) {
                  status = 'Overdue';
                  color = 'error';
                }
                return (
                  <TableRow key={a._id || a.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{a.title}</Typography>
                      <Typography fontSize={13} color="text.secondary">{a.description}</Typography>
                    </TableCell>
                    <TableCell>{due.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={status} color={color as any} size="small" sx={{ fontWeight: 600, bgcolor: color === 'warning' ? orange[100] : color === 'success' ? green[100] : red[100], color: color === 'warning' ? orange[700] : color === 'success' ? green[700] : red[700] }} />
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
      </Box>

      {/* Password Change Modal */}
      <Dialog open={openPasswordModal} onClose={handleClosePasswordModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Change Password</Typography>
            <IconButton onClick={handleClosePasswordModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleChangePassword}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {passwordError && <Alert severity="error" sx={{ mt: 2 }}>{passwordError}</Alert>}
            {passwordSuccess && <Alert severity="success" sx={{ mt: 2 }}>{passwordSuccess}</Alert>}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            color="primary"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage; 