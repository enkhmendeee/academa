import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, Table, Select, Input, message, Tag, Space, Form } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SmileOutlined,
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomeworks, createHomework, updateHomework } from "../services/homework";
import { getCourses, createCourse } from "../services/course";
import { updateProfile } from "../services/auth";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;



export default function Homeworks() {
  const { token, user, login, logout, selectedSemester, setSelectedSemester } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");
  const [homeworkForm] = Form.useForm();
  const [addingHomework, setAddingHomework] = useState(false);
  const [courseForm] = Form.useForm();
  const [addingCourse, setAddingCourse] = useState(false);
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

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [homeworksData, coursesData] = await Promise.all([
        getHomeworks(),
        getCourses()
      ]);
      setHomeworks(homeworksData);
      setCourses(coursesData);
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
  const handleAddCourse = async (values: { name: string }) => {
    if (!token) return;
    setAddingCourse(true);
    try {
      await createCourse(values.name, selectedSemester);
      message.success("Course added successfully!");
      courseForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Failed to add course:", error);
      message.error("Failed to add course");
    }
    setAddingCourse(false);
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

  // Update homework field
  const handleUpdateHomeworkField = async (homeworkId: number, field: string, value: any) => {
    if (!token) return;
    try {
      await updateHomework(homeworkId, { [field]: value });
      message.success("Homework updated successfully!");
      fetchData();
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
      
      return semesterMatch && statusMatch && courseMatch;
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

  // Filter courses by selected semester
  const currentSemesterCourses = courses.filter(course => course.semester === selectedSemester);

  // Table columns
  const columns = [
    {
      title: "HW",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'title';
        return isEditing ? (
          <Input
            defaultValue={text}
            onPressEnter={(e: any) => handleUpdateHomeworkField(record.id, 'title', e.target.value)}
            onBlur={() => setEditingHomework(null)}
            autoFocus
            style={{ borderRadius: 8 }}
          />
        ) : (
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
        );
      },
    },
    {
      title: "Course",
      dataIndex: ["course", "name"],
      key: "course",
      render: (text: string, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'courseId';
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
          <Text 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setEditingHomework(record.id);
              setEditingField('courseId');
            }}
          >
            {text}
          </Text>
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
        const isEditing = editingHomework === record.id && editingField === 'status';
        return isEditing ? (
          <Select
            defaultValue={status}
            onSelect={(value) => handleUpdateHomeworkField(record.id, 'status', value)}
            onBlur={() => setEditingHomework(null)}
            style={{ width: 120, borderRadius: 8 }}
            autoFocus
          >
            <Select.Option value="PENDING">Pending</Select.Option>
            <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
            <Select.Option value="COMPLETED">Completed</Select.Option>
            <Select.Option value="OVERDUE">Overdue</Select.Option>
          </Select>
        ) : (
          <Tag 
            color={getStatusColor(status)}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setEditingHomework(record.id);
              setEditingField('status');
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: number, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'grade';
        return isEditing ? (
          <Input
            defaultValue={grade || ''}
            onPressEnter={(e: any) => handleUpdateHomeworkField(record.id, 'grade', parseInt(e.target.value) || null)}
            onBlur={() => setEditingHomework(null)}
            autoFocus
            style={{ borderRadius: 8, width: 80 }}
            placeholder="%"
          />
        ) : (
          <Text 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setEditingHomework(record.id);
              setEditingField('grade');
            }}
          >
            {grade ? `${grade}%` : "-"}
          </Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
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
                        value={courseForm.getFieldValue('name') || ''}
                        onChange={(e) => courseForm.setFieldValue('name', e.target.value)}
                        onPressEnter={() => {
                          const value = courseForm.getFieldValue('name');
                          if (value?.trim()) {
                            handleAddCourse({ name: value.trim() });
                            courseForm.resetFields();
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
                      
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        loading={addingCourse}
                        onClick={() => {
                          const value = courseForm.getFieldValue('name');
                          if (value?.trim()) {
                            handleAddCourse({ name: value.trim() });
                            courseForm.resetFields();
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
                              const colors = [
                                { bg: '#e3f2fd', border: '#1976d2', text: '#1976d2' },
                                { bg: '#f3e5f5', border: '#7b1fa2', text: '#7b1fa2' },
                                { bg: '#e8f5e8', border: '#388e3c', text: '#388e3c' },
                                { bg: '#fff3e0', border: '#f57c00', text: '#f57c00' },
                                { bg: '#fce4ec', border: '#c2185b', text: '#c2185b' },
                                { bg: '#e0f2f1', border: '#00695c', text: '#00695c' }
                              ];
                              const color = colors[index % colors.length];
                              return (
                                <Tag
                                  key={course.id}
                                  style={{ 
                                    borderRadius: 16, 
                                    padding: '6px 14px',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    border: `2px solid ${color.border}`,
                                    background: color.bg,
                                    color: color.text,
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

            {/* Homework Table */}
            <Col span={24}>
              <Card
                title={<span style={{ color: "#1976d2", fontWeight: 500 }}>Add a New Homework</span>}
                style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
              >
                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                  {/* Homework Adder Row - Always at top */}
                  <div style={{ 
                    padding: '16px', 
                    background: '#fafafa', 
                    borderBottom: '1px solid #f0f0f0',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <Form 
                      form={homeworkForm} 
                      layout="inline" 
                      onFinish={handleAddHomework}
                      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                      <Form.Item 
                        name="title" 
                        rules={[{ required: true, message: 'Title required!' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="Homework Title" style={{ borderRadius: 8 }} />
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
            name="dueDate" 
            rules={[{ required: true, message: 'Due date required!' }]}
            style={{ marginBottom: 0, width: 150 }}
          >
            <Input type="datetime-local" style={{ borderRadius: 8 }} />
          </Form.Item>
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
                            background: '#1976d2', 
                            borderColor: '#1976d2'
                          }}
                        >
                          Add
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                  
                  {/* Filter and Sort Controls */}
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
                        <Option value="COMPLETED">Completed</Option>
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
                  
                  {/* Homework Table */}
                  <Table
                    columns={columns}
                    dataSource={filteredAndSortedHomeworks}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: Math.max(200, filteredAndSortedHomeworks.length * 50 + 100) }}
                    style={{ marginTop: 0 }}
                  />
                </div>
              </Card>
            </Col>


          </Row>
        </Content>
      </Layout>
    </Layout>
  );
} 