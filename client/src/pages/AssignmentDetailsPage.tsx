import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Button, TextField, Stack, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  isActive: boolean;
  maxScore?: number;
  instructions?: string;
  createdBy?: { name: string; email: string };
  attachments?: string[];
}

const AssignmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', instructions: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/assignments/${id}`, {
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignment(res.data.data.assignment);
        setEditForm({
          title: res.data.data.assignment.title,
          description: res.data.data.assignment.description,
          dueDate: res.data.data.assignment.dueDate?.slice(0, 16) || '',
          instructions: res.data.data.assignment.instructions || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch assignment');
      } finally {
        setLoading(false);
      }
    };
    if (token && id) fetchAssignment();
  }, [token, id]);

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.put(`/api/assignments/${id}`, editForm, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
      setAssignment(a => a ? { ...a, ...editForm } : a);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/assignments/${id}`, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteDialog(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmitFile(e.target.files[0]);
    }
  };

  const handleSubmitAssignment = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const formData = new FormData();
      formData.append('text', submitText);
      if (submitFile) formData.append('files', submitFile);
      formData.append('assignmentId', id!);
      await axios.post('/api/submissions', formData, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmitSuccess('Submission successful!');
      setSubmitText('');
      setSubmitFile(null);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!assignment) return null;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Assignment Details</Typography>
        {editMode ? (
          <form onSubmit={handleEditSubmit}>
            <TextField label="Title" name="title" value={editForm.title} onChange={handleEditChange} fullWidth margin="normal" required />
            <TextField label="Description" name="description" value={editForm.description} onChange={handleEditChange} fullWidth margin="normal" required multiline minRows={2} />
            <TextField label="Instructions" name="instructions" multiline rows={4} value={editForm.instructions} onChange={handleEditChange} fullWidth margin="normal" />
            <TextField label="Due Date" name="dueDate" type="datetime-local" value={editForm.dueDate} onChange={handleEditChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <Stack direction="row" spacing={2} mt={2}>
              <Button type="submit" variant="contained" color="primary" disabled={editLoading}>{editLoading ? <CircularProgress size={24} /> : 'Save'}</Button>
              <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
            </Stack>
          </form>
        ) : (
          <>
            <Typography variant="h5">{assignment.title}</Typography>
            <Typography>Description: {assignment.description}</Typography>
            <Typography>Due: {new Date(assignment.dueDate).toLocaleString()}</Typography>
            {assignment.instructions && <Typography>Instructions: {assignment.instructions}</Typography>}
            {assignment.createdBy && <Typography>Created by: {assignment.createdBy.name}</Typography>}
            <Typography>Status: {assignment.isActive ? 'Active' : 'Inactive'}</Typography>
            {Array.isArray((assignment as any).attachments) && (assignment as any).attachments.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle1">Attachments:</Typography>
                <List dense>
                  {(assignment as any).attachments.map((file: string, idx: number) => (
                    <ListItem key={idx}>
                      <a href={file.startsWith('http') ? file : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${file.replace(/^\/+/, '')}`} target="_blank" rel="noopener noreferrer">
                        {file.split('/').pop()}
                      </a>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            {user?.role === 'teacher' && (
              <Stack direction="row" spacing={2} mt={2}>
                <Button variant="contained" onClick={() => setEditMode(true)}>Edit</Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate(`/assignments/${id}/submissions`)}
                >
                  View Submissions
                </Button>
                <Button variant="outlined" color="error" onClick={() => setDeleteDialog(true)}>Delete</Button>
              </Stack>
            )}
          </>
        )}
      </Paper>
      {user?.role === 'student' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Submit Assignment</Typography>
          <form onSubmit={handleSubmitAssignment}>
            <TextField
              label="Submission Text"
              value={submitText}
              onChange={e => setSubmitText(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
            <Button variant="outlined" component="label" sx={{ mt: 1 }}>
              Upload File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {submitFile && <Typography sx={{ mt: 1 }}>Selected: {submitFile.name}</Typography>}
            {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
            {submitSuccess && <Alert severity="success" sx={{ mt: 2 }}>{submitSuccess}</Alert>}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={submitLoading}>
              {submitLoading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </form>
        </Paper>
      )}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Assignment?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this assignment? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentDetailsPage; 