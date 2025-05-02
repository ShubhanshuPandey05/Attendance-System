import { useState, useEffect } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Slide,
  useScrollTrigger
} from '@mui/material';
import {
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const HideOnScroll = ({ children }) => {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="up" in={!trigger}>
      {children}
    </Slide>
  );
};

const BottomNav = ({ onLogout }) => {
  const [value, setValue] = useState('attendance');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update the navigation value based on current path
    const path = location.pathname.split('/')[1] || 'attendance';
    setValue(path);
  }, [location]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(`/${newValue}`);
  };

  return (
    <HideOnScroll>
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 1000,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
        }} 
        elevation={3}
      >
        <BottomNavigation
          value={value}
          onChange={handleChange}
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main'
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              '&.Mui-selected': {
                fontSize: '0.875rem'
              }
            }
          }}
        >
          <BottomNavigationAction
            label="Attendance"
            value="attendance"
            icon={<TimerIcon />}
          />
          <BottomNavigationAction
            label="Reports"
            value="reports"
            icon={<AssessmentIcon />}
          />
          <BottomNavigationAction
            label="Profile"
            value="profile"
            icon={<PersonIcon />}
          />
          <BottomNavigationAction
            label="Logout"
            value=""
            icon={<LogoutIcon />}
            onClick={onLogout}
          />
        </BottomNavigation>
      </Paper>
    </HideOnScroll>
  );
};

export default BottomNav; 