export function formatTimeString(timeString: string): string {
  if (!timeString) return 'N/A';
  
  // Parse HH:MM:SS format
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Convert to 12-hour format with AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatDateString(dateString: string): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTimeString(dateTimeString: string): string {
  if (!dateTimeString) return 'N/A';
  
  const date = new Date(dateTimeString);
  return `${date.toLocaleDateString()} ${formatTimeString(date.toTimeString().substring(0, 8))}`;
}