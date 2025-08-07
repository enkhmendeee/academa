import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, Input, message, Select} from "antd";
import DataVisualizations from "../components/DataVisualizations";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SmileOutlined,
  EditOutlined,
  CheckOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomeworks } from "../services/homework";
import { getCourses } from "../services/course";
import { getExams } from "../services/exam";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Home() {
  const { token, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");
  const [profileVisible, setProfileVisible] = useState(false);

  // Common semester options


  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    try {
      const [homeworksData, coursesData, examsData] = await Promise.all([
        getHomeworks(),
        getCourses(),
        getExams()
      ]);
      setHomeworks(homeworksData);
      setCourses(coursesData);
      setExams(examsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Update motto
  const handleSaveMotto = async () => {
    console.log("handleSaveMotto called");
    console.log("Current mottoValue:", mottoValue);
    console.log("Current token:", token);
    console.log("Current user:", user);
    
    if (!token) {
      console.log("No token found");
      message.error("No authentication token found");
      return;
    }
    
    if (!mottoValue.trim()) {
      console.log("Empty motto value");
      message.error("Motto cannot be empty");
      return;
    }
    
    try {
      console.log("Calling updateProfile with:", { motto: mottoValue });
      const updatedUser = await updateProfile({ motto: mottoValue });
      console.log("Updated user response:", updatedUser);
      
      // Update the user in context
      login(token, updatedUser);
      setEditingMotto(false);
      message.success("Motto updated successfully!");
      console.log("Motto update completed successfully");
    } catch (error: any) {
      console.error("Error updating motto:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
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
    }
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
          selectedKeys={["home"]}
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
                  onClick={() => {
                    console.log("Confirm button clicked!");
                    handleSaveMotto();
                  }}
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


            {/* Data Visualizations */}
            <Col span={24}>
              <DataVisualizations homeworks={homeworks} courses={courses} exams={exams} />
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}