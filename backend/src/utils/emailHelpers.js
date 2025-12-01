/**
 * Helper functions for email template data processing
 */

/**
 * Calculate flight duration from departure and arrival times
 * @param {string} departureTime - Departure time (HH:mm format or ISO string)
 * @param {string} arrivalTime - Arrival time (HH:mm format or ISO string)
 * @returns {string} Duration in "Xh Ym" format
 */
function calculateDuration(departureTime, arrivalTime) {
  try {
    let depTime, arrTime;

    // Handle different time formats
    if (typeof departureTime === 'string') {
      if (departureTime.includes('T') || departureTime.includes(':')) {
        depTime = new Date(departureTime);
      } else {
        // Assume HH:mm format
        const [hours, minutes] = departureTime.split(':');
        depTime = new Date();
        depTime.setHours(parseInt(hours), parseInt(minutes), 0);
      }
    } else {
      depTime = departureTime;
    }

    if (typeof arrivalTime === 'string') {
      if (arrivalTime.includes('T') || arrivalTime.includes(':')) {
        arrTime = new Date(arrivalTime);
      } else {
        // Assume HH:mm format
        const [hours, minutes] = arrivalTime.split(':');
        arrTime = new Date();
        arrTime.setHours(parseInt(hours), parseInt(minutes), 0);
      }
    } else {
      arrTime = arrivalTime;
    }

    // Handle next day arrival
    if (arrTime < depTime) {
      arrTime.setDate(arrTime.getDate() + 1);
    }

    const diffMs = arrTime - depTime;
    const totalMinutes = Math.round(diffMs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '2h 0m'; // Default fallback
  }
}

/**
 * Calculate web check-in opening time (24 hours before departure)
 * @param {string} travelDate - Travel date (YYYY-MM-DD)
 * @param {string} departureTime - Departure time (HH:mm)
 * @returns {string} ISO timestamp
 */
function calculateWebCheckinOpens(travelDate, departureTime) {
  try {
    const [year, month, day] = travelDate.split('-');
    const [hours, minutes] = departureTime.split(':');
    
    const departureDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );

    // 24 hours before
    const checkinOpens = new Date(departureDateTime.getTime() - (24 * 60 * 60 * 1000));
    
    return checkinOpens.toISOString();
  } catch (error) {
    console.error('Error calculating web check-in time:', error);
    return new Date().toISOString();
  }
}

/**
 * Calculate airport reporting time (2 hours before departure)
 * @param {string} departureTime - Departure time (HH:mm)
 * @returns {string} Reporting time in HH:mm format
 */
function calculateReportingTime(departureTime) {
  try {
    const [hours, minutes] = departureTime.split(':');
    let reportHour = parseInt(hours) - 2;
    let reportMinute = parseInt(minutes);

    if (reportHour < 0) {
      reportHour += 24;
    }

    return `${String(reportHour).padStart(2, '0')}:${String(reportMinute).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error calculating reporting time:', error);
    return '08:30'; // Default
  }
}

/**
 * Calculate gate closing time (15 minutes before departure)
 * @param {string} departureTime - Departure time (HH:mm)
 * @returns {string} Gate closing time in HH:mm format
 */
function calculateGateClosing(departureTime) {
  try {
    const [hours, minutes] = departureTime.split(':');
    let gateHour = parseInt(hours);
    let gateMinute = parseInt(minutes) - 15;

    if (gateMinute < 0) {
      gateMinute += 60;
      gateHour -= 1;
    }

    if (gateHour < 0) {
      gateHour += 24;
    }

    return `${String(gateHour).padStart(2, '0')}:${String(gateMinute).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error calculating gate closing time:', error);
    return '10:15'; // Default
  }
}

/**
 * Format date for display
 * @param {string} dateStr - Date string (YYYY-MM-DD or ISO)
 * @returns {string} Formatted date (e.g., "Dec 30, 2025")
 */
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format date and time for display
 * @param {string} dateStr - Date string
 * @param {string} timeStr - Time string (HH:mm)
 * @returns {string} Formatted datetime
 */
function formatDateTime(dateStr, timeStr) {
  const formattedDate = formatDate(dateStr);
  return `${formattedDate} at ${timeStr}`;
}

/**
 * Extract time from datetime string
 * @param {string} datetimeStr - ISO datetime string
 * @returns {string} Time in HH:mm format
 */
function extractTime(datetimeStr) {
  if (!datetimeStr) return '10:30';
  try {
    const date = new Date(datetimeStr);
    if (isNaN(date.getTime())) {
      // Try parsing as HH:mm
      if (datetimeStr.includes(':')) {
        return datetimeStr.split(':').slice(0, 2).join(':');
      }
      return '10:30';
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '10:30';
  }
}

module.exports = {
  calculateDuration,
  calculateWebCheckinOpens,
  calculateReportingTime,
  calculateGateClosing,
  formatDate,
  formatDateTime,
  extractTime
};

