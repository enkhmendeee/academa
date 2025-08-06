import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, List, Select, Input, message, Popconfirm } from "antd";
import ReactApexChart from 'react-apexcharts';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SmileOutlined,
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCourses, updateCourse, deleteCourse } from "../services/course";
import { getHomeworks } from "../services/homework";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Courses() {
  const { token, user, login, logout, selectedSemester, setSelectedSemester } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [courseEditValues, setCourseEditValues] = useState<{ [key: number]: { name: string; description: string } }>({});
  const [allSemesters, setAllSemesters] = useState<string[]>([]);
  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Handle navigation state from Homeworks page
  useEffect(() => {
    if (location.state) {
      const navState = location.state as { selectedSemester?: string };
      if (navState.selectedSemester && navState.selectedSemester !== selectedSemester) {
        setSelectedSemester(navState.selectedSemester);
      }
    }
  }, [location.state, selectedSemester, setSelectedSemester]);

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    try {
      const [coursesData, homeworksData] = await Promise.all([
        getCourses(),
        getHomeworks()
      ]);
      setCourses(coursesData);
      setHomeworks(homeworksData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

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
      fetchData();
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
      fetchData();
    } catch (error) {
      console.error("Failed to delete course:", error);
      message.error("Failed to delete course");
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
      case "exams":
        navigate("/dashboard");
        break;
    }
  };

  // Get unique semesters from courses
  const existingSemesters = Array.from(new Set(courses.map(course => course.semester).filter(Boolean)));
  
  // Combine existing semesters with newly added ones
  const semesters = Array.from(new Set([...existingSemesters, ...allSemesters]));

  // Filter courses by selected semester
  const filteredCourses = selectedSemester === "all" 
    ? courses 
    : courses.filter(course => course.semester === selectedSemester);

  // Get homeworks for a specific course
  const getHomeworksForCourse = (courseId: number) => {
    return homeworks.filter(hw => hw.courseId === courseId);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        width={200}
        style={{
          background: "#e3f2fd",
          borderRight: "1px solid #bbdefb",
          paddingTop: 24,
        }}
      >
        <div style={{
          color: "#1976d2",
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
          selectedKeys={["courses"]}
          style={{ background: "transparent", border: "none" }}
          onClick={handleMenuClick}
        >
          <Menu.Item key="home" icon={<HomeOutlined style={{ color: "#1976d2" }} />}>
            Home
          </Menu.Item>
          <Menu.Item key="courses" icon={<BookOutlined style={{ color: "#1976d2" }} />}>
            Courses
          </Menu.Item>
          <Menu.Item key="homeworks" icon={<FileTextOutlined style={{ color: "#1976d2" }} />}>
            Homeworks
          </Menu.Item>
          <Menu.Item key="exams" icon={<CalendarOutlined style={{ color: "#1976d2" }} />}>
            Exams
          </Menu.Item>
        </Menu>
      </Sider>
      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 32px",
            borderBottom: "1px solid #e3f2fd",
            height: 64,
          }}
        >
          <div style={{ flex: 1 }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", flex: 1 }}>
            <SmileOutlined style={{ fontSize: 24, color: "#1976d2" }} />
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
                color: "#1976d2", 
                fontWeight: 500, 
                fontSize: 16,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #e3f2fd",
                background: "#f8fbff"
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
              
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#1976d2', marginBottom: 12 }}>
                  Semester Information
                </Title>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>Current Semester:</Text>
                  <Text>{selectedSemester}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>Total Semesters:</Text>
                  <Text>{semesters.length}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Available Semesters:</Text>
                  <Text>{semesters.join(', ')}</Text>
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
        <Content style={{ padding: 32, background: "#e3f2fd", minHeight: 0 }}>
          <Row gutter={[32, 32]} justify="center">
            {/* My Courses Section with Semester Selector */}
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: "#1976d2", margin: 0 }}>My Courses</Title>
                <Select
                  placeholder="Select semester"
                  style={{ width: 200 }}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  options={[
                    { value: "all", label: "All Semesters" },
                    ...semesters.map(semester => ({ value: semester, label: semester }))
                  ]}


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
                  // Calculate course-wise homework distribution
                  const courseDistribution = courses.map(course => {
                    const courseHomeworks = homeworks.filter(hw => hw.courseId === course.id);
                    return {
                      name: course.name,
                      value: courseHomeworks.length,
                      color: `hsl(${Math.random() * 360}, 70%, 50%)` // Generate random colors
                    };
                  }).filter(course => course.value > 0);

                  // Generate colors for courses - Vibrant palette
                  const colors = [
                    '#1976d2', '#43a047', '#ff9800', '#e91e63',
                    '#9c27b0', '#00bcd4', '#ff5722', '#4caf50',
                    '#ffc107', '#795548', '#607d8b', '#3f51b5'
                  ];

                  const pieChartOptions = {
                    chart: {
                      type: 'pie' as const,
                      toolbar: {
                        show: false
                      }
                    },
                    labels: courseDistribution.map((course, index) => course.name),
                    colors: courseDistribution.map((_, index) => colors[index % colors.length]),
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
                    <div style={{ textAlign: 'center' }}>
                      <ReactApexChart
                        options={pieChartOptions}
                        series={courseDistribution.map(course => course.value)}
                        type="pie"
                        height={300}
                      />
                      <div style={{ marginTop: 16 }}>
                        <Text type="secondary">
                          Total Homeworks: {homeworks.length} | 
                          Courses with Homeworks: {courseDistribution.length}
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      height: 200, 
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
                      // Course-wise homework distribution
                      const courseData = courses.map(course => {
                        const courseHomeworks = homeworks.filter(hw => hw.courseId === course.id);
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
                        <div style={{ textAlign: 'center' }}>
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
                              Total Courses: {courseData.length} | 
                              Total Homeworks: {courseData.reduce((sum, course) => sum + course.total, 0)}
                            </Text>
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          height: 200, 
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
              <Row gutter={[24, 24]} justify="center">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        title={
                          <div style={{ 
                            color: "#1976d2", 
                            fontWeight: 600, 
                            fontSize: 16,
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
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
                                style={{ flex: 1, marginRight: 8 }}
                              />
                            ) : (
                              <Button
                                type="text"
                                style={{ flex: 1, textAlign: "left", padding: 0, height: "auto", color: "#1976d2", fontWeight: 600, fontSize: 16 }}
                                onClick={() => handleEditCourse(course.id, 'name')}
                              >
                                {course.name}
                              </Button>
                            )}
                            <Popconfirm
                              title="Delete this course?"
                              onConfirm={() => handleDeleteCourse(course.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                style={{ color: "#ff4d4f", padding: 4 }}
                                size="small"
                              />
                            </Popconfirm>
                          </div>
                        }
                        style={{ 
                          borderRadius: 12, 
                          border: "none", 
                          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                          height: Math.max(400, 300 + (getHomeworksForCourse(course.id).length * 40)),
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.3s ease"
                        }}
                        styles={{
                          body: {
                            flex: 1,
                            padding: "12px 16px",
                            display: "flex",
                            flexDirection: "column"
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