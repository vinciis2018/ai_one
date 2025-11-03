
// Format date for display
export const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a time string into 12-hour AM/PM format with seconds
 * @param timeString - Time string in various formats (e.g., '13:45', '1:45 PM', '13:45:30')
 * @returns Formatted time string in 'h:mm:ss AM/PM' format or original string if parsing fails
 */
export const formatTime = (timeString?: string): string => {
  if (!timeString) return 'Not specified';
  
  try {
    // Handle already formatted times with seconds
    if (timeString.match(/\d{1,2}:\d{2}:\d{2}\s*(AM|PM)/i)) {
      return timeString;
    }
    // Handle already formatted times without seconds
    if (timeString.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
      return timeString.replace(/(\d{1,2}:\d{2})(\s*[AP]M)/i, '$1:00$2');
    }
    
    // Extract hours, minutes, and optional seconds
    const timeParts = timeString.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!timeParts) return timeString; // Return original if format not recognized
    
    // Using array indexing to avoid unused variable warning
    const hours = timeParts[1];
    const minutes = timeParts[2];
    const seconds = timeParts[3] || '00'; // Default to '00' if seconds not provided
    const hourNum = parseInt(hours, 10);
    const minuteNum = parseInt(minutes, 10);
    const secondNum = parseInt(seconds, 10);
    
    if (isNaN(hourNum) || isNaN(minuteNum) || isNaN(secondNum)) return timeString;
    
    // Convert to 12-hour format
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHour}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')} ${period}`;
  } catch (error) {
    console.warn('Error formatting time:', error);
    return timeString; // Return original string on error
  }
};


export function getHumanReadableDuration(sec: number) {
  if (typeof sec !== 'number') {
      throw new Error('Input must be a non-negative integer');
  }
  const seconds = Number(sec.toFixed(0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (hours > 0) {
      parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
      parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds} sec${remainingSeconds !== 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}


export const timeToSeconds = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  let hours = Number(time.split(':')[0]);
  const minutes = Number(time.split(':')[1]);
  const seconds = Number(time.split(':')[2]);

  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
      hours += 12;
  } else if (period === 'AM' && hours === 12) {
      hours = 0;
  }
  
  return hours * 3600 + minutes * 60 + seconds;
};



export function timeDiffSeconds(time1: string, time2: string): number {
  const dateTime1 = new Date(time1);
  const dateTime2 = new Date(time2);
  console.log(dateTime1, dateTime2);
  
  // return Math.round(Math.abs(logTs.getTime() - imageTs.getTime()) / 1000);
  return 0
}
  

export function getDaysBetween(date1: Date, date2: Date): number {
  // Normalize both dates to midnight (ignore time part)
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
