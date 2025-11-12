import { Box, Typography, Button } from '@mui/material';

export default function Hero() {
  return (
    <Box sx={{ textAlign: 'center', py: 20, background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)', borderRadius: 4, mb: 6 }}>
      <Typography variant="h2" fontWeight={700} gutterBottom>
        Welcome to Assignment Management
      </Typography>
      <Typography variant="h5" color="text.secondary" mb={6}>
        Effortlessly manage assignments, submissions, and notifications for teachers and students.
      </Typography>
      <Button variant="contained" color="primary" size="large">
        Get Started
      </Button>
    </Box>
  );
} 