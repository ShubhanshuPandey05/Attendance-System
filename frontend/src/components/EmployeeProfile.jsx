import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Fade,
  IconButton,
  Button
} from '@mui/material';
import {
  Email as EmailIcon,
  Today as TodayIcon,
  Work as WorkIcon,
  Edit as EditIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import axios from 'axios';

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // const response = await axios.get('http://localhost:3000/employee/profile', {
      const response = await axios.get('/api/employee/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, mt: 2 }}>
        <Skeleton variant="circular" width={150} height={150} sx={{ mx: 'auto' }} />
        <Skeleton variant="text" height={60} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Fade in={!loading}>
      <Box sx={{ p: 3, mb: 8, width: '100vw' }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 100,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              zIndex: 0
            }
          }}
        >
          <Avatar
            sx={{
              width: 150,
              height: 150,
              border: '5px solid white',
              boxShadow: 3,
              zIndex: 1,
              mt: 3
            }}
          >
            {profile?.name?.charAt(0)}
          </Avatar>

          <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
            {profile?.name}
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Employee ID: {profile?._id}
          </Typography>

          <Divider sx={{ width: '100%', mb: 3 }} />

          <List sx={{ width: '100%' }}>
            <ListItem>
              <ListItemIcon>
                <EmailIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Email"
                secondary={profile?.email}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <TodayIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Date of Joining"
                secondary={new Date(profile?.dateOfJoining).toLocaleDateString()}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <WorkIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Role"
                secondary={profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <BadgeIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Status"
                secondary="Active"
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Fade>
  );
};

export default EmployeeProfile; 