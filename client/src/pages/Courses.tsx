import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, List, Select, Input, message, Popconfirm, Dropdown, Modal } from "antd";
import ReactApexChart from 'react-apexcharts';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  LogoutOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../context/DataContext";
import { updateCourse, deleteCourse } from "../services/course";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Courses() {
  const { token, user, login, logout, selectedSemester, setSelectedSemester, allSemesters, addSemester, removeSemester, updateSemester, setLatestSemester } = useAuth();
  const { courses, homeworks, exams, loading, updateLocalCourse, removeLocalCourse } = useData();
  
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
  const navigate = useNavigate();
  const location = useLocation();
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [courseEditValues, setCourseEditValues] = useState<{ [key: number]: { name: string; description: string } }>({});
  const [profileVisible, setProfileVisible] = useState(false);
  
  // Semester management states
  const [editingSemester, setEditingSemester] = useState<string | null>(null);
  const [editingSemesterValue, setEditingSemesterValue] = useState("");
  const [newSemesterValue, setNewSemesterValue] = useState("");

  // Handle navigation state from Homeworks page
  useEffect(() => {
    if (location.state) {
      const navState = location.state as { selectedSemester?: string };
      if (navState.selectedSemester && navState.selectedSemester !== selectedSemester) {
        setSelectedSemester(navState.selectedSemester);
      }
    }
  }, [location.state, selectedSemester, setSelectedSemester]);

  // Auto-set latest semester when data is loaded
  useEffect(() => {
    if (!loading && (homeworks.length > 0 || exams.length > 0 || courses.length > 0)) {
      // Get unique semesters from data
      const existingSemesters = Array.from(new Set([
        ...homeworks.map(hw => hw.semester || hw.course?.semester).filter(Boolean),
        ...exams.map(exam => exam.semester || exam.course?.semester).filter(Boolean),
        ...courses.map(course => course.semester).filter(Boolean)
      ]));
      
      // Combine with user-defined semesters
      const allAvailableSemesters = Array.from(new Set([...existingSemesters, ...allSemesters]));
      
      // Set to latest semester if needed
      setLatestSemester(allAvailableSemesters);
    }
  }, [loading, homeworks, exams, courses, allSemesters, setLatestSemester]);



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

  // Handle course editing
  const handleEditCourse = (courseId: number, field: string) => {
    setEditingCourse(courseId);
    setEditingField(field);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setCourseEditValues(prev => ({
        ...prev,
        [courseId]: {
          name: course.name || '',
          description: course.description || ''
        }
      }));
    }
  };

  // Handle course update
  const handleUpdateCourse = async (courseId: number, field: string, value: string) => {
    if (!token) return;
    try {
      await updateCourse(courseId, { [field]: value });
      message.success("Course updated successfully!");
      updateLocalCourse(courseId, { [field]: value });
      setEditingCourse(null);
      setEditingField(null);
    } catch (error) {
      console.error("Failed to update course:", error);
      message.error("Failed to update course");
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId: number) => {
    if (!token) return;
    try {
      await deleteCourse(courseId);
      message.success("Course deleted successfully!");
      removeLocalCourse(courseId);
    } catch (error) {
      console.error("Failed to delete course:", error);
      message.error("Failed to delete course");
    }
  };

  // Handle course color update
  const handleUpdateCourseColor = async (courseId: number, color: string) => {
    if (!token) return;
    try {
      await updateCourse(courseId, { color });
      message.success("Course color updated successfully!");
      
      // Update the course color locally without refetching all data
      updateLocalCourse(courseId, { color });
    } catch (error: any) {
      console.error("Failed to update course color:", error);
      message.error("Failed to update course color");
    }
  };

  // Semester management functions
  const handleAddNewSemester = async () => {
    if (newSemesterValue.trim()) {
      const newSemester = newSemesterValue.trim();
      try {
        await addSemester(newSemester);
        setSelectedSemester(newSemester);
        setNewSemesterValue("");
        message.success("New semester added!");
      } catch (error) {
        console.error('Failed to add semester:', error);
        message.error("Failed to add semester");
      }
    }
  };

  const handleEditSemester = (semester: string) => {
    setEditingSemester(semester);
    setEditingSemesterValue(semester);
  };

  const handleSaveSemesterEdit = async () => {
    if (editingSemesterValue.trim() && editingSemester) {
      try {
        await updateSemester(editingSemester, editingSemesterValue.trim());
        setEditingSemester(null);
        setEditingSemesterValue("");
        message.success("Semester updated successfully!");
      } catch (error) {
        console.error('Failed to update semester:', error);
        message.error("Failed to update semester");
      }
    }
  };

  const handleCancelSemesterEdit = () => {
    setEditingSemester(null);
    setEditingSemesterValue("");
  };

  const handleDeleteSemester = async (semester: string) => {
    if (allSemesters.length <= 1) {
      message.error("Cannot delete the last semester!");
      return;
    }
    
    // Check if semester has data
    const hasHomeworks = homeworks.some(hw => (hw.semester || hw.course?.semester) === semester);
    const hasExams = exams.some(exam => (exam.semester || exam.course?.semester) === semester);
    const hasCourses = courses.some(course => course.semester === semester);
    
    if (hasHomeworks || hasExams || hasCourses) {
      message.error("Cannot delete semester with existing data!");
      return;
    }
    
    // Show confirmation popup
    Modal.confirm({
      title: 'Delete Semester',
      content: (
        <div>
          <p>Are you sure you want to delete <strong>{semester}</strong>?</p>
          <p style={{ color: '#ff4d4f', marginTop: 8 }}>
            ⚠️ Warning: This action cannot be undone. All courses, homeworks, and exams associated with this semester will be permanently deleted.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await removeSemester(semester);
          message.success("Semester deleted successfully!");
        } catch (error) {
          console.error('Failed to delete semester:', error);
          message.error("Failed to delete semester");
        }
      },
    });
  };

  const handleSetDefaultSemester = (semester: string) => {
    setSelectedSemester(semester);
    message.success(`${semester} set as default semester!`);
  };

  // Handle semester selection from dropdown
  const handleSemesterChange = async (semester: string) => {
    setSelectedSemester(semester);
    // If the selected semester is not in allSemesters, add it
    if (!allSemesters.includes(semester)) {
      try {
        await addSemester(semester);
      } catch (error) {
        console.error('Failed to add semester:', error);
        // Revert the selection if adding failed
        setSelectedSemester(selectedSemester);
      }
    }
  };

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

  // Get unique semesters from courses, homeworks, and exams
  const existingSemesters = Array.from(new Set([
    ...courses.map(course => course.semester).filter(Boolean),
    ...homeworks.map(hw => hw.semester || hw.course?.semester).filter(Boolean),
    ...exams.map(exam => exam.semester || exam.course?.semester).filter(Boolean)
  ]));
  
  // Combine existing semesters with user-defined ones
  const semesters = Array.from(new Set([...existingSemesters, ...allSemesters]));

  // Filter courses by selected semester
    const filteredCourses = courses.filter(course => course.semester === selectedSemester);

  // Get homeworks for a specific course
  const getHomeworksForCourse = (courseId: number) => {
    return homeworks.filter(hw => hw.courseId === courseId);
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh",
          fontSize: 18,
          color: "#1976d2"
        }}>
          Loading...
        </div>
      </Layout>
    );
  }

  return (
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
          userSelect: 'none',
          cursor: 'default'
        }}>
          Academa
        </div>
                <Menu
          mode="inline"
          selectedKeys={["courses"]}
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
            icon={<BookOutlined style={{ color: "#1976d2", fontSize: "18px" }} />}
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
            Courses
          </Menu.Item>
          <Menu.Item 
            key="homeworks" 
            icon={<FileTextOutlined style={{ color: "#ffffff", fontSize: "18px" }} />}
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
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setProfileVisible(false);
              }
            }}
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

              {/* Semester Management Section */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1976d2', marginBottom: 12 }}>
                  Semester Management
                </Title>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Current: <Text strong style={{ color: '#1976d2' }}>{selectedSemester || 'None'}</Text>
                  </Text>
                </div>
                
                {allSemesters.length > 0 ? (
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {allSemesters.map((semester, index) => (
                      <div
                        key={semester}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          marginBottom: 8,
                          borderRadius: 8,
                          backgroundColor: semester === selectedSemester ? '#e3f2fd' : '#f8f9fa',
                          border: semester === selectedSemester ? '2px solid #1976d2' : '1px solid #e9ecef'
                        }}
                      >
                        {editingSemester === semester ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <Input
                              value={editingSemesterValue}
                              onChange={(e) => setEditingSemesterValue(e.target.value)}
                              onPressEnter={handleSaveSemesterEdit}
                              style={{ flex: 1, borderRadius: 6 }}
                              size="small"
                              autoFocus
                            />
                            <Button
                              type="primary"
                              size="small"
                              onClick={handleSaveSemesterEdit}
                              style={{ borderRadius: 6, background: '#1976d2', borderColor: '#1976d2' }}
                            >
                              Save
                            </Button>
                            <Button
                              size="small"
                              onClick={handleCancelSemesterEdit}
                              style={{ borderRadius: 6 }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div style={{ flex: 1 }}>
                              <Text style={{ fontWeight: semester === selectedSemester ? 600 : 400 }}>
                                {semester}
                              </Text>
                              {semester === selectedSemester && (
                                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                                  (Default)
                                </Text>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {semester !== selectedSemester && (
                                <Button
                                  type="text"
                                  size="small"
                                  onClick={() => handleSetDefaultSemester(semester)}
                                  style={{ padding: 4, color: '#1976d2' }}
                                  title="Set as default"
                                >
                                  <CheckOutlined />
                                </Button>
                              )}
                              <Button
                                type="text"
                                size="small"
                                onClick={() => handleEditSemester(semester)}
                                style={{ padding: 4, color: '#1976d2' }}
                                title="Edit semester"
                              >
                                <EditOutlined />
                              </Button>
                              <Button
                                type="text"
                                size="small"
                                danger
                                onClick={() => handleDeleteSemester(semester)}
                                style={{ padding: 4 }}
                                title="Delete semester"
                              >
                                <DeleteOutlined />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    No semesters created yet.
                  </Text>
                )}
                
                {/* Add new semester in profile */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input
                      placeholder="Add new semester"
                      value={newSemesterValue}
                      onChange={(e) => setNewSemesterValue(e.target.value)}
                      onPressEnter={handleAddNewSemester}
                      style={{ flex: 1, borderRadius: 6 }}
                      size="small"
                    />
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleAddNewSemester}
                      disabled={!newSemesterValue.trim()}
                      style={{ borderRadius: 6, background: '#1976d2', borderColor: '#1976d2' }}
                    >
                      Add
                    </Button>
                  </div>
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
            {/* My Courses Section with Semester Selector */}
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: "#1976d2", margin: 0 }}>My Courses</Title>
                <Select
                  placeholder="Select semester"
                  style={{ width: 200 }}
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  options={semesters.map(semester => ({ value: semester, label: semester }))}
                />

              </Row>
            </Col>

                        {/* Course Distribution Pie Chart and Calendar */}
            <Col span={24}>
              <Row gutter={[24, 24]}>
                {/* Course Distribution Pie Chart */}
                <Col xs={24} lg={12}>
              <Card
                title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Homework Distribution by Course</span>}
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", marginBottom: 24 }}
              >
                {(() => {
                  // Filter courses and homeworks by selected semester
                  const currentSemesterCourses = courses.filter(course => course.semester === selectedSemester);
                  const currentSemesterHomeworks = homeworks.filter(hw => (hw.semester || hw.course?.semester) === selectedSemester);

                  // Calculate course-wise homework distribution for current semester
                  const courseDistribution = currentSemesterCourses.map(course => {
                    const courseHomeworks = currentSemesterHomeworks.filter(hw => hw.courseId === course.id);
                    return {
                      name: course.name,
                      value: courseHomeworks.length,
                      color: course.color || '#1976d2' // Use course's actual color
                    };
                  }).filter(course => course.value > 0);

                  const pieChartOptions = {
                    chart: {
                      type: 'pie' as const,
                      toolbar: {
                        show: false
                      }
                    },
                    labels: courseDistribution.map((course, index) => course.name),
                    colors: courseDistribution.map((course, index) => course.color),
                    legend: {
                      show: false
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: function(val: any, opts: any) {
                        return opts.w.globals.seriesTotals[opts.seriesIndex] > 0 ? courseDistribution[opts.seriesIndex].name : '';
                      },
                      style: {
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#fff'
                      },
                      offsetY: -5,
                      dropShadow: {
                        enabled: false
                      },
                      textAnchor: 'middle' as const
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: '60%'
                        }
                      }
                    }
                  };

                  return courseDistribution.length > 0 ? (
                    <div style={{ textAlign: 'center', minHeight: 350 }}>
                      <ReactApexChart
                        options={pieChartOptions}
                        series={courseDistribution.map(course => course.value)}
                        type="pie"
                        height={300}
                      />
                      <div style={{ marginTop: 16 }}>
                        <Text type="secondary">
                          {selectedSemester}: {currentSemesterHomeworks.length} homeworks | 
                          {courseDistribution.length} courses
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      height: 350, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      color: '#999'
                    }}>
                      <Text type="secondary">No homeworks found. Add some homeworks to see the distribution.</Text>
                    </div>
                  );
                })()}
              </Card>
                </Col>

                {/* Homework Distribution by Course */}
                <Col xs={24} lg={12}>
                  <Card
                    title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Homework Distribution by Course</span>}
                    style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
                  >
                    {(() => {
                      // Filter courses and homeworks by selected semester
                                      const currentSemesterCourses = courses.filter(course => course.semester === selectedSemester);
                const currentSemesterHomeworks = homeworks.filter(hw => (hw.semester || hw.course?.semester) === selectedSemester);

                      // Course-wise homework distribution for current semester
                      const courseData = currentSemesterCourses.map(course => {
                        const courseHomeworks = currentSemesterHomeworks.filter(hw => hw.courseId === course.id);
                        return {
                          name: course.name,
                          total: courseHomeworks.length,
                          completed: courseHomeworks.filter(hw => hw.status === 'COMPLETED').length,
                          pending: courseHomeworks.filter(hw => hw.status === 'PENDING').length,
                          inProgress: courseHomeworks.filter(hw => hw.status === 'IN_PROGRESS').length,
                          overdue: courseHomeworks.filter(hw => hw.status === 'OVERDUE').length
                        };
                      }).filter(course => course.total > 0);

                      // Bar Chart Options for Course Distribution
                      const barChartOptions = {
                        chart: {
                          type: 'bar' as const,
                          toolbar: {
                            show: false
                          }
                        },
                        plotOptions: {
                          bar: {
                            horizontal: false,
                            columnWidth: '55%',
                            endingShape: 'rounded'
                          },
                        },
                        dataLabels: {
                          enabled: false
                        },
                        stroke: {
                          show: true,
                          width: 2,
                          colors: ['transparent']
                        },
                        xaxis: {
                          categories: courseData.map(course => course.name),
                          labels: {
                            style: {
                              fontSize: '12px'
                            }
                          }
                        },
                        yaxis: {
                          title: {
                            text: 'Number of Homeworks'
                          },
                        },
                        fill: {
                          opacity: 1
                        },
                        tooltip: {
                          y: {
                            formatter: function (val: any) {
                              return val + " homeworks"
                            }
                          }
                        },
                        colors: ['#43a047', '#ffa726', '#1976d2', '#e53935'],
                        legend: {
                          position: 'bottom' as const,
                          fontSize: '12px'
                        }
                      };

                      return courseData.length > 0 ? (
                        <div style={{ textAlign: 'center', minHeight: 350 }}>
                          <ReactApexChart
                            options={barChartOptions}
                            series={[
                              {
                                name: 'Completed',
                                data: courseData.map(course => course.completed)
                              },
                              {
                                name: 'In Progress',
                                data: courseData.map(course => course.inProgress)
                              },
                              {
                                name: 'Pending',
                                data: courseData.map(course => course.pending)
                              },
                              {
                                name: 'Overdue',
                                data: courseData.map(course => course.overdue)
                              }
                            ]}
                            type="bar"
                            height={300}
                          />
                          <div style={{ marginTop: 16 }}>
                                                    <Text type="secondary">
                          {selectedSemester}: {courseData.length} courses | 
                              {courseData.reduce((sum, course) => sum + course.total, 0)} homeworks
                            </Text>
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          height: 350, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          color: '#999'
                        }}>
                          <Text type="secondary">No homeworks found. Add some homeworks to see the distribution.</Text>
                        </div>
                      );
                    })()}
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Course Cards */}
            <Col span={24}>
              <Row gutter={[24, 24]} justify="center" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <Col key={course.id} xs={24} sm={12} md={8} lg={6} style={{ order: index }}>
                      <Card
                        key={`card-${course.id}`}
                                                title={
                          <div style={{ 
                            color: "#1976d2", 
                            fontWeight: 600, 
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%"
                          }}>
                            {/* Color Picker Button */}
                            <Dropdown
                              menu={{
                                items: vibrantColors.map((color, index) => ({
                                  key: color,
                                  label: (
                                    <div style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 8,
                                      padding: '4px 0'
                                    }}>
                                      <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        border: (course.color || '#1976d2') === color ? '2px solid #333' : '1px solid #d9d9d9',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }} />
                                      <span style={{ fontSize: '12px' }}>
                                        {color.toUpperCase()}
                                      </span>
                                    </div>
                                  ),
                                  onClick: () => handleUpdateCourseColor(course.id, color)
                                }))
                              }}
                              trigger={['click']}
                              placement="bottomLeft"
                            >
                              <Button
                                type="text"
                                icon={<BgColorsOutlined />}
                                style={{ 
                                  color: course.color || "#1976d2", 
                                  padding: 4,
                                  borderRadius: '50%',
                                  width: 32,
                                  height: 32,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `2px solid ${course.color || "#1976d2"}`,
                                  backgroundColor: `${(course.color || "#1976d2")}15`,
                                  transition: 'all 0.2s ease',
                                  flexShrink: 0
                                }}
                                size="small"
                              />
                            </Dropdown>
                            
                            {/* Course Name - Centered */}
                            <div style={{ 
                              flex: 1, 
                              textAlign: "center",
                              margin: "0 8px"
                            }}>
                              {editingCourse === course.id && editingField === 'name' ? (
                                <Input
                                  value={courseEditValues[course.id]?.name || course.name}
                                  onChange={(e) => setCourseEditValues(prev => ({
                                    ...prev,
                                    [course.id]: { ...prev[course.id], name: e.target.value }
                                  }))}
                                  onPressEnter={(e: any) => handleUpdateCourse(course.id, 'name', e.target.value)}
                                  onBlur={() => setEditingCourse(null)}
                                  autoFocus
                                  style={{ textAlign: "center" }}
                                />
                              ) : (
                                <Button
                                  type="text"
                                  style={{ 
                                    textAlign: "center", 
                                    padding: 0, 
                                    height: "auto", 
                                    color: "#1976d2", 
                                    fontWeight: 600, 
                                    fontSize: 16,
                                    width: "100%"
                                  }}
                                  onClick={() => handleEditCourse(course.id, 'name')}
                                >
                                  {course.name}
                                </Button>
                              )}
                            </div>
                            
                            {/* Delete Button */}
                            <Popconfirm
                              title="Delete this course?"
                              onConfirm={() => handleDeleteCourse(course.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                style={{ 
                                  color: "#ff4d4f", 
                                  padding: 4,
                                  borderRadius: '50%',
                                  width: 32,
                                  height: 32,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                                size="small"
                              />
                            </Popconfirm>
                          </div>
                        }
                        style={{ 
                          borderRadius: 12, 
                          border: `4px solid ${course.color || "#1976d2"}`, 
                          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                          height: Math.max(400, 300 + (getHomeworksForCourse(course.id).length * 30)),
                          display: "flex",
                          flexDirection: "column",
                          transition: "border-color 0.3s ease, height 0.3s ease",
                          overflow: "visible"
                        }}
                        styles={{
                          body: {
                            flex: 1,
                            padding: "12px 16px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "visible"
                          }
                        }}
                      >
                        {/* Course Description */}
                        <div style={{ marginBottom: 12 }}>
                          {editingCourse === course.id && editingField === 'description' ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Input.TextArea
                                value={courseEditValues[course.id]?.description || course.description || ''}
                                onChange={(e) => setCourseEditValues(prev => ({
                                  ...prev,
                                  [course.id]: { ...prev[course.id], description: e.target.value }
                                }))}
                                onPressEnter={(e: any) => handleUpdateCourse(course.id, 'description', e.target.value)}
                                onBlur={() => setEditingCourse(null)}
                                autoFocus
                                placeholder="Add course description..."
                                style={{ flex: 1 }}
                                rows={2}
                              />

                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Button
                                type="text"
                                style={{ 
                                  flex: 1, 
                                  textAlign: "left", 
                                  padding: 0, 
                                  height: "auto",
                                  color: course.description ? "#666" : "#999",
                                  fontStyle: course.description ? "normal" : "italic",
                                  fontWeight: "normal"
                                }}
                                onClick={() => handleEditCourse(course.id, 'description')}
                              >
                                {course.description || "Click to add description..."}
                              </Button>

                            </div>
                          )}
                        </div>
                        {/* Progress Bar */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: 8
                          }}>
                            <Text strong style={{ fontSize: 12, color: '#666' }}>Progress</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {getHomeworksForCourse(course.id).filter(hw => hw.status === 'COMPLETED').length} / {getHomeworksForCourse(course.id).length} completed
                            </Text>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: 8, 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: 4,
                            overflow: 'hidden',
                            display: 'flex'
                          }}>
                            {(() => {
                              const courseHomeworks = getHomeworksForCourse(course.id);
                              const total = courseHomeworks.length;
                              if (total === 0) return null;
                              
                              const completed = courseHomeworks.filter(hw => hw.status === 'COMPLETED').length;
                              const inProgress = courseHomeworks.filter(hw => hw.status === 'IN_PROGRESS').length;
                              const pending = courseHomeworks.filter(hw => hw.status === 'PENDING').length;
                              const overdue = courseHomeworks.filter(hw => hw.status === 'OVERDUE').length;
                              
                              return (
                                <>
                                  {completed > 0 && (
                                    <div style={{
                                      width: `${(completed / total) * 100}%`,
                                      height: '100%',
                                      backgroundColor: '#43a047',
                                      transition: 'width 0.3s ease'
                                    }} />
                                  )}
                                  {inProgress > 0 && (
                                    <div style={{
                                      width: `${(inProgress / total) * 100}%`,
                                      height: '100%',
                                      backgroundColor: '#ffa726',
                                      transition: 'width 0.3s ease'
                                    }} />
                                  )}
                                  {pending > 0 && (
                                    <div style={{
                                      width: `${(pending / total) * 100}%`,
                                      height: '100%',
                                      backgroundColor: '#1976d2',
                                      transition: 'width 0.3s ease'
                                    }} />
                                  )}
                                  {overdue > 0 && (
                                    <div style={{
                                      width: `${(overdue / total) * 100}%`,
                                      height: '100%',
                                      backgroundColor: '#e53935',
                                      transition: 'width 0.3s ease'
                                    }} />
                                  )}
                                </>
                              );
                            })()}
                          </div>

                        </div>
                        
                        <div style={{ 
                          flex: 1, 
                          overflowY: "auto",
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          padding: 8,
                          background: "#fafafa",
                          minHeight: Math.max(150, getHomeworksForCourse(course.id).length * 30)
                        }}>
                          <List
                            size="small"
                            dataSource={getHomeworksForCourse(course.id)}
                            renderItem={(homework) => (
                              <List.Item
                                key={homework.id}
                                style={{ 
                                  padding: "4px 8px",
                                  border: "none",
                                  background: "transparent"
                                }}
                              >
                                <div style={{ width: "100%" }}>
                                  <Text strong style={{ fontSize: 12 }}>{homework.title}</Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: 10 }}>
                                    Due: {new Date(homework.dueDate).toLocaleString()}
                                  </Text>
                                </div>
                              </List.Item>
                            )}
                            locale={{ emptyText: "No assignments" }}
                          />
                        </div>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <Card
                      style={{ 
                        borderRadius: 12, 
                        border: "2px dashed #d9d9d9", 
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        background: "#fafafa",
                        textAlign: "center",
                        padding: "40px"
                      }}
                    >
                      <BookOutlined style={{ fontSize: 48, color: "#1976d2", marginBottom: 16 }} />
                      <Title level={4} style={{ color: "#1976d2", marginBottom: 8 }}>No Courses Yet</Title>
                      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                        Create your first course to get started with homework management
                      </Text>
                      <Button 
                        type="primary" 
                        onClick={() => navigate("/homeworks")}
                        style={{ 
                          borderRadius: 8, 
                          background: '#1976d2', 
                          borderColor: '#1976d2'
                        }}
                      >
                        Go to Homeworks Page
                      </Button>
                    </Card>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
} 