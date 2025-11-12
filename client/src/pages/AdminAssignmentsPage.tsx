import { useState, useEffect } from 'react';
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
  IconButton
} from '@mui/material';
import {
  Search,
  Refresh,
  Warning
} from '@mui/icons-material';
import { useAdmin } from '../contexts/AdminContext';

const AdminAssignmentsPage = () => {
  const {
    assignments,
    loading,
    error,
    fetchAssignments,
    clearError
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAssignmentsData = async () => {
    const params: any = {
      page,
      limit: 10
    };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    const result = await fetchAssignments(params);
    if (result?.pagination) {
      setTotalPages(result.pagination.pages || 1);
    }
  };

  useEffect(() => {
    fetchAssignmentsData();
  }, [page, search, statusFilter]);

  const getStatusChip = (assignment: any) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now && assignment.isActive;

    if (isOverdue) {
      return <Chip label="Overdue" color="error" size="small" icon={<Warning />} />;
    } else if (assignment.isActive) {
      return <Chip label="Active" color="success" size="small" />;
    } else {
      return <Chip label="Inactive" color="default" size="small" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Assignment Management
        </Typography>
        <IconButton onClick={fetchAssignmentsData} color="primary">
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
            label="Search assignments"
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Assignments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">No assignments found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {assignment.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {assignment.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {assignment.createdBy?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {assignment.createdBy?.role || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '—'}
                      </Typography>
                      {assignment.dueDate && (
                        <Typography 
                          variant="caption" 
                          color={new Date(assignment.dueDate) < new Date() ? 'error.main' : 'text.secondary'}
                        >
                          {getDaysUntilDue(assignment.dueDate)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(assignment)}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
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
    </Box>
  );
};

export default AdminAssignmentsPage;
