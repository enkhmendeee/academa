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

// Get default date time for forms
export const getDefaultDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00`;
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
