import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Attendance System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            {user?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/employees">Employees</Nav.Link>
                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
                <Nav.Link as={Link} to="/settings">Settings</Nav.Link>
              </>
            )}
            {user?.role === 'employee' && (
              <>
                <Nav.Link as={Link} to="/profile">My Profile</Nav.Link>
                <Nav.Link as={Link} to="/attendance">My Attendance</Nav.Link>
                <Nav.Link as={Link} to="/leave-requests">Leave Requests</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">Welcome, {user.name}</span>
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 