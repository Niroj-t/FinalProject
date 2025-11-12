import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import NewAssignmentPage from './pages/NewAssignmentPage';
import AssignmentDetailsPage from './pages/AssignmentDetailsPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import SubmissionsPage from './pages/SubmissionsPage';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAssignmentsPage from './pages/AdminAssignmentsPage';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Landing page for unauthenticated users at root */}
        <Route
          path="/"
          element={
            !user ? (
              <>
                <Navbar user={user} onLogout={handleLogout} />
                <Hero />
                <Footer />
              </>
            ) : user.role === 'admin' ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        {/* Auth pages as popups, but keep routes for direct access */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/new" element={<NewAssignmentPage />} />
          <Route path="/assignments/:id" element={<AssignmentDetailsPage />} />
          <Route path="/assignments/:id/submissions" element={<SubmissionsPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route 
            path="/admin/*" 
            element={
              <AdminProvider>
                <Box sx={{ display: 'flex' }}>
                  <AdminNavbar onLogout={handleLogout} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: { md: `calc(100% - 240px)` },
                      ml: { md: '240px' },
                      mt: '64px'
                    }}
                  >
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="assignments" element={<AdminAssignmentsPage />} />
                      <Route path="submissions" element={<AdminSubmissionsPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                      <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </Box>
                </Box>
              </AdminProvider>
            } 
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
