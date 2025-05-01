import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import EmployeeList from '../components/EmployeeList';
import AttendanceReport from '../components/AttendanceReport';
import Profile from '../components/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />
      
      {/* Admin Routes */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EmployeeList />
          </ProtectedRoute>
        }
      />
      
      {/* Shared Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <AttendanceReport />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 