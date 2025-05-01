import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const Attendance = ({ user }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await axios.get('http://localhost:3000/attendance/today', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:3000/checkin', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStatus('present');
      setMessage('Successfully checked in');
      setError('');
    } catch (error) {
      if(error.response?.data?.error === "Already checked in today"){
        setStatus('present');
        setError('Already checked in today');
        // setError('');
      }
      else{
        setError(error.response?.data?.error || 'Check-in failed');
        setMessage('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:3000/checkout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStatus('checked-out');
      setMessage('Successfully checked out');
      setError('');
    } catch (error) {
      if(error.response?.data?.error === "Already checked out today"){
        setStatus('checked-out');
        setError('Already checked out today');
      }
      else{
        setError(error.response?.data?.error || 'Check-out failed');
        setMessage('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user.name}
          </Typography>

          {loading ? (
            <CircularProgress sx={{ mt: 4 }} />
          ) : (
            <>
              {message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {status === null && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleCheckIn}
                  sx={{ mt: 2 }}
                >
                  Check In
                </Button>
              )}

              {status === 'present' && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={handleCheckOut}
                  sx={{ mt: 2 }}
                >
                  Check Out
                </Button>
              )}

              {status === 'checked-out' && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  You have already checked out for today.
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Attendance; 