import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeProfile from './components/EmployeeProfile';
import EmployeeReport from './components/EmployeeReport';
import BottomNav from './components/BottomNavigation';
import Attendance from './components/Attendance';
import Signup from './components/Signup';
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  // console.log(isAuthenticated);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [userRole, setUserRole] = useState(user?.role || 'employee');


  // console.log(user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole('employee');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login setUser={setUser} setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole}/>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <Signup />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                userRole === 'employee' ? (
                  <Navigate to="/attendance" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                  <Dashboard onLogout={handleLogout} userRole={userRole} />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/attendance"
            element={
              isAuthenticated ? (
                <ProtectedRoute allowedRoles={['employee']} userRole={userRole}>
                  <>
                    <Attendance user={user} />
                    <BottomNav onLogout={handleLogout} />
                  </>
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <ProtectedRoute allowedRoles={['employee']} userRole={userRole}>
                  <>
                    <EmployeeProfile  />
                    <BottomNav onLogout={handleLogout} />
                  </>
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/reports"
            element={
              isAuthenticated ? (
                <ProtectedRoute allowedRoles={['employee']} userRole={userRole}>
                  <>
                    <EmployeeReport />
                    <BottomNav onLogout={handleLogout} />
                  </>
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
