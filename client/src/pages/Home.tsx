import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Avatar, Card, Row, Col, Button, List, Tag, Dropdown } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  SmileOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCourses } from "../services/course";
import { getHomeworks, updateHomework } from "../services/homework";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

export default function Home() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Navigation handler
  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "home":
        navigate("/");
        break;
      case "courses":
        navigate("/dashboard");
        break;
      case "homeworks":
        navigate("/dashboard");
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
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 32px",
            borderBottom: "1px solid #e3f2fd",
            height: 64,
          }}
        >
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
            <Col span={24} style={{ textAlign: "center" }}>
              <Card
                style={{
                  display: "inline-block",
                  minWidth: 400,
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "none",
                  background: "#fff",
                }}
              >
                <SmileOutlined style={{ fontSize: 32, color: "#1976d2", marginRight: 12 }} />
                <span style={{ fontSize: 22, fontWeight: 500 }}>Your motto here</span>
              </Card>
            </Col>
            <Col span={24} style={{ textAlign: "center" }}>
              <Card
                style={{
                  display: "inline-block",
                  minWidth: 300,
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "none",
                  background: "#fff",
                }}
              >
                <Title level={4} style={{ color: "#1976d2", margin: 0 }}>Weekly Data</Title>
                <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Text type="secondary">Total Courses: {courses.length} | Total Homeworks: {homeworks.length}</Text>
                </div>
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