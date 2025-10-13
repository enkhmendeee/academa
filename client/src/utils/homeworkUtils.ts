// Get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "#43a047";
    case "IN_PROGRESS":
      return "#ffa726";
    case "OVERDUE":
      return "#e53935";
    case "PENDING":
      return "#1976d2";
    default:
      return "#1976d2";
  }
};

// Get status display text
export const getStatusDisplayText = (status: string) => {
  switch (status) {
    case "PENDING": return "Pending";
    case "IN_PROGRESS": return "In Progress";
    case "COMPLETED": return "Completed";
    case "OVERDUE": return "Overdue";
    default: return status;
  }
};

// Compare values for sorting
export const compareValues = (a: any, b: any, order: "ascend" | "descend") => {
  if (order === "ascend") {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  } else {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  }
};

// Get default date time for forms (in local timezone)
export const getDefaultDateTime = () => {
  const now = new Date();
  // Get local timezone offset in minutes
  const timezoneOffset = now.getTimezoneOffset();
  // Adjust the date by the timezone offset to get local time
  const localDate = new Date(now.getTime() - (timezoneOffset * 60000));
  
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Convert local datetime to UTC for API calls
export const toUTCString = (localDateTime: string) => {
  // Create a date object from the local datetime string
  const localDate = new Date(localDateTime);
  // Return ISO string which will be in UTC
  return localDate.toISOString();
};

// Convert UTC datetime from API to local datetime for display
export const fromUTCToLocal = (utcDateTime: string) => {
  const date = new Date(utcDateTime);
  // Format for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Vibrant color palette for courses
export const vibrantColors = [
  '#1976d2', // Blue
  '#e91e63', // Pink
  '#9c27b0', // Purple
  '#ff5722', // Orange
  '#4caf50', // Green
  '#ff9800', // Amber
  '#00bcd4', // Cyan
  '#f44336', // Red
  '#673ab7', // Deep Purple
  '#3f51b5', // Indigo
  '#009688', // Teal
  '#ff4081', // Pink
  '#795548', // Brown
  '#607d8b', // Blue Grey
  '#8bc34a', // Light Green
  '#ffc107'  // Yellow
];

// Utility function to filter data by semester
export const filterBySemester = (data: any[], selectedSemester: string, semesterField: string = 'semester', courseField: string = 'course') => {
  if (!selectedSemester) return data;
  
  return data.filter(item => {
    // Check if the item has a semester field
    if (item[semesterField] === selectedSemester) return true;
    // Check if the item's course has a semester field
    if (item[courseField]?.[semesterField] === selectedSemester) return true;
    // If neither has a semester, don't include it
    return false;
  });
};
