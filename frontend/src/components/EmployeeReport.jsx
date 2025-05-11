import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Timeline,
  AccessTime,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';
import { formatDateIST, formatTimeIST } from '../utils/timeUtils';

const EmployeeReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // const response = await axios.get('http://localhost:3000/employee/report', {
      const response = await axios.get('/api/employee/report', {
        params: {
          month: selectedMonth,
          year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReportData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Card
      elevation={3}
      sx={{
        width: {xs: '100%', sm: 'auto'},
        height: '100%',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in={!loading}>
      <Box sx={{ p: 3, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Monthly Report
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month, index) => (
                  <MenuItem key={month} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 ,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          width: {xs: '100%', sm: '100%'}
        }}>
            <StatCard
              icon={<Timeline color="primary" />}
              title="Present Days"
              value={reportData?.totalPresent || 0}
              color="primary"
            />
            <StatCard
              icon={<AccessTime color="error" />}
              title="Absent Days"
              value={reportData?.totalAbsent || 0}
              color="error"
            />
            <StatCard
              icon={<TrendingUp color="success" />}
              title="Working Hours"
              value={`${reportData?.totalWorkingHours || 0}h`}
              color="success"
            />
            <StatCard
              icon={<CalendarToday color="info" />}
              title="On Time %"
              value={`${reportData?.onTimePercentage || 0}%`}
              color="info"
            />
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Daily Working Hours
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData?.dailyHours || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#2196f3" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Check-in Time Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData?.checkInTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#4caf50"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Fade>
  );
};

export default EmployeeReport; 