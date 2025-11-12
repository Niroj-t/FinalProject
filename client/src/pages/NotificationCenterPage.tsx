import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, Stack, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'system';
  read: boolean;
  relatedId?: string;
  relatedType?: 'assignment' | 'submission';
  createdAt: string;
}

const NotificationCenterPage = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/notifications', {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.data.notifications || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
    // eslint-disable-next-line
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    setMarking(id);
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(n => n.map(notif => notif._id === id ? { ...notif, read: true } : notif));
    } catch {}
    setMarking(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await axios.delete(`/api/notifications/${id}`, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(n => n.filter(notif => notif._id !== id));
    } catch {}
    setDeleting(null);
  };

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Notifications</Typography>
          <Button onClick={fetchNotifications} disabled={loading}>Refresh</Button>
        </Stack>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Typography>No notifications.</Typography>
        ) : (
          <List>
            {notifications.map(n => (
              <ListItem key={n._id} divider alignItems="flex-start">
                <ListItemText
                  primary={<>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={n.read ? 'normal' : 'bold'}>{n.title}</Typography>
                      <Chip size="small" label={n.type} color={n.type === 'deadline' ? 'warning' : n.type === 'assignment' ? 'primary' : 'default'} />
                      {!n.read && <Chip size="small" label="Unread" color="secondary" />}
                    </Stack>
                  </>}
                  secondary={<>
                    <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>
                    {n.relatedId && n.relatedType && (
                      <>
                        {' | '}
                        <Button
                          component={RouterLink}
                          to={n.relatedType === 'assignment' ? `/assignments/${n.relatedId}` : n.relatedType === 'submission' ? `/assignments/${n.relatedId}` : '#'}
                          size="small"
                        >
                          View {n.relatedType.charAt(0).toUpperCase() + n.relatedType.slice(1)}
                        </Button>
                      </>
                    )}
                  </>}
                />
                <ListItemSecondaryAction>
                  {!n.read && (
                    <IconButton edge="end" aria-label="mark as read" onClick={() => handleMarkAsRead(n._id)} disabled={marking === n._id}>
                      <MarkEmailReadIcon />
                    </IconButton>
                  )}
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(n._id)} disabled={deleting === n._id}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationCenterPage; 