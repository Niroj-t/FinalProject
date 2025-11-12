import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary', mt: 6 }}>
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Assignment Management. All rights reserved.
      </Typography>
    </Box>
  );
} 