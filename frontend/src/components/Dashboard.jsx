import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  IconButton,
  Collapse,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Logout } from '@mui/icons-material';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchDashboardData();
    fetchEmployeeData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/dashboard/employee-summary`, {
        params: {
          month: selectedMonth,
          year: selectedYear
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setLoading(false);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
<Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f9f9fb', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Employee Attendance Dashboard
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<Logout />}
          onClick={onLogout}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Logout
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Employees', value: stats?.totalEmployees || 0 },
          { label: 'Currently At Office', value: stats?.presentToday || 0 },
          { label: 'Checked In Today', value: stats?.checkedInToday || 0 },
          { label: 'Checked Out Today', value: stats?.checkedOutToday || 0 },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={2} sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 3 }}>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {item.label}
              </Typography>
              <Typography variant="h5" color="primary">
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Month</InputLabel>
          <Select value={selectedMonth} label="Month" onChange={handleMonthChange}>
            {months.map((month, index) => (
              <MenuItem key={month} value={index + 1}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Year</InputLabel>
          <Select value={selectedYear} label="Year" onChange={handleYearChange}>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Employee Table */}
      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'auto' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f0f0f3' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Present</strong></TableCell>
                <TableCell><strong>Absent</strong></TableCell>
                <TableCell><strong>Hours</strong></TableCell>
                <TableCell><strong>Avg In</strong></TableCell>
                <TableCell><strong>Avg Out</strong></TableCell>
                <TableCell><strong>Joined</strong></TableCell>
                <TableCell><strong>Days</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <EmployeeRow
                    key={employee._id}
                    employee={employee}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={employees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

const EmployeeRow = ({ employee, selectedMonth, selectedYear }) => {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployeeDetails = async () => {
    if (!open) {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/dashboard/employee-details/${employee._id}`,
          {
            params: { month: selectedMonth, year: selectedYear },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setDetails(response.data);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
      setLoading(false);
    }
    setOpen(!open);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={fetchEmployeeDetails}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{employee.name}</TableCell>
        <TableCell>{employee.totalPresent}</TableCell>
        <TableCell>{employee.totalAbsent}</TableCell>
        <TableCell>{employee.totalWorkingHours}</TableCell>
        <TableCell>{employee.avgCheckInTime}</TableCell>
        <TableCell>{employee.avgCheckOutTime}</TableCell>
        <TableCell>{new Date(employee.dateOfJoining).toLocaleDateString()}</TableCell>
        <TableCell>{employee.totalDaysSinceJoining}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Daily Attendance Details
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Check-in Time</TableCell>
                    <TableCell>Check-out Time</TableCell>
                    <TableCell>Working Hours</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : (
                    details.map((detail) => (
                      <TableRow key={detail.date}>
                        <TableCell>{new Date(detail.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>{detail.checkInTime || '-'}</TableCell>
                        <TableCell>{detail.checkOutTime || '-'}</TableCell>
                        <TableCell>{detail.workingHours || '-'}</TableCell>
                        <TableCell>{detail.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default Dashboard; 