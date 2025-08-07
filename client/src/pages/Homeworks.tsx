import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, Table, Select, Input, message, Tag, Space, Form, Dropdown } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  LogoutOutlined,
  FilterOutlined,
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomeworks, createHomework, updateHomework } from "../services/homework";
import { getCourses, createCourse } from "../services/course";
import { getExams, createExam, updateExam } from "../services/exam";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;



export default function Homeworks() {
  const { token, user, login, logout, selectedSemester, setSelectedSemester } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");
  const [homeworkForm] = Form.useForm();
  const [addingHomework, setAddingHomework] = useState(false);
  const [courseForm] = Form.useForm();
  const [addingCourse, setAddingCourse] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseColor, setCourseColor] = useState('#1976d2');
  const [formType, setFormType] = useState<'homework' | 'exam'>('homework');
  const [editingHomework, setEditingHomework] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [addingNewSemester, setAddingNewSemester] = useState(false);
  const [newSemesterValue, setNewSemesterValue] = useState("");
  const [allSemesters, setAllSemesters] = useState<string[]>([]);
  const [profileVisible, setProfileVisible] = useState(false);
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("ascend");
  
  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);
  
  // Color picker dropdown state
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Hide completed assignments toggle state
  const [hideCompleted, setHideCompleted] = useState(true);
  
  // Handle hide completed toggle change
  const handleHideCompletedChange = (newValue: boolean) => {
    setHideCompleted(newValue);
    // If turning ON hide completed and status filter is set to COMPLETED, reset it
    if (newValue && statusFilter === "COMPLETED") {
      setStatusFilter("all");
    }
  };

  // Get current date with midnight time for default value
  const getDefaultDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00`;
  };

  // Add CSS animation for smooth slide-down effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);
  
  // Vibrant color palette for courses
  const vibrantColors = [
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

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [homeworksData, examsData, coursesData] = await Promise.all([
        getHomeworks(),
        getExams(),
        getCourses()
      ]);
      setHomeworks(homeworksData);
      setExams(examsData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Check for overdue assignments on component mount and every minute
  useEffect(() => {
    if (token) {
      // Check immediately when component mounts
      checkAndUpdateOverdue();
      
      // Set up interval to check every minute
      const interval = setInterval(() => {
        checkAndUpdateOverdue();
      }, 60000); // 60000ms = 1 minute
      
      return () => clearInterval(interval);
    }
  }, [token, homeworks, exams]);

  // Update motto
  const handleSaveMotto = async () => {
    if (!token) return;
    try {
      const updatedUser = await updateProfile({ motto: mottoValue });
      login(token, updatedUser);
      setEditingMotto(false);
      message.success("Motto updated successfully!");
    } catch (error) {
      console.error("Failed to update motto:", error);
      message.error("Failed to update motto");
    }
  };

  // Add homework
  const handleAddHomework = async (values: any) => {
    if (!token) return;
    setAddingHomework(true);
    try {
      await createHomework({ ...values, semester: selectedSemester });
      message.success("Homework added successfully!");
      homeworkForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Failed to add homework:", error);
      message.error("Failed to add homework");
    }
    setAddingHomework(false);
  };

  // Add course
  const handleAddCourse = async (values: { name: string; color?: string }) => {
    if (!token) return;
    setAddingCourse(true);
    try {
      await createCourse(values.name, selectedSemester, values.color);
      message.success("Course added successfully!");
      courseForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Failed to add course:", error);
      message.error("Failed to add course");
    }
    setAddingCourse(false);
  };

  // Add exam
  const handleAddExam = async (values: any) => {
    if (!token) return;
    setAddingHomework(true);
    try {
      await createExam({ ...values, semester: selectedSemester });
      message.success("Exam added successfully!");
      homeworkForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Failed to add exam:", error);
      message.error("Failed to add exam");
    }
    setAddingHomework(false);
  };

  // Handle adding new semester
  const handleAddNewSemester = () => {
    if (newSemesterValue.trim()) {
      const newSemester = newSemesterValue.trim();
      setSelectedSemester(newSemester);
      setAllSemesters(prev => [...prev, newSemester]);
      setAddingNewSemester(false);
      setNewSemesterValue("");
      message.success("New semester added!");
    }
  };

  // Check and update overdue assignments
  const checkAndUpdateOverdue = async () => {
    if (!token) return;
    
    const now = new Date();
    const overdueHomeworks = homeworks.filter(hw => {
      const dueDate = new Date(hw.dueDate);
      return hw.status !== 'COMPLETED' && hw.status !== 'OVERDUE' && dueDate < now;
    });

    const overdueExams = exams.filter(exam => {
      const examDate = new Date(exam.examDate);
      return exam.status !== 'COMPLETED' && exam.status !== 'OVERDUE' && examDate < now;
    });

    // Update overdue homeworks
    for (const hw of overdueHomeworks) {
      try {
        await updateHomework(hw.id, { status: 'OVERDUE' });
      } catch (error) {
        console.error(`Failed to update overdue homework ${hw.id}:`, error);
      }
    }

    // Update overdue exams
    for (const exam of overdueExams) {
      try {
        await updateExam(exam.id, { status: 'OVERDUE' });
      } catch (error) {
        console.error(`Failed to update overdue exam ${exam.id}:`, error);
      }
    }

    // Refresh data if any assignments were updated
    if (overdueHomeworks.length > 0 || overdueExams.length > 0) {
      fetchData();
    }
  };

  // Update homework field
  const handleUpdateHomeworkField = async (homeworkId: number, field: string, value: any) => {
    if (!token) return;
    try {
      await updateHomework(homeworkId, { [field]: value });
      
      // Show congratulatory message and animation for completed homework
      if (field === 'status' && value === 'COMPLETED') {
        message.success("🎉 Congratulations! Homework completed! 🎉");
        // Add a small delay to let the user see the celebration
        setTimeout(() => {
          fetchData();
        }, 500);
      } else {
        message.success("Homework updated successfully!");
        fetchData();
      }
      
      setEditingHomework(null);
      setEditingField(null);
    } catch (error) {
      console.error("Failed to update homework:", error);
      message.error("Failed to update homework");
    }
  };

  // Navigation handler
  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "home":
        navigate("/");
        break;
      case "courses":
        navigate("/courses");
        break;
      case "homeworks":
        navigate("/homeworks");
        break;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
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

  // Get unique semesters from homeworks
  const existingSemesters = Array.from(new Set(homeworks.map(hw => hw.semester || hw.course?.semester).filter(Boolean)));
  
  // Combine existing semesters with newly added ones
  const semesters = Array.from(new Set([...existingSemesters, ...allSemesters]));

  // Filter and sort homeworks
  const filteredAndSortedHomeworks = homeworks
    .filter(hw => {
      // Semester filter
      const semesterMatch = selectedSemester === "all" || (hw.semester || hw.course?.semester) === selectedSemester;
      
      // Status filter
      const statusMatch = statusFilter === "all" || hw.status === statusFilter;
      
      // Course filter
      const courseMatch = courseFilter === "all" || hw.courseId?.toString() === courseFilter;
      
      // Hide completed filter
      const completedMatch = !hideCompleted || hw.status !== "COMPLETED";
      
      return semesterMatch && statusMatch && courseMatch && completedMatch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title?.toLowerCase();
          bValue = b.title?.toLowerCase();
          break;
        case "course":
          aValue = a.course?.name?.toLowerCase();
          bValue = b.course?.name?.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "grade":
          aValue = a.grade || 0;
          bValue = b.grade || 0;
          break;
        case "dueDate":
        default:
          // Default to dueDate sorting
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
      }
      
      const compareValues = (a: any, b: any, order: "ascend" | "descend") => {
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
      
      return compareValues(aValue, bValue, sortOrder);
    });

  // Filter and sort exams
  const filteredAndSortedExams = exams
    .filter(exam => {
      // Semester filter
      const semesterMatch = selectedSemester === "all" || (exam.semester || exam.course?.semester) === selectedSemester;
      
      // Status filter
      const statusMatch = statusFilter === "all" || exam.status === statusFilter;
      
      // Course filter
      const courseMatch = courseFilter === "all" || exam.courseId?.toString() === courseFilter;
      
      // Hide completed filter
      const completedMatch = !hideCompleted || exam.status !== "COMPLETED";
      
      return semesterMatch && statusMatch && courseMatch && completedMatch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title?.toLowerCase();
          bValue = b.title?.toLowerCase();
          break;
        case "course":
          aValue = a.course?.name?.toLowerCase();
          bValue = b.course?.name?.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "grade":
          aValue = a.grade || 0;
          bValue = b.grade || 0;
          break;
        case "dueDate":
        default:
          // Default to dueDate sorting
          aValue = new Date(a.examDate);
          bValue = new Date(b.examDate);
      }
      
      const compareValues = (a: any, b: any, order: "ascend" | "descend") => {
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
      
      return compareValues(aValue, bValue, sortOrder);
    });

  // Filter courses by selected semester
  const currentSemesterCourses = courses.filter(course => course.semester === selectedSemester);

  // Table columns
  const columns = [
    {
      title: "Assignment",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'title';
        const isExam = record.type === 'exam' || record.examType;
        return isEditing ? (
          <Input
            defaultValue={text}
            onPressEnter={(e: any) => handleUpdateHomeworkField(record.id, 'title', e.target.value)}
            onBlur={() => setEditingHomework(null)}
            autoFocus
            style={{ borderRadius: 8 }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag 
              color={isExam ? 'purple' : 'blue'}
              style={{ fontSize: '10px' }}
            >
              {isExam ? 'Exam' : 'HW'}
            </Tag>
            <Text 
              strong 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEditingHomework(record.id);
                setEditingField('title');
              }}
            >
              {text}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Course",
      dataIndex: ["course", "name"],
      key: "course",
      render: (text: string, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'courseId';
        const course = courses.find(c => c.id === record.courseId);
        const courseColor = course?.color || '#1976d2';
        const bgColor = `${courseColor}15`; // 15% opacity
        
        return isEditing ? (
          <Select
            defaultValue={record.courseId}
            onSelect={(value) => handleUpdateHomeworkField(record.id, 'courseId', value)}
            onBlur={() => setEditingHomework(null)}
            style={{ width: 150, borderRadius: 8 }}
            autoFocus
          >
            {courses.map(c => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <div
            style={{ 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '16px',
              backgroundColor: bgColor,
              border: `2px solid ${courseColor}`,
              color: courseColor,
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            onClick={() => {
              setEditingHomework(record.id);
              setEditingField('courseId');
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: "Due Date/Time",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'dueDate';
        return isEditing ? (
          <Input
            type="datetime-local"
            defaultValue={date ? new Date(date).toISOString().slice(0, 16) : ''}
            onPressEnter={(e: any) => handleUpdateHomeworkField(record.id, 'dueDate', e.target.value)}
            onBlur={() => setEditingHomework(null)}
            autoFocus
            style={{ borderRadius: 8 }}
          />
        ) : (
          <Text 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setEditingHomework(record.id);
              setEditingField('dueDate');
            }}
          >
            {new Date(date).toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => {
        const getStatusDisplayText = (status: string) => {
          switch (status) {
            case "PENDING": return "Pending";
            case "IN_PROGRESS": return "In Progress";
            case "COMPLETED": return "Completed";
            case "OVERDUE": return "Overdue";
            default: return status;
          }
        };

        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: "PENDING",
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: getStatusColor("PENDING") 
                      }} />
                      Pending
                    </div>
                  ),
                  onClick: () => {
                    handleUpdateHomeworkField(record.id, 'status', 'PENDING');
                  }
                },
                {
                  key: "IN_PROGRESS",
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: getStatusColor("IN_PROGRESS") 
                      }} />
                      In Progress
                    </div>
                  ),
                  onClick: () => {
                    handleUpdateHomeworkField(record.id, 'status', 'IN_PROGRESS');
                  }
                },
                {
                  key: "COMPLETED",
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: getStatusColor("COMPLETED") 
                      }} />
                      Completed
                    </div>
                  ),
                  onClick: () => {
                    handleUpdateHomeworkField(record.id, 'status', 'COMPLETED');
                  }
                },
                {
                  key: "OVERDUE",
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: getStatusColor("OVERDUE") 
                      }} />
                      Overdue
                    </div>
                  ),
                  onClick: () => {
                    handleUpdateHomeworkField(record.id, 'status', 'OVERDUE');
                  }
                }
              ]
            }}
            trigger={["click"]}
          >
            <Tag 
              color={getStatusColor(status)}
              style={{ 
                cursor: 'pointer',
                animation: status === 'COMPLETED' ? 'celebrate 0.6s ease-in-out' : 'none',
                transform: status === 'COMPLETED' ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {getStatusDisplayText(status)}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button 
            size="small" 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            style={{ padding: 4 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes celebrate {
            0% { transform: scale(1); }
            25% { transform: scale(1.2) rotate(5deg); }
            50% { transform: scale(1.3) rotate(-5deg); }
            75% { transform: scale(1.2) rotate(5deg); }
            100% { transform: scale(1.1); }
          }
        `}
      </style>
      <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        width={200}
        style={{
          background: "#1976d2",
          borderRight: "2px solid #bbdefb",
          paddingTop: 24,
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 1000,
          overflowY: "auto"
        }}
      >
        <div style={{
          color: "#ffffff",
          fontWeight: 700,
          fontSize: 28,
          textAlign: "center",
          marginBottom: 32,
          letterSpacing: 1,
        }}>
          Academa
        </div>
                <Menu
          mode="inline"
          selectedKeys={["homeworks"]}
          style={{ 
            background: "transparent", 
            border: "none"
          }}
          onClick={handleMenuClick}
        >
          <Menu.Item 
            key="home" 
            icon={<HomeOutlined style={{ color: "#ffffff", fontSize: "18px" }} />}
            style={{ 
              fontSize: "16px", 
              fontWeight: "500", 
              color: "#ffffff",
              margin: "8px 8px",
              borderRadius: "8px",
              height: "48px",
              lineHeight: "48px",
              paddingLeft: "12px",
              paddingRight: "24px",
              width: "180px",
              marginRight: "8px"
            }}
          >
            Home
          </Menu.Item>
          <Menu.Item 
            key="courses" 
            icon={<BookOutlined style={{ color: "#ffffff", fontSize: "18px" }} />}
            style={{ 
              fontSize: "16px", 
              fontWeight: "500", 
              color: "#ffffff",
              margin: "8px 8px",
              borderRadius: "8px",
              height: "48px",
              lineHeight: "48px",
              paddingLeft: "12px",
              paddingRight: "24px",
              width: "180px",
              marginRight: "8px"
            }}
          >
            Courses
          </Menu.Item>
          <Menu.Item 
            key="homeworks" 
            icon={<FileTextOutlined style={{ color: "#1976d2", fontSize: "18px" }} />}
            style={{ 
              fontSize: "16px", 
              fontWeight: "500", 
              color: "#1976d2",
              margin: "8px 8px",
              borderRadius: "8px",
              height: "48px",
              lineHeight: "48px",
              background: "#ffffff",
              paddingLeft: "12px",
              paddingRight: "24px",
              width: "180px",
              marginRight: "8px"
            }}
          >
            Homeworks
          </Menu.Item>
        </Menu>
      </Sider>
      {/* Main Layout */}
      <Layout style={{ marginLeft: 200 }}>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 32px",
            borderBottom: "3px solid #bbdefb",
            height: 64,
          }}
        >
          <div style={{ flex: 1 }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", flex: 1 }}>
            {editingMotto ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Input
                  value={mottoValue}
                  onChange={(e) => setMottoValue(e.target.value)}
                  onPressEnter={handleSaveMotto}
                  style={{ 
                    fontSize: 18, 
                    fontWeight: 500, 
                    border: "none", 
                    background: "transparent",
                    textAlign: "center",
                    width: 300,
                    color: "#1976d2"
                  }}
                  autoFocus
                />
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={handleSaveMotto}
                  style={{ color: "#1976d2", padding: 4 }}
                  size="small"
                />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text 
                  style={{ fontSize: 18, fontWeight: 500, color: "#1976d2", cursor: "pointer" }}
                  onClick={() => setEditingMotto(true)}
                >
                  {user?.motto || "My Motto"}
                </Text>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setEditingMotto(true)}
                  style={{ color: "#1976d2", padding: 4 }}
                  size="small"
                />
              </div>
            )}
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              style={{ 
                color: "#ffffff", 
                fontWeight: 500, 
                fontSize: 16,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #1976d2",
                background: "#1976d2"
              }}
              onClick={() => setProfileVisible(true)}
            >
              {user?.username || "User"}
            </Button>
          </div>
        </Header>
        
        {/* Profile Popup */}
        {profileVisible && (
          <button 
            type="button"
            aria-label="Close profile popup"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              cursor: 'pointer',
              border: 'none',
              padding: 0
            }}
            onClick={() => setProfileVisible(false)}
          >
            <Card
              style={{
                width: 400,
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 32,
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <Title level={3} style={{ color: '#1976d2', margin: 0 }}>
                  {user?.username || 'User'}
                </Title>
                <Text type="secondary">{user?.email}</Text>
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1976d2', marginBottom: 12 }}>
                  Profile Information
                </Title>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>Username:</Text>
                  <Text>{user?.username || 'N/A'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>Email:</Text>
                  <Text>{user?.email || 'N/A'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Motto:</Text>
                  <Text>{user?.motto || 'No motto set'}</Text>
                </div>
              </div>
              

              
              <div style={{ textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button
                  type="primary"
                  onClick={() => setProfileVisible(false)}
                  style={{
                    borderRadius: 8,
                    background: '#1976d2',
                    borderColor: '#1976d2'
                  }}
                >
                  Close
                </Button>
                <Button
                  type="default"
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setProfileVisible(false);
                  }}
                  style={{
                    borderRadius: 8,
                    borderColor: '#ff4d4f',
                    color: '#ff4d4f'
                  }}
                >
                  Logout
                </Button>
              </div>
            </Card>
          </button>
        )}
        {/* Content */}
        <Content style={{ padding: 32, background: "linear-gradient(180deg, #ffffff 0%, #bbdefb 100%)", minHeight: 0 }}>
          <Row gutter={[32, 32]} justify="center">
            {/* My Homeworks Section with Semester Selector */}
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: "#1976d2", margin: 0 }}>My Homeworks</Title>
                <Select
                  placeholder="Select semester"
                  style={{ width: 200 }}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  options={[
                    { value: "all", label: "All Semesters" },
                    ...semesters.map(semester => ({ value: semester, label: semester }))
                  ]}

                  onOpenChange={(open) => {
                    if (!open) {
                      setAddingNewSemester(false);
                      setNewSemesterValue("");
                    }
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {!addingNewSemester && (
                    <div
                      onClick={() => setAddingNewSemester(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderRadius: '20px',
                        backgroundColor: '#e3f2fd',
                        border: '2px solid #1976d2',
                        color: '#1976d2',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#bbdefb';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#e3f2fd';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
                      }}
                    >
                      <PlusOutlined style={{ fontSize: '14px' }} />
                      Add New Semester
                    </div>
                  )}
                  {addingNewSemester && (
                    <div style={{ 
                      display: 'flex', 
                      gap: 8, 
                      alignItems: 'center',
                      marginTop: 8,
                      padding: '12px 16px',
                      backgroundColor: '#f8fbff',
                      borderRadius: '12px',
                      border: '1px solid #e3f2fd',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                      animation: 'slideDown 0.3s ease-out'
                    }}>
                      <Input
                        size="small"
                        placeholder="Enter semester name"
                        value={newSemesterValue}
                        onChange={(e) => setNewSemesterValue(e.target.value)}
                        onPressEnter={handleAddNewSemester}
                        autoFocus
                        style={{ width: 200, borderRadius: 8 }}
                      />
                      <Button
                        size="small"
                        type="primary"
                        onClick={handleAddNewSemester}
                        style={{ 
                          background: '#1976d2', 
                          borderColor: '#1976d2',
                          borderRadius: 8
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setAddingNewSemester(false);
                          setNewSemesterValue("");
                        }}
                        style={{ borderRadius: 8 }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Row>
            </Col>

            {/* Course Creation Section */}
            <Col span={24}>
              <Card
                title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Add a New Course</span>}
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", marginBottom: 24 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}>
                      <Input 
                        placeholder="Enter course name" 
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        onPressEnter={() => {
                          if (courseName?.trim()) {
                            handleAddCourse({ name: courseName.trim(), color: courseColor });
                            setCourseName('');
                            setCourseColor('#1976d2');
                          }
                        }}
                        style={{ 
                          borderRadius: 8, 
                          width: 250,
                          border: '1px solid #d9d9d9',
                          boxShadow: 'none',
                          outline: 'none'
                        }}
                        size="large"
                      />
                      
                      <div style={{ position: 'relative' }} className="color-picker-container">
                        <div
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                          }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: courseColor,
                            border: '3px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none',
                            outline: 'none'
                          }}
                          tabIndex={-1}
                        >
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            opacity: 0.8
                          }} />
                        </div>
                        
                        {showColorPicker && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 1000,
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            border: '1px solid #e3f2fd',
                            marginTop: '8px',
                            animation: 'slideDown 0.3s ease-out'
                          }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '8px',
                              width: '200px'
                            }}>
                              {vibrantColors.map((color, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    setCourseColor(color);
                                    setShowColorPicker(false);
                                  }}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    border: courseColor === color ? '3px solid #333' : '2px solid #fff',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                  }}
                                  title={`Select ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        loading={addingCourse}
                        onClick={() => {
                          if (courseName?.trim()) {
                            handleAddCourse({ name: courseName.trim(), color: courseColor });
                            setCourseName('');
                            setCourseColor('#1976d2');
                          }
                        }}
                        style={{ 
                          borderRadius: 8, 
                          background: '#1976d2', 
                          borderColor: '#1976d2',
                          height: 40,
                          flexShrink: 0
                        }}
                      >
                        Add Course
                      </Button>
                      
                      {/* Current Semester Courses */}
                      {currentSemesterCourses.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                            Current:
                          </Text>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {currentSemesterCourses.map((course, index) => {
                              const courseColor = course.color || '#1976d2';
                              const bgColor = `${courseColor}15`; // 15% opacity
                              return (
                                <Tag
                                  key={course.id}
                                  style={{ 
                                    borderRadius: 16, 
                                    padding: '6px 14px',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    border: `2px solid ${courseColor}`,
                                    background: bgColor,
                                    color: courseColor,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={() => {
                                    // Navigate to courses page with the selected course focused
                                    navigate('/courses', { 
                                      state: { 
                                        focusedCourseId: course.id,
                                        selectedSemester: selectedSemester 
                                      } 
                                    });
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                  }}
                                >
                                  {course.name}
                                </Tag>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Assignment Table */}
            <Col span={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: "#1976d2", fontWeight: 500, minWidth: '120px' }}>
                      Add a New Assignment
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button
                        size="small"
                        type={formType === 'homework' ? 'primary' : 'default'}
                        onClick={() => setFormType('homework')}
                        style={{ 
                          borderRadius: 6,
                          background: formType === 'homework' ? '#1976d2' : '#f0f0f0',
                          borderColor: formType === 'homework' ? '#1976d2' : '#d9d9d9',
                          color: formType === 'homework' ? 'white' : '#666'
                        }}
                      >
                        Homework
                      </Button>
                      <Button
                        size="small"
                        type={formType === 'exam' ? 'primary' : 'default'}
                        onClick={() => setFormType('exam')}
                        style={{ 
                          borderRadius: 6,
                          background: formType === 'exam' ? '#9c27b0' : '#f0f0f0',
                          borderColor: formType === 'exam' ? '#9c27b0' : '#d9d9d9',
                          color: formType === 'exam' ? 'white' : '#666'
                        }}
                      >
                        Exam
                      </Button>
                    </div>
                  </div>
                }
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
              >
                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                  {/* Assignment Adder Row - Always at top */}
                  <div style={{ 
                    padding: '16px', 
                    background: '#fafafa', 
                    borderBottom: '1px solid #f0f0f0',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <Form 
                      form={homeworkForm} 
                      layout="inline" 
                      onFinish={formType === 'homework' ? handleAddHomework : handleAddExam}
                      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                      <Form.Item 
                        name="title" 
                        rules={[{ required: true, message: 'Title required!' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input 
                          placeholder={formType === 'homework' ? 'Homework Title' : 'Exam Title'} 
                          style={{ borderRadius: 8 }} 
                        />
                      </Form.Item>
                      <Form.Item 
                        name="courseId" 
                        rules={[{ required: true, message: 'Course required!' }]}
                        style={{ marginBottom: 0, width: 150 }}
                      >
                        <Select placeholder="Select Course" style={{ borderRadius: 8 }}>
                          {currentSemesterCourses.map(c => (
                            <Select.Option key={c.id} value={c.id}>
                              {c.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item 
                        name={formType === 'homework' ? 'dueDate' : 'examDate'} 
                        rules={[{ required: true, message: formType === 'homework' ? 'Due date required!' : 'Exam date required!' }]}
                        style={{ marginBottom: 0, width: 150 }}
                        initialValue={getDefaultDateTime()}
                      >
                        <Input 
                          type="datetime-local" 
                          placeholder={formType === 'homework' ? 'Due Date' : 'Exam Date'}
                          style={{ borderRadius: 8 }} 
                        />
                      </Form.Item>
                      {formType === 'exam' && (
                        <Form.Item 
                          name="examType" 
                          style={{ marginBottom: 0, width: 120 }}
                        >
                          <Select placeholder="Type" style={{ borderRadius: 8 }}>
                            <Select.Option value="Midterm">Midterm</Select.Option>
                            <Select.Option value="Final">Final</Select.Option>
                            <Select.Option value="Quiz">Quiz</Select.Option>
                            <Select.Option value="Assignment">Assignment</Select.Option>
                          </Select>
                        </Form.Item>
                      )}
                      <Form.Item 
                        name="status" 
                        initialValue="PENDING"
                        style={{ marginBottom: 0, width: 120 }}
                      >
                        <Select style={{ borderRadius: 8 }}>
                          <Select.Option value="PENDING">Pending</Select.Option>
                          <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
                          <Select.Option value="COMPLETED">Completed</Select.Option>
                          <Select.Option value="OVERDUE">Overdue</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          icon={<PlusOutlined />}
                          loading={addingHomework}
                          style={{ 
                            borderRadius: 8, 
                            background: formType === 'homework' ? '#1976d2' : '#9c27b0', 
                            borderColor: formType === 'homework' ? '#1976d2' : '#9c27b0'
                          }}
                        >
                          Add {formType === 'homework' ? 'Homework' : 'Exam'}
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                  
                  {/* Filter Toggle Button */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 8,
                    padding: '8px'
                  }}>
                    <Button
                      type="text"
                      icon={<FilterOutlined />}
                      onClick={() => setShowFilters(!showFilters)}
                      style={{ 
                        color: '#1976d2',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                      {showFilters ? <UpOutlined /> : <DownOutlined />}
                    </Button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>Completed assignments:</Text>
                      <Button
                        type={hideCompleted ? 'primary' : 'default'}
                        size="small"
                        onClick={() => handleHideCompletedChange(!hideCompleted)}
                        style={{ 
                          fontSize: 11,
                          height: 24,
                          padding: '0 8px',
                          borderRadius: 12,
                          background: hideCompleted ? '#1976d2' : '#f0f0f0',
                          borderColor: hideCompleted ? '#1976d2' : '#d9d9d9',
                          color: hideCompleted ? 'white' : '#666'
                        }}
                      >
                        {hideCompleted ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </div>

                  {/* Filter and Sort Controls */}
                  {showFilters && (
                    <div style={{ 
                      display: 'flex', 
                      gap: 16, 
                      alignItems: 'center', 
                      marginBottom: 16,
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: 8,
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>Filter by:</Text>
                        <Select
                          placeholder="Status"
                          style={{ width: 120 }}
                          value={statusFilter}
                          onChange={setStatusFilter}
                        >
                          <Option value="all">All Status</Option>
                          <Option value="PENDING">Pending</Option>
                          <Option value="IN_PROGRESS">In Progress</Option>
                          <Option value="COMPLETED" disabled={hideCompleted}>Completed</Option>
                          <Option value="OVERDUE">Overdue</Option>
                        </Select>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>Course:</Text>
                        <Select
                          placeholder="Course"
                          style={{ width: 150 }}
                          value={courseFilter}
                          onChange={setCourseFilter}
                        >
                          <Option value="all">All Courses</Option>
                          {currentSemesterCourses.map(course => (
                            <Option key={course.id} value={course.id.toString()}>
                              {course.name}
                            </Option>
                          ))}
                        </Select>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>Sort by:</Text>
                        <Select
                          style={{ width: 120 }}
                          value={sortBy}
                          onChange={setSortBy}
                        >
                          <Option value="dueDate">Due Date</Option>
                          <Option value="title">Title</Option>
                          <Option value="course">Course</Option>
                          <Option value="status">Status</Option>
                          <Option value="grade">Grade</Option>
                        </Select>
                      </div>
                      
                      <Button
                        type="text"
                        icon={sortOrder === "ascend" ? "↑" : "↓"}
                        onClick={() => setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")}
                        style={{ 
                          color: '#1976d2',
                          fontWeight: 'bold',
                          fontSize: 16
                        }}
                      >
                        {sortOrder === "ascend" ? "Ascending" : "Descending"}
                      </Button>
                      
                      <Button
                        type="text"
                        onClick={() => {
                          setStatusFilter("all");
                          setCourseFilter("all");
                          setSortBy("dueDate");
                          setSortOrder("ascend");
                        }}
                        style={{ color: '#666' }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                  
                  {/* Combined Assignments Table */}
                  <Table
                    columns={columns}
                    dataSource={[...filteredAndSortedHomeworks, ...filteredAndSortedExams.map(exam => ({
                      ...exam,
                      dueDate: exam.examDate, // Map exam date to due date for consistency
                      type: 'exam'
                    }))]}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    style={{ marginTop: 0 }}
                  />
                </div>
              </Card>
            </Col>


          </Row>
        </Content>
      </Layout>
    </Layout>
    </>
  );
} 