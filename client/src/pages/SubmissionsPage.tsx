import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Badge,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid
} from '@mui/material';
import { blue, orange, green, red } from '@mui/material/colors';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/react.svg';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  instructions?: string;
  maxScore?: number;
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
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  feedback?: string;
  submittedAt: string;
}

const SubmissionsPage = () => {
  const { user, token, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch assignment details
        const assignmentRes = await axios.get(`/api/assignments/${id}`, {
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignment(assignmentRes.data.data.assignment);

        // Fetch submissions
        const submissionsRes = await axios.get(`/api/submissions/assignment/${id}`, {
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(submissionsRes.data.data.submissions || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchData();
    }
  }, [token, id]);

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedSubmission(null);
  };

  if (!user) return null;

  // --- User Avatar Helper ---
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Calculate stats
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const lateCount = submissions.filter(s => s.status === 'late').length;
  const now = new Date();
  const dueDate = assignment ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate && dueDate < now;

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
            <Button component={RouterLink} to="/assignments" color="inherit" sx={{ fontWeight: 500 }}>Assignments</Button>
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

      {/* Assignment Info */}
      {assignment && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {assignment.title}
            </Typography>
            <Typography color="text.secondary" paragraph>
              {assignment.description}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                color={isOverdue ? 'error' : 'primary'}
                variant="outlined"
              />
              {assignment.maxScore && (
                <Chip 
                  label={`Max Score: ${assignment.maxScore}`}
                  variant="outlined"
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: blue[100], color: blue[700], mr: 2, width: 48, height: 48 }}>
                <AssignmentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{totalSubmissions}</Typography>
                <Typography color="text.secondary" fontSize={15}>Total Submissions</Typography>
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
                <Typography variant="h5" fontWeight={700}>{submittedCount}</Typography>
                <Typography color="text.secondary" fontSize={15}>Submitted</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: orange[100], color: orange[700], mr: 2, width: 48, height: 48 }}>
                <WarningAmberIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{lateCount}</Typography>
                <Typography color="text.secondary" fontSize={15}>Late</Typography>
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
                <Typography variant="h5" fontWeight={700}>{totalSubmissions - submittedCount - lateCount}</Typography>
                <Typography color="text.secondary" fontSize={15}>Pending</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submissions Table */}
      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>Submissions</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => {
                const submittedDate = new Date(submission.submittedAt);
                const dueDate = new Date(submission.assignmentId.dueDate);
                const isLate = submittedDate > dueDate;
                
                let status = 'Submitted';
                let color = green[700] as string;
                let bg = green[100] as string;
                
                if (isLate) {
                  status = 'Late';
                  color = orange[700] as string;
                  bg = orange[100] as string;
                }

                return (
                  <TableRow key={submission._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: blue[500], width: 32, height: 32, fontSize: 14 }}>
                          {getInitials(submission.studentId.name)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{submission.studentId.name}</Typography>
                          <Typography fontSize={13} color="text.secondary">{submission.studentId.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {submittedDate.toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {submittedDate.toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={status} 
                        size="small" 
                        sx={{ fontWeight: 600, bgcolor: bg, color: color }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewSubmission(submission)}
                        sx={{ textTransform: 'none', fontWeight: 500 }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {submissions.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No submissions yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students will appear here once they submit their assignments.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* View Submission Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Submission Details - {selectedSubmission?.studentId.name}
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box>
              <Typography variant="h6" gutterBottom>Student Information</Typography>
              <Typography><strong>Name:</strong> {selectedSubmission.studentId.name}</Typography>
              <Typography><strong>Email:</strong> {selectedSubmission.studentId.email}</Typography>
              <Typography><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</Typography>
              
              {selectedSubmission.feedback && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Feedback</Typography>
                  <Typography>{selectedSubmission.feedback}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmissionsPage;