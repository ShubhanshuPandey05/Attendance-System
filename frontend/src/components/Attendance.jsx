import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
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
      const response = await axios.post(
        'http://localhost:3000/attendance/today',
        { user },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setStatus(response.data.status);
      setMessage(response.data.message || '');
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          setLoading(true);
          await axios.post(
            'http://localhost:3000/checkin',
            { latitude, longitude },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          setStatus('present');
          setMessage('Successfully checked in');
          setError('');
        } catch (error) {
          if (error.response?.data?.error === "Already checked in today") {
            setStatus('present');
            setError('Already checked in today');
          } else {
            setError(error.response?.data?.error || 'Check-in failed');
            setMessage('');
          }
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Location access denied or unavailable.");
      }
    );
  };

  const handleCheckOut = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoading(true);
          await axios.post('http://localhost:3000/checkout', { latitude, longitude }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setStatus('checked-out');
          setMessage('Successfully checked out');
          setError('');
        } catch (error) {
          if (error.response?.data?.error === "Already checked out today") {
            setStatus('checked-out');
            setError('Already checked out today');
          }
          else {
            setError(error.response?.data?.error || 'Check-out failed');
            setMessage('');
          }
        } finally {
          setLoading(false);
        }
      }
    )
  };

  return (
    // <Container
    //   maxWidth="sm"
    //   sx={{
    //     height: '100vh',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center'
    //   }}
    // >
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        padding: 3,
        textAlign: 'center',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome {user.name}
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 4, alignSelf: 'center' }} />
      ) : (
        <>
          {message && (
            <Alert severity="success" sx={{ my: 2, maxWidth: '800px', alignSelf: 'center' }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          {status === null && (
            <Button
              onClick={handleCheckIn}
              sx={{
                width: 250,
                height: 250,
                borderRadius: '50%',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                mt: 4,
                alignSelf: 'center',
                backgroundColor: '#1976d2',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#115293'
                }
              }}
            >
              Check In
            </Button>
          )}

          {status === 'present' && (
            <Button
              onClick={handleCheckOut}
              sx={{
                width: 250,
                height: 250,
                borderRadius: '50%',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                mt: 4,
                alignSelf: 'center',
                backgroundColor: '#9c27b0',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#6a0080'
                }
              }}
            >
              Check Out
            </Button>
          )}

          {status === 'checked-out' && (
            <Typography variant="h6" sx={{ mt: 4 }}>
              You have already checked out today.
            </Typography>
          )}
        </>
      )}
    </Paper>
    // </Container>
  );
};

export default Attendance;
