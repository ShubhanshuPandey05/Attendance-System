import { DateTime } from 'luxon';

// Get current time in IST
export const getCurrentIST = () => {
  return DateTime.now().setZone('Asia/Kolkata');
};

// Get start of day in IST
export const getStartOfDayIST = () => {
  return DateTime.now().setZone('Asia/Kolkata').startOf('day');
};

// Convert any date to IST
export const toIST = (date) => {
  return DateTime.fromJSDate(new Date(date)).setZone('Asia/Kolkata');
};

// Format time in IST
export const formatTimeIST = (date) => {
  return DateTime.fromJSDate(new Date(date)).setZone('Asia/Kolkata').toFormat('hh:mm:ss a');
};

// Format date in IST
export const formatDateIST = (date) => {
  return DateTime.fromISO(date, { zone: 'Asia/Kolkata' }).toFormat('dd/MM/yyyy');
};

// Check if a date is today in IST
export const isTodayIST = (date) => {
  const today = getStartOfDayIST();
  const checkDate = toIST(date).startOf('day');
  return today.hasSame(checkDate, 'day'); // Better than .equals for time zone safety
};