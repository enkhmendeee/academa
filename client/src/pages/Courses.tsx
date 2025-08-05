import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, List, Select, Input, message, Popconfirm, Space } from "antd";
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
  const [addingNewSemester, setAddingNewSemester] = useState(false);
  const [newSemesterValue, setNewSemesterValue] = useState("");
  const [allSemesters, setAllSemesters] = useState<string[]>([]);
  const [profileVisible, setProfileVisible] = useState(false);

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
        getCourses(token),
        getHomeworks(token)
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
      const updatedUser = await updateProfile({ motto: mottoValue }, token);
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
      await updateCourse(courseId, { [field]: value }, token);
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
      await deleteCourse(courseId, token);
      message.success("Course deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to delete course:", error);
      message.error("Failed to delete course");
    }
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

                  onOpenChange={(open) => {
                    if (!open) {
                      setAddingNewSemester(false);
                      setNewSemesterValue("");
                    }
                  }}
                />
                {addingNewSemester && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input
                      size="small"
                      placeholder="Enter semester name"
                      value={newSemesterValue}
                      onChange={(e) => setNewSemesterValue(e.target.value)}
                      onPressEnter={handleAddNewSemester}
                      autoFocus
                      style={{ flex: 1 }}
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={handleAddNewSemester}
                      style={{ background: '#1976d2', borderColor: '#1976d2' }}
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setAddingNewSemester(false);
                        setNewSemesterValue("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {!addingNewSemester && (
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setAddingNewSemester(true)}
                    style={{ marginLeft: 8, color: '#1976d2' }}
                  >
                    Add New Semester
                  </Button>
                )}
              </Row>
            </Col>

            {/* Visuals/Graph Section */}
            <Col span={24}>
              <Card
                title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Visuals / Graph</span>}
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
              >
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Text type="secondary">[Course statistics and charts will be displayed here]</Text>
                </div>
              </Card>
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
                            <Space>
                              {editingCourse === course.id && editingField === 'name' ? (
                                <Button
                                  type="text"
                                  icon={<CheckOutlined />}
                                  onClick={(e: any) => handleUpdateCourse(course.id, 'name', courseEditValues[course.id]?.name || course.name)}
                                  style={{ color: "#1976d2", padding: 4 }}
                                  size="small"
                                />
                              ) : (
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditCourse(course.id, 'name')}
                                  style={{ color: "#1976d2", padding: 4 }}
                                  size="small"
                                />
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
                            </Space>
                          </div>
                        }
                        style={{ 
                          borderRadius: 12, 
                          border: "none", 
                          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                          height: Math.max(300, 200 + (getHomeworksForCourse(course.id).length * 40)),
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
                              <Button
                                type="text"
                                icon={<CheckOutlined />}
                                onClick={() => handleUpdateCourse(course.id, 'description', courseEditValues[course.id]?.description || '')}
                                style={{ color: "#1976d2", padding: 4 }}
                                size="small"
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
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditCourse(course.id, 'description')}
                                style={{ color: "#1976d2", padding: 4 }}
                                size="small"
                              />
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          flex: 1, 
                          overflowY: "auto",
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          padding: 8,
                          background: "#fafafa",
                          minHeight: Math.max(100, getHomeworksForCourse(course.id).length * 30)
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
                                    Due: {new Date(homework.dueDate).toLocaleDateString()}
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