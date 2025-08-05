import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, List, Select, Input, message } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  SmileOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCourses } from "../services/course";
import { getHomeworks } from "../services/homework";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Courses() {
  const { token, user, login, selectedSemester, setSelectedSemester } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");

  // Common semester options
  const semesterOptions = [
    "Fall 2024",
    "Spring 2025", 
    "Summer 2025",
    "Fall 2025",
    "Spring 2026"
  ];

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
      message.error("Failed to update motto");
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
  const semesters = Array.from(new Set(courses.map(course => course.semester).filter(Boolean)));

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
            Homeworks & Courses
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Title level={2} style={{ color: "#1976d2", margin: 0 }}>Courses</Title>
            <Text style={{ fontWeight: 500, color: "#1976d2" }}>Current Semester:</Text>
            <Select
              value={selectedSemester}
              onChange={setSelectedSemester}
              style={{ width: 180 }}
              placeholder="Select semester"
            >
              {semesterOptions.map(semester => (
                <Option key={semester} value={semester}>{semester}</Option>
              ))}
            </Select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Text style={{ fontWeight: 500, color: "#1976d2" }}>Hello, {user?.username || "User"}</Text>
            <Button
              type="link"
              icon={<UserOutlined style={{ color: "#1976d2" }} />}
              style={{ color: "#1976d2", fontWeight: 500 }}
            >
              My Profile
            </Button>
          </div>
        </Header>
        {/* Content */}
        <Content style={{ padding: 32, background: "#e3f2fd", minHeight: 0 }}>
          <Row gutter={[32, 32]} justify="center">
            {/* Motto Section */}
            <Col span={24} style={{ textAlign: "center" }}>
              <Card
                style={{
                  display: "inline-block",
                  minWidth: 400,
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "none",
                  background: "#fff",
                  position: "relative",
                }}
              >
                <SmileOutlined style={{ fontSize: 32, color: "#1976d2", marginRight: 12 }} />
                {editingMotto ? (
                  <Input
                    value={mottoValue}
                    onChange={(e) => setMottoValue(e.target.value)}
                    style={{ 
                      fontSize: 22, 
                      fontWeight: 500, 
                      border: "none", 
                      background: "transparent",
                      textAlign: "center",
                      width: 300
                    }}
                    onPressEnter={handleSaveMotto}
                  />
                ) : (
                  <span style={{ fontSize: 22, fontWeight: 500 }}>
                    {user?.motto || "My Motto"}
                  </span>
                )}
                <Button
                  type="text"
                  icon={editingMotto ? <CheckOutlined /> : <EditOutlined />}
                  onClick={editingMotto ? handleSaveMotto : () => setEditingMotto(true)}
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    color: "#1976d2",
                  }}
                  size="small"
                />
              </Card>
            </Col>
            
            {/* My Courses Section with Semester Selector */}
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: "#1976d2", margin: 0 }}>My Courses</Title>
                <Select
                  placeholder="Select semester"
                  style={{ width: 200 }}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                >
                  <Option value="all">All Semesters</Option>
                  {semesters.map(semester => (
                    <Option key={semester} value={semester}>{semester}</Option>
                  ))}
                </Select>
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
                            textAlign: "center"
                          }}>
                            {course.name}
                          </div>
                        }
                        style={{ 
                          borderRadius: 12, 
                          border: "none", 
                          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                          height: 300,
                          display: "flex",
                          flexDirection: "column"
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
                        <div style={{ 
                          flex: 1, 
                          overflowY: "auto",
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          padding: 8,
                          background: "#fafafa"
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