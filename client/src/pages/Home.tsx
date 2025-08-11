import React, { useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, Input, message, Select, Modal} from "antd";
import DataVisualizations from "../components/DataVisualizations";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  EditOutlined,
  CheckOutlined,
  LogoutOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../context/DataContext";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Home() {
  const { token, user, login, logout, selectedSemester, setSelectedSemester, setLatestSemester, allSemesters, addSemester, removeSemester, updateSemester } = useAuth();
  const { homeworks, courses, exams, loading } = useData();
  const navigate = useNavigate();

  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");
  const [profileVisible, setProfileVisible] = useState(false);
  
  // Semester management states
  const [editingSemester, setEditingSemester] = useState<string | null>(null);
  const [editingSemesterValue, setEditingSemesterValue] = useState("");
  const [newSemesterValue, setNewSemesterValue] = useState("");

  // Auto-set latest semester when data is loaded
  React.useEffect(() => {
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

  // Filter data by selected semester
  const filteredHomeworks = homeworks.filter(hw => (hw.semester || hw.course?.semester) === selectedSemester);
  const filteredCourses = courses.filter(course => course.semester === selectedSemester);
  const filteredExams = exams.filter(exam => (exam.semester || exam.course?.semester) === selectedSemester);

  // Update motto
  const handleSaveMotto = async () => {
    if (!token) {
      message.error("No authentication token found");
      return;
    }
    
    if (!mottoValue.trim()) {
      message.error("Motto cannot be empty");
      return;
    }
    
    try {
      const updatedUser = await updateProfile({ motto: mottoValue });
      
      // Update the user in context
      login(token, updatedUser);
      setEditingMotto(false);
      message.success("Motto updated successfully!");
    } catch (error: any) {
      console.error("Error updating motto:", error);
      message.error("Failed to update motto");
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
          fontSize: 36,
          textAlign: "center",
          marginBottom: 32,
          letterSpacing: 1,
          userSelect: 'none',
          cursor: 'default',
          fontFamily: "'Keania One', cursive"
        }}>
          academa
        </div>
        <Menu
          mode="inline"
          selectedKeys={["home"]}
          style={{ 
            background: "transparent", 
            border: "none"
          }}
          onClick={handleMenuClick}
        >
          <Menu.Item 
            key="home" 
            icon={<HomeOutlined style={{ color: "#1976d2", fontSize: "18px" }} />}
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
                width: 500,
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
        <Content style={{ padding: "16px 32px", background: "linear-gradient(180deg, #ffffff 0%, #bbdefb 100%)", minHeight: 0 }}>
          <Row gutter={[32, 32]} justify="center">

            {/* Data Visualizations */}
            <Col span={24}>
              <DataVisualizations homeworks={filteredHomeworks} courses={filteredCourses} exams={filteredExams} />
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}