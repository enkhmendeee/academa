import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, List, Tag, Dropdown, Input, message, Select } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  SmileOutlined,
  DownOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomeworks, updateHomework } from "../services/homework";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Home() {
  const { token, user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");


  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const homeworksData = await getHomeworks(token);
      setHomeworks(homeworksData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
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
      const updatedUser = await updateProfile({ motto: mottoValue }, token);
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
      case "exams":
        navigate("/dashboard");
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

  // Handle status change
  const handleStatusChange = async (homeworkId: number, newStatus: string) => {
    if (!token) return;
    try {
      await updateHomework(homeworkId, { status: newStatus }, token);
      // Refresh data after status update
      fetchData();
    } catch (error) {
      console.error("Failed to update homework status:", error);
    }
  };

  // Status dropdown menu items
  const getStatusMenuItems = (homeworkId: number) => [
    {
      key: "PENDING",
      label: "Pending",
      onClick: () => handleStatusChange(homeworkId, "PENDING"),
    },
    {
      key: "IN_PROGRESS",
      label: "In Progress",
      onClick: () => handleStatusChange(homeworkId, "IN_PROGRESS"),
    },
    {
      key: "COMPLETED",
      label: "Completed",
      onClick: () => handleStatusChange(homeworkId, "COMPLETED"),
    },
    {
      key: "OVERDUE",
      label: "Overdue",
      onClick: () => handleStatusChange(homeworkId, "OVERDUE"),
    },
  ];

  // Filter due soon homeworks (due within 7 days)
  const dueSoonHomeworks = homeworks.filter(hw => {
    const dueDate = new Date(hw.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays >= 0;
  }).slice(0, 3);

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
          selectedKeys={[location.pathname === "/" ? "home" : "dashboard"]}
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
            {/* Weekly Data Section */}
            <Col span={24} style={{ textAlign: "center" }}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "none",
                  background: "#fff",
                }}
              >
                <Row gutter={[32, 32]} justify="center">
                  <Col span={6}>
                    <div style={{ textAlign: "center" }}>
                      <Text strong style={{ fontSize: 24, color: "#1976d2" }}>12</Text>
                      <br />
                      <Text type="secondary">Total Courses</Text>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: "center" }}>
                      <Text strong style={{ fontSize: 24, color: "#1976d2" }}>8</Text>
                      <br />
                      <Text type="secondary">Completed</Text>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: "center" }}>
                      <Text strong style={{ fontSize: 24, color: "#1976d2" }}>4</Text>
                      <br />
                      <Text type="secondary">In Progress</Text>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: "center" }}>
                      <Text strong style={{ fontSize: 24, color: "#1976d2" }}>2</Text>
                      <br />
                      <Text type="secondary">Overdue</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Row justify="center">
                {/* Due Soon Section */}
                <Col span={16}>
                  <Card
                    title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Due Soon</span>}
                    style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
                    loading={loading}
                  >
                    <List
                      dataSource={dueSoonHomeworks}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          style={{ padding: "8px 0" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                            <div>
                              <Text strong>{item.title}</Text>
                              <br />
                              <Text type="secondary">Course: {item.course?.name || item.courseId}</Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div>
                                <Text type="secondary">
                                  Due: {new Date(item.dueDate).toLocaleDateString()}
                                </Text>
                              </div>
                              <Dropdown
                                menu={{ items: getStatusMenuItems(item.id) }}
                                trigger={["click"]}
                              >
                                <Tag 
                                  color={getStatusColor(item.status)} 
                                  style={{ 
                                    marginTop: 4, 
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                  }}
                                >
                                  {item.status}
                                  <DownOutlined style={{ fontSize: 10 }} />
                                </Tag>
                              </Dropdown>
                            </div>
                          </div>
                        </List.Item>
                      )}
                      locale={{ emptyText: "No homeworks due soon." }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
            {/* Exams Soon Section */}
            <Col span={24}>
              <Card
                title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Exams Soon</span>}
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", marginTop: 24 }}
              >
                <Text type="secondary">[Exams feature coming soon]</Text>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}