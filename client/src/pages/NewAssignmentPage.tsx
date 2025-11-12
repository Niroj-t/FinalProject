import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Paper, List, ListItem, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';

interface NewAssignmentPageProps {
  inDialog?: boolean;
  onClose?: () => void;
  onAssignmentCreated?: () => void;
}

const NewAssignmentPage = ({ inDialog = false, onClose, onAssignmentCreated }: NewAssignmentPageProps) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    instructions: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user || user.role !== 'teacher') {
    return <Alert severity="error">Only teachers can create assignments.</Alert>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
      files.forEach(file => formData.append('files', file));
      await axios.post('/api/assignments', formData, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Assignment created successfully!');
      setTimeout(() => {
        if (onAssignmentCreated) onAssignmentCreated();
        if (onClose) onClose();
        else navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      <Typography variant="h4" gutterBottom>Create Assignment</Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          multiline
          minRows={2}
        />
        <TextField
          label="Due Date"
          name="dueDate"
          type="datetime-local"
          value={form.dueDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Instructions"
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <Button
          variant="outlined"
          component="label"
          startIcon={<AttachFileIcon />}
          sx={{ mt: 2 }}
        >
          Attach Files
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.rar,.ppt,.pptx"
          />
        </Button>
        {files.length > 0 && (
          <List dense>
            {files.map((file, idx) => (
              <ListItem key={idx} secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveFile(idx)}>
                  <DeleteIcon />
                </IconButton>
              }>
                {file.name}
              </ListItem>
            ))}
          </List>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 2,
            fontWeight: 700,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: 2,
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Assignment'}
        </Button>
        {inDialog && onClose && (
          <Button onClick={onClose} sx={{ mt: 2 }} fullWidth>Close</Button>
        )}
      </form>
    </>
  );

  if (inDialog) {
    return <Box sx={{ p: 3 }}>{formContent}</Box>;
  }
  return (
    <Box maxWidth={500} mx="auto">
      <Paper sx={{ p: 3, mt: 3 }}>
        {formContent}
      </Paper>
    </Box>
  );
};

export default NewAssignmentPage; 