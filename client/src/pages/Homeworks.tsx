import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, Table, Select, Input, message, Tag, Space } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  SmileOutlined,
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomeworks } from "../services/homework";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Homeworks() {
  const { token, user, login } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
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
  const semesters = Array.from(new Set(homeworks.map(hw => hw.course?.semester).filter(Boolean)));

  // Filter homeworks by selected semester
  const filteredHomeworks = selectedSemester === "all" 
    ? homeworks 
    : homeworks.filter(hw => hw.course?.semester === selectedSemester);

  // Table columns
  const columns = [
    {
      title: "HW",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Course",
      dataIndex: ["course", "name"],
      key: "course",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Due Date/In",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: number) => (
        <Text>{grade ? `${grade}%` : "-"}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="link">
            Edit
          </Button>
          <Button size="small" type="link" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

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
          selectedKeys={["homeworks"]}
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
          <Title level={2} style={{ color: "#1976d2", margin: 0 }}>Homeworks</Title>
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
            
            {/* My Homeworks Section with Semester Selector */}
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: "#1976d2", margin: 0 }}>My Homeworks</Title>
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

            {/* Homework Table */}
            <Col span={24}>
              <Card
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/dashboard")}
                    style={{ background: "#1976d2", borderColor: "#1976d2" }}
                  >
                    Add New Homework
                  </Button>
                }
              >
                <Table
                  columns={columns}
                  dataSource={filteredHomeworks}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                  scroll={{ y: 400 }}
                />
              </Card>
            </Col>

            {/* Visuals/Graph Section */}
            <Col span={24}>
              <Card
                title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Visuals / Graph</span>}
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
              >
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Text type="secondary">[Homework statistics and charts will be displayed here]</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
} 