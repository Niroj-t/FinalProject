import { AppBar, Toolbar, Typography, Box, Button, IconButton, Dialog } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CloseIcon from '@mui/icons-material/Close';
import logo from '../assets/react.svg';

interface NavbarProps {
  user?: { name: string; role?: string } | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSwitchToRegister = () => {
    setOpenLogin(false);
    setOpenRegister(true);
  };

  const handleSwitchToLogin = () => {
    setOpenRegister(false);
    setOpenLogin(true);
  };

  const showCreateAssignment =
    user && user.role === 'teacher' && location.pathname === '/assignments';

  return (
    <AppBar position="static" color="default" elevation={2} sx={{ mb: 4 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
          <Typography variant="h6" color="inherit" noWrap>
            ClassSync
          </Typography>
        </Box>
        {showCreateAssignment && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2, fontWeight: 700 }}
            onClick={() => navigate('/assignments/new')}
          >
            Create Assignment
          </Button>
        )}
        <Box>
          {user ? (
            <Button color="error" variant="outlined" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <Button color="primary" variant="outlined" sx={{ mr: 1 }} onClick={() => setOpenLogin(true)}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
      <Dialog open={openLogin} onClose={() => setOpenLogin(false)} maxWidth="xs" fullWidth>
        <IconButton onClick={() => setOpenLogin(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
        <Box sx={{ p: 3, pt: 5 }}>
          <LoginPage onSwitchToRegister={handleSwitchToRegister} />
        </Box>
      </Dialog>
      <Dialog open={openRegister} onClose={() => setOpenRegister(false)} maxWidth="xs" fullWidth>
        <IconButton onClick={() => setOpenRegister(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
        <Box sx={{ p: 3, pt: 5 }}>
          <RegisterPage onSwitchToLogin={handleSwitchToLogin} />
        </Box>
      </Dialog>
    </AppBar>
  );
} 