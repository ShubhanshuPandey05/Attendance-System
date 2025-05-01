const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  ipAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'checked-out'],
    default: 'present'
  },
  
});

// Create compound index for user and checkInTime
attendanceSchema.index({ user: 1, checkInTime: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema); 