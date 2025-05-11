const { DateTime } = require('luxon');

// Get current time in IST
const getCurrentIST = () => {
  return DateTime.now().setZone('Asia/Kolkata');
};

// Get start of day in IST
const getStartOfDayIST = () => {
  return DateTime.now().setZone('Asia/Kolkata').startOf('day');
};

// Convert any date to IST
const toIST = (date) => {
  return DateTime.fromJSDate(date).setZone('Asia/Kolkata');
};

// Format time in IST
const formatTimeIST = (date) => {
  return DateTime.fromJSDate(date).setZone('Asia/Kolkata').toFormat('hh:mm:ss a');
};

// Format date in IST
const formatDateIST = (date) => {
  return DateTime.fromJSDate(date).setZone('Asia/Kolkata').toFormat('dd/MM/yyyy');
};

// Check if a date is today in IST
const isTodayIST = (date) => {
  const today = getStartOfDayIST();
  const checkDate = DateTime.fromJSDate(date).setZone('Asia/Kolkata').startOf('day');
  return today.equals(checkDate);
};

module.exports = {
  getCurrentIST,
  getStartOfDayIST,
  toIST,
  formatTimeIST,
  formatDateIST,
  isTodayIST
}; 