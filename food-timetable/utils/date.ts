// Helper to convert "HH:MM:SS" to minutes since midnight
export const parseTimeToMinutes = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper to format "HH:MM:SS" to "h:mm A" (like "11:00 AM")
export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12 // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}
// Format date with local timezone offset in ISO 8601 format
export const formatLocalISOString = (date: Date) => {
  // Get timezone offset in minutes
  const tzOffset = date.getTimezoneOffset() * -1;
  const tzOffsetHours = Math.floor(Math.abs(tzOffset) / 60);
  const tzOffsetMinutes = Math.abs(tzOffset) % 60;
  
  // Format the date part: YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Format the time part: hh:mm:ss
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // Format the timezone offset part: +/-hh:mm
  const tzSign = tzOffset >= 0 ? '+' : '-';
  const tzHours = String(Math.abs(tzOffsetHours)).padStart(2, '0');
  const tzMinutes = String(tzOffsetMinutes).padStart(2, '0');
  
  // Combine all parts into ISO 8601 format with timezone offset
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`;
};