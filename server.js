require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const webpush = require('web-push');
const path = require('path');
// const { google } = require('googleapis');
const { getDistance } = require('geolib');
// const ipRangeCheck = require('ip-range-check');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Web Push configuration
webpush.setVapidDetails(
  'mailto:mail@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Models
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Attendance = require('./models/Attendance');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};


// Routes

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // console.log(user,password);
    // console.log(await user.comparePassword(password));

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/checkin', authenticateToken, async (req, res) => {
  try {
    // const forwarded = req.headers['x-forwarded-for'];
    // let clientIp = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    // console.log(clientIp);
    // clientIp = clientIp.replace('::ffff:', '').trim();
    // console.log(clientIp);

    // Check if IP is in office range
    // if (!ipRangeCheck(clientIp, process.env.OFFICE_IP_RANGE)) {
    //   return res.status(403).json({ error: 'Not connected to office network' });
    // }
    // if (
    //   clientIp !== process.env.OFFICE_IP_RANGE &&
    //   clientIp !== '127.0.0.1' &&
    //   clientIp !== '::1'
    // ) {
    //   return res.status(403).json({ error: 'Not connected to office network' });
    // }


    const { latitude, longitude } = req.body;

    const officeLocation = {
      latitude: process.env.lat,
      longitude: process.env.long,
    };

    const userLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    // console.log("office:", officeLocation, "user:", userLocation);


    const distance = getDistance(userLocation, officeLocation); // distance in meters
    // console.log(distance)

    if (distance > 100) {
      return res.status(403).json({ error: 'Not within office' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingCheckin = await Attendance.findOne({
      user: req.user.id,
      checkInTime: { $gte: today }
    });

    if (existingCheckin) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Create attendance record
    const attendance = new Attendance({
      user: req.user.id,
      checkInTime: new Date(),
    });
    await attendance.save();

    // Send push notification to admin
    const subscriptions = await Subscription.find();
    const user = await User.findById(req.user.id);
    const notificationPayload = {
      title: 'New Attendance Check-in',
      body: `${user.name} checked in at ${attendance.checkInTime.toLocaleTimeString()}`
    };

    const notificationPromises = subscriptions.map(subscription => {
      return webpush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      ).catch(err => {
        console.error('Error sending notification:', err);
        if (err.statusCode === 410) {
          return Subscription.findByIdAndDelete(subscription._id);
        }
      });
    });

    await Promise.all(notificationPromises);

    res.status(201).json({ message: 'Check-in successful' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Error processing check-in' });
  }
});

app.post('/api/checkout', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const officeLocation = {
      latitude: process.env.lat,
      longitude: process.env.long,
    };

    const userLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    // console.log("office:", officeLocation, "user:", userLocation);


    const distance = getDistance(userLocation, officeLocation); // distance in meters
    // console.log(distance)

    if (distance > 100) {
      return res.status(403).json({ error: 'Not within office' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      checkInTime: { $gte: today },
    });

    if (!attendance) {
      return res.status(400).json({ error: 'No active check-in found for today' });
    }
    if (attendance.status === 'checked-out') {
      return res.status(400).json({ error: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    attendance.status = 'checked-out';
    await attendance.save();

    res.json({ message: 'Check-out successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error processing check-out' });
  }
});

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      presentToday: await Attendance.countDocuments({
        checkInTime: { $gte: today },
        status: 'present'
      }),
      checkedInToday: await Attendance.countDocuments({
        checkInTime: { $gte: today },
      }),
      checkedOutToday: await Attendance.countDocuments({
        checkInTime: { $gte: today },
        status: 'checked-out'
      }),
      recentCheckins: await Attendance.find({ checkInTime: { $gte: today } })
        .populate('user', 'name email')
        .sort({ checkInTime: -1 })
        .limit(10)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

app.post('/api/attendance/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // console.log(user, today);
    const attendance = await Attendance.find({
      user: req.user.id,
      checkInTime: { $gte: today },
    });
    // console.log(attendance);
    if (attendance.length > 0) {
      if (attendance[0].status === 'present') {
        return res.json({ status: 'present', message: 'You already checked in today' });
      }
      return res.json({ status: 'checked-out', message: 'You already checked out today' });
    }
    return res.json({ status: null });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching attendance data' });
  }
})

app.get('/api/dashboard/employee-summary', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const employees = await User.find({ role: 'employee' });
    const employeeSummaries = await Promise.all(employees.map(async (employee) => {
      const attendances = await Attendance.find({
        user: employee._id,
        checkInTime: { $gte: startDate, $lte: endDate }
      });

      function getWorkingDaysUntilToday(year, month) {
        const today = new Date();
        const isCurrentMonth = parseInt(year) === today.getFullYear() && parseInt(month) === (today.getMonth() + 1);
        // console.log(year,today.getFullYear(),month,today.getMonth()+1)
        const daysInMonth = new Date(year, month, 0).getDate(); // Total days in month

        // console.log(isCurrentMonth);


        const lastDay = isCurrentMonth ? today.getDate() : daysInMonth;
        // console.log(today.getDate())
        // console.log(lastDay)

        let workingDays = 0;
        for (let day = 1; day <= lastDay; day++) {
          const date = new Date(year, month - 1, day); // JS months are 0-based
          const dayOfWeek = date.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
            workingDays++;
          }
        }

        return workingDays;
      }

      const totalPresent = attendances.length;
      const workingDaysUntilToday = getWorkingDaysUntilToday(year, month);
      const totalAbsent = workingDaysUntilToday - totalPresent;

      const workingHours = attendances.reduce((total, attendance) => {
        if (attendance.checkInTime && attendance.checkOutTime) {
          const hours = (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);

      const checkInTimes = attendances
        .filter(a => a.checkInTime)
        .map(a => new Date(a.checkInTime).getHours() + new Date(a.checkInTime).getMinutes() / 60);

      const checkOutTimes = attendances
        .filter(a => a.checkOutTime)
        .map(a => new Date(a.checkOutTime).getHours() + new Date(a.checkOutTime).getMinutes() / 60);

      const avgCheckInTime = checkInTimes.length > 0
        ? new Date(0, 0, 0, Math.floor(checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length))
        : null;

      const avgCheckOutTime = checkOutTimes.length > 0
        ? new Date(0, 0, 0, Math.floor(checkOutTimes.reduce((a, b) => a + b, 0) / checkOutTimes.length))
        : null;

      return {
        _id: employee._id,
        name: employee.name,
        totalPresent,
        totalAbsent,
        totalWorkingHours: workingHours.toFixed(2),
        avgCheckInTime: avgCheckInTime ? avgCheckInTime.toLocaleTimeString() : '-',
        avgCheckOutTime: avgCheckOutTime ? avgCheckOutTime.toLocaleTimeString() : '-',
        dateOfJoining: employee.dateOfJoining || new Date(),
        totalDaysSinceJoining: Math.floor((new Date() - (employee.dateOfJoining || new Date())) / (1000 * 60 * 60 * 24))
      };
    }));

    res.json(employeeSummaries);
  } catch (error) {
    console.error('Error fetching employee summary:', error);
    res.status(500).json({ error: 'Error fetching employee summary' });
  }
});

// Add new route for individual employee details
app.get('/api/dashboard/employee-details/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    // Add validation
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const attendances = await Attendance.find({
      user: id,
      checkInTime: { $gte: startDate, $lte: endDate }
    }).sort({ checkInTime: -1 });

    const details = attendances.map(attendance => ({
      date: attendance.checkInTime,
      checkInTime: attendance.checkInTime ? attendance.checkInTime.toLocaleTimeString() : '-',
      checkOutTime: attendance.checkOutTime ? attendance.checkOutTime.toLocaleTimeString() : '-',
      workingHours: attendance.checkInTime && attendance.checkOutTime
        ? ((attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60)).toFixed(2)
        : '-',
      status: attendance.status || 'absent'
    }));

    res.json(details);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ error: 'Error fetching employee details' });
  }
});

// Employee Profile Route
app.get('/api/employee/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Employee Report Route
app.get('/api/employee/report', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const attendances = await Attendance.find({
      user: req.user.id,
      checkInTime: { $gte: startDate, $lte: endDate }
    }).sort({ checkInTime: 1 });

    function getWorkingDaysUntilToday(year, month) {
      const today = new Date();
      const isCurrentMonth = parseInt(year) === today.getFullYear() && parseInt(month) === (today.getMonth() + 1);
      // console.log(year,today.getFullYear(),month,today.getMonth()+1)
      const daysInMonth = new Date(year, month, 0).getDate(); // Total days in month

      // console.log(isCurrentMonth);


      const lastDay = isCurrentMonth ? today.getDate() : daysInMonth;
      // console.log(today.getDate())
      // console.log(lastDay)

      let workingDays = 0;
      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(year, month - 1, day); // JS months are 0-based
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
          workingDays++;
        }
      }

      return workingDays;
    }

    const totalPresent = attendances.length;
    const workingDaysUntilToday = getWorkingDaysUntilToday(year, month);
    const totalAbsent = workingDaysUntilToday - totalPresent;

    const totalWorkingHours = attendances.reduce((total, attendance) => {
      if (attendance.checkInTime && attendance.checkOutTime) {
        const hours = (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);

    // Calculate on-time percentage (assuming 9:00 AM is the start time)
    const onTimeCount = attendances.filter(attendance => {
      const checkInHour = new Date(attendance.checkInTime).getHours();
      const checkInMinute = new Date(attendance.checkInTime).getMinutes();
      return checkInHour < 9 || (checkInHour === 9 && checkInMinute <= 0);
    }).length;

    const onTimePercentage = totalPresent ? Math.round((onTimeCount / totalPresent) * 100) : 0;

    // Prepare daily hours data for chart
    const dailyHours = attendances.map(attendance => ({
      date: new Date(attendance.checkInTime).toLocaleDateString(),
      hours: attendance.checkOutTime
        ? ((attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60)).toFixed(2)
        : 0
    }));

    // Prepare check-in trend data
    const checkInTrend = attendances.map(attendance => ({
      date: new Date(attendance.checkInTime).toLocaleDateString(),
      time: new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json({
      totalPresent,
      totalAbsent,
      totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
      onTimePercentage,
      dailyHours,
      checkInTrend
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Error fetching report' });
  }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 