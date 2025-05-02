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
import NotificationSettings from './NotificationSettings';

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
      const response = await axios.get('/api/dashboard', {
        // const response = await axios.get('http://localhost:3000/api/dashboard', {
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
      const response = await axios.get(`/api/dashboard/employee-summary`, {
      // const response = await axios.get(`http://localhost:3000/api/dashboard/employee-summary`, {
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

  const StatCard = ({ title, value, bgColor }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: { xs: '47%', sm: '100%' },
        width: { xs: '47%', sm: '24%' },
        backgroundColor: bgColor,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        // minHeight: { xs: '100px', sm: '120px' }
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: { xs: '1rem', sm: '1.5rem' },
          fontWeight: 600,
          color: 'rgba(0, 0, 0, 0.7)',
          mb: 1.5
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 500,
          color: 'rgba(0, 0, 0, 0.8)',
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        {value}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'hidden'
      }}
    >
      <Box sx={{
        width: '100vw',
        height: '100vh',
        p: { xs: 2, sm: 3 },
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            width: '100%',
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.2rem', sm: '2rem' },
              color: 'rgba(0, 0, 0, 0.87)'
            }}
          >
            Employee Attendance Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#ffd6d6',
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: '#ffbdbd',
                },
                textTransform: 'none',
                boxShadow: 'none',
                px: 2.5,
                py: 0.5,
                fontSize: { xs: '0.8rem', sm: '1.2rem' },
                fontWeight: 400,
                minWidth: { xs: 'auto', sm: '150px' }
              }}
              onClick={onLogout}
            >
              LogOut
            </Button>
          </Box>
        </Box>
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: { xs: 2, sm: 3 }
        }}>
          <NotificationSettings />
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'flex',
            height: '35%',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            // border: '1px solid red',
            overflow: 'auto',
            mb: { xs: 4, sm: 4 }
          }}
        >
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            bgColor="rgba(227, 242, 253, 0.95)"
          />
          <StatCard
            title="Currently At Office"
            value={stats?.presentToday || 0}
            bgColor="rgba(232, 245, 233, 0.95)"
          />
          <StatCard
            title="Checked In Today"
            value={stats?.checkedInToday || 0}
            bgColor="rgba(243, 229, 245, 0.95)"
          />
          <StatCard
            title="Checked Out Today"
            value={stats?.checkedOutToday || 0}
            bgColor="rgba(255, 243, 224, 0.95)"
          />
        </Box>

        {/* Filters */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row' },
          gap: 2,
          mb: { xs: 2, sm: 3 }
        }}>
          <FormControl
            sx={{
              width: { xs: '48%', sm: '180px' }
            }}
            size="small"
          >
            <InputLabel sx={{
              backgroundColor: '#f5f5f5',
              px: 1,
              '&.Mui-focused': {
                backgroundColor: '#f5f5f5'
              }
            }}>
              Month
            </InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={handleMonthChange}
              sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              {months.map((month, index) => (
                <MenuItem key={month} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{
              width: { xs: '48%', sm: '180px' }
            }}
            size="small"
          >
            <InputLabel sx={{
              backgroundColor: '#f5f5f5',
              px: 1,
              '&.Mui-focused': {
                backgroundColor: '#f5f5f5'
              }
            }}>
              Year
            </InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={handleYearChange}
              sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Employee Table */}
        <Box
          sx={{
            borderRadius: 1,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            overflow: 'auto',
            backgroundColor: 'white',
            // height: '65%'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              px: 2,
              py: 1.5,
              fontWeight: 500,
              fontSize: '1rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white'
            }}
          >
            Employee Table
          </Typography>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      width: '48px',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Name</TableCell>
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Present</TableCell>
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Absent</TableCell>
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Hours</TableCell>
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Avg In</TableCell>
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Avg Out</TableCell>
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Joined</TableCell>
                  <TableCell sx={{
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>Days</TableCell>
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
        </Box>
      </Box>
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
          // `http://localhost:3000/api/dashboard/employee-details/${employee._id}`,
          `/api/dashboard/employee-details/${employee._id}`,
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