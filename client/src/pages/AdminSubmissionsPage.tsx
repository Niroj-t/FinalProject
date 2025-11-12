import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, FilterList, Refresh } from '@mui/icons-material';
import { useAdmin } from '../contexts/AdminContext';

const AdminSubmissionsPage: React.FC = () => {
  const {
    submissions,
    loading,
    error,
    fetchSubmissions,
    assignments,
    fetchAssignments,
    fetchSimilarityAlerts,
    clearError
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [similarityAlerts, setSimilarityAlerts] = useState<any[]>([]);
  const [alertAssignment, setAlertAssignment] = useState<{ id: string; title: string } | null>(null);

  const fetchSubmissionsData = async () => {
    const params: any = {
      page,
      limit: 10
    };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    const result = await fetchSubmissions(params);
    if (result?.pagination) {
      setTotalPages(result.pagination.pages || 1);
    }
  };

  useEffect(() => {
    fetchSubmissionsData();
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchAssignments({ limit: 100 });
  }, []);

  useEffect(() => {
    if (assignments.length > 0 && !selectedAssignment) {
      setSelectedAssignment(assignments[0]._id);
    }
  }, [assignments, selectedAssignment]);

  useEffect(() => {
    const loadAlerts = async () => {
      if (!selectedAssignment) {
        setSimilarityAlerts([]);
        setAlertAssignment(null);
        return;
      }
      setAlertsLoading(true);
      try {
        const result = await fetchSimilarityAlerts(selectedAssignment);
        if (result) {
          setSimilarityAlerts(result.submissions);
          setAlertAssignment(result.assignment);
        }
      } finally {
        setAlertsLoading(false);
      }
    };

    loadAlerts();
  }, [selectedAssignment]);

  const assignmentOptions = useMemo(() => {
    return assignments.map((assignment) => ({
      label: assignment.title,
      value: assignment._id
    }));
  }, [assignments]);

  // Grading removed from admin submissions view
  const getSubmissionStatus = (submission: any) => {
    const dueDateValue = submission?.assignment?.dueDate;
    if (!dueDateValue) {
      return <Chip label="—" color="default" size="small" />;
    }
    const dueDate = new Date(dueDateValue);
    const submittedAt = new Date(submission.submittedAt);
    const isLate = submittedAt > dueDate;
    return isLate
      ? <Chip label="Late" color="error" size="small" />
      : <Chip label="On Time" color="success" size="small" />;
  };

  const renderSimilarityBadge = (category: 'none' | 'low' | 'medium' | 'high') => {
    switch (category) {
      case 'high':
        return <Chip label="High" color="error" size="small" />;
      case 'medium':
        return <Chip label="Medium" color="warning" size="small" />;
      case 'low':
        return <Chip label="Low" color="info" size="small" />;
      default:
        return <Chip label="None" color="default" size="small" />;
    }
  };

  const formatScore = (score: number) => `${Math.round(score * 100)}%`;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Submission Management
        </Typography>
        <IconButton onClick={fetchSubmissionsData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Search submissions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="late">Late</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Assignment Alerts</InputLabel>
            <Select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              label="Assignment Alerts"
            >
              {assignmentOptions.length === 0 ? (
                <MenuItem value="" disabled>
                  No assignments available
                </MenuItem>
              ) : assignmentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Submissions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Assignment</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Similarity</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="textSecondary">No submissions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => {
                const matches = submission.similarityReport?.matches ?? [];
                const hasMatches = matches.length > 0;

                return (
                <TableRow key={submission._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {submission.assignment?.title || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {submission.submittedBy?.name || '—'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {submission.submittedBy?.email || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(submission.submittedAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {submission.assignment?.dueDate ? new Date(submission.assignment.dueDate).toLocaleDateString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {renderSimilarityBadge(submission.similarityReport?.category || 'none')}
                      <Typography variant="body2" color="textSecondary">
                        {formatScore(submission.similarityReport?.score || 0)}
                      </Typography>
                      {hasMatches && (
                        <Tooltip
                          title={
                            <Box display="flex" flexDirection="column" gap={0.5}>
                              {matches.map((match: any) => (
                                <Typography key={match.submissionId} variant="body2">
                                  {formatScore(match.score)}
                                </Typography>
                              ))}
                            </Box>
                          }
                          arrow
                        >
                          <FilterList fontSize="small" color="action" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getSubmissionStatus(submission)}
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>

      {/* Similarity Alerts */}
      <Paper sx={{ p: 2, mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Similarity Alerts {alertAssignment ? `– ${alertAssignment.title}` : ''}
          </Typography>
          {alertsLoading && <CircularProgress size={24} />}
        </Box>
        {similarityAlerts.length === 0 && !alertsLoading ? (
          <Typography color="textSecondary">
            No flagged submissions for the selected assignment.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Similarity</TableCell>
                <TableCell>Matches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {similarityAlerts.map((alert) => (
                <TableRow key={alert._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {alert.student?.name || '—'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {alert.student?.email || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(alert.submittedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(alert.submittedAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {renderSimilarityBadge(alert.similarityReport?.category || 'none')}
                      <Typography variant="body2" color="textSecondary">
                        {formatScore(alert.similarityReport?.score || 0)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {alert.similarityReport?.matches?.length ? (
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        {alert.similarityReport.matches.map((match: any) => (
                          <Box key={match.submissionId} display="flex" justifyContent="space-between">
                            <Typography variant="body2">
                              {match.student?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatScore(match.score)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No matching submissions recorded.
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default AdminSubmissionsPage;
