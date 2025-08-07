import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button, Table, Select, Input, message, Tag, Space, Form, Dropdown, Modal, DatePicker, Progress, Tooltip, Badge } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SmileOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  TrophyOutlined,
  ScheduleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SearchOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getExams, createExam, updateExam, deleteExam } from "../services/exam";
import { getCourses, createCourse } from "../services/course";
import { updateProfile } from "../services/auth";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

const { Sider, Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function Exams() {
  const { token, user, login, logout, selectedSemester, setSelectedSemester } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState(user?.motto || "");
  const [examForm] = Form.useForm();
  const [addingExam, setAddingExam] = useState(false);
  const [courseForm] = Form.useForm();
  const [addingCourse, setAddingCourse] = useState(false);
  const [editingExam, setEditingExam] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [addingNewSemester, setAddingNewSemester] = useState(false);
  const [newSemesterValue, setNewSemesterValue] = useState("");
  const [allSemesters, setAllSemesters] = useState<string[]>([]);
  const [profileVisible, setProfileVisible] = useState(false);
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [examTypeFilter, setExamTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("examDate");
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("ascend");
  const [searchText, setSearchText] = useState("");

  // Countdown timer state
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [nextExam, setNextExam] = useState<any>(null);

  // Modal states
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [examToDelete, setExamToDelete] = useState<any>(null);
  const [viewExamModalVisible, setViewExamModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      fetchExams();
      fetchCourses();
    }
  }, [token, selectedSemester]);

  // Countdown timer effect
  useEffect(() => {
    if (nextExam) {
      const timer = setInterval(() => {
        const now = dayjs();
        const examDate = dayjs(nextExam.examDate);
        const diff = examDate.diff(now);
        
        if (diff > 0) {
          const duration = dayjs.duration(diff);
          setCountdown({
            days: Math.floor(duration.asDays()),
            hours: duration.hours(),
            minutes: duration.minutes()
          });
        } else {
          setCountdown(null);
          fetchExams(); // Refresh to update status
        }
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [nextExam]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await getExams();
      setExams(data);
      
      // Find next exam for countdown
      const now = dayjs();
      const upcomingExams = data
        .filter((exam: any) => dayjs(exam.examDate).isAfter(now))
        .sort((a: any, b: any) => dayjs(a.examDate).diff(dayjs(b.examDate)));
      
      if (upcomingExams.length > 0) {
        setNextExam(upcomingExams[0]);
      } else {
        setNextExam(null);
        setCountdown(null);
      }
    } catch (error) {
      message.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
      
      // Extract unique semesters
      const semesters = Array.from(new Set(data.map((course: any) => course.semester).filter(Boolean))) as string[];
      setAllSemesters(semesters);
    } catch (error) {
      message.error('Failed to fetch courses');
    }
  };

  const handleAddExam = async (values: any) => {
    try {
      setLoading(true);
      const examData = {
        ...values,
        examDate: values.examDate.toISOString(),
        duration: values.duration ? parseInt(values.duration) : null
      };
      
      await createExam(examData);
      message.success('Exam created successfully');
      setExamModalVisible(false);
      examForm.resetFields();
      fetchExams();
    } catch (error) {
      message.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async (examId: number, values: any) => {
    try {
      setLoading(true);
      const examData = {
        ...values,
        examDate: values.examDate ? values.examDate.toISOString() : undefined,
        duration: values.duration ? parseInt(values.duration) : undefined
      };
      
      await updateExam(examId, examData);
      message.success('Exam updated successfully');
      setEditingExam(null);
      setEditingField(null);
      fetchExams();
    } catch (error) {
      message.error('Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    try {
      setLoading(true);
      await deleteExam(examToDelete.id);
      message.success('Exam deleted successfully');
      setDeleteModalVisible(false);
      setExamToDelete(null);
      fetchExams();
    } catch (error) {
      message.error('Failed to delete exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (values: any) => {
    try {
      setLoading(true);
      await createCourse(values);
      message.success('Course created successfully');
      setCourseModalVisible(false);
      courseForm.resetFields();
      fetchCourses();
    } catch (error) {
      message.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMotto = async () => {
    try {
      await updateProfile({ motto: mottoValue });
      message.success('Motto updated successfully');
      setEditingMotto(false);
    } catch (error) {
      message.error('Failed to update motto');
    }
  };

  const handleAddSemester = async () => {
    if (!newSemesterValue.trim()) {
      message.error('Please enter a semester name');
      return;
    }
    
    try {
      await createCourse('New Course', newSemesterValue);
      message.success('Semester added successfully');
      setAddingNewSemester(false);
      setNewSemesterValue("");
      fetchCourses();
    } catch (error) {
      message.error('Failed to add semester');
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
        navigate("/exams");
        break;
    }
  };

  // Filter and sort functions
  const getFilteredExams = () => {
    let filtered = [...exams];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }

    // Course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter(exam => exam.courseId === parseInt(courseFilter));
    }

    // Exam type filter
    if (examTypeFilter !== "all") {
      filtered = filtered.filter(exam => exam.examType === examTypeFilter);
    }

    // Search filter
    if (searchText) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        exam.course?.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "examDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === "ascend") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success";
      case "IN_PROGRESS": return "processing";
      case "OVERDUE": return "error";
      case "PENDING": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircleOutlined />;
      case "IN_PROGRESS": return <PlayCircleOutlined />;
      case "OVERDUE": return <ExclamationCircleOutlined />;
      case "PENDING": return <PauseCircleOutlined />;
      default: return <PauseCircleOutlined />;
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "midterm": return "blue";
      case "final": return "red";
      case "quiz": return "green";
      case "assignment": return "orange";
      default: return "default";
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description.length > 50 
                  ? `${record.description.substring(0, 50)}...` 
                  : record.description}
              </Text>
            </div>
          )}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      render: (course: any) => (
        <Tag color="blue" icon={<BookOutlined />}>
          {course?.name || 'Unknown Course'}
        </Tag>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date: string) => (
        <div>
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(date).format('MMM DD, YYYY')}
          </div>
          <div>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {dayjs(date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Type',
      dataIndex: 'examType',
      key: 'examType',
      render: (type: string) => (
        <Tag color={getExamTypeColor(type)} icon={<FileTextOutlined />}>
          {type || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        location ? (
          <div>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {location}
          </div>
        ) : (
          <Text type="secondary">TBD</Text>
        )
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (
        duration ? (
          <div>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {duration} min
          </div>
        ) : (
          <Text type="secondary">TBD</Text>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'In Progress', value: 'IN_PROGRESS' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Overdue', value: 'OVERDUE' },
      ],
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number) => (
        grade !== null ? (
          <Tag color={grade >= 90 ? 'green' : grade >= 80 ? 'blue' : grade >= 70 ? 'orange' : 'red'}>
            {grade}%
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedExam(record);
                setViewExamModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingExam(record.id);
                examForm.setFieldsValue({
                  ...record,
                  examDate: dayjs(record.examDate),
                  duration: record.duration?.toString()
                });
                setExamModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setExamToDelete(record);
                setDeleteModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredExams = getFilteredExams();

  // Statistics
  const totalExams = exams.length;
  const completedExams = exams.filter(exam => exam.status === 'COMPLETED').length;
  const pendingExams = exams.filter(exam => exam.status === 'PENDING').length;
  const inProgressExams = exams.filter(exam => exam.status === 'IN_PROGRESS').length;
  const overdueExams = exams.filter(exam => exam.status === 'OVERDUE').length;
  const upcomingExams = exams.filter(exam => dayjs(exam.examDate).isAfter(dayjs())).length;
  const averageGrade = exams.filter(exam => exam.grade !== null).length > 0
    ? exams.filter(exam => exam.grade !== null).reduce((sum, exam) => sum + exam.grade, 0) / exams.filter(exam => exam.grade !== null).length
    : 0;

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
          selectedKeys={[location.pathname === "/" ? "home" : location.pathname.substring(1)]}
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
                  onPressEnter={handleUpdateMotto}
                  onBlur={handleUpdateMotto}
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
                  onClick={handleUpdateMotto}
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
                  {user?.motto || "Click to add your motto"}
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
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter') {
                setProfileVisible(false);
              }
            }}
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
                  <Text>{selectedSemester || 'All Semesters'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Available Semesters:</Text>
                  <Text>{allSemesters.length} semesters</Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <Button
                  type="default"
                  style={{ flex: 1 }}
                  onClick={() => setProfileVisible(false)}
                >
                  Close
                </Button>
                <Button
                  type="primary"
                  style={{ flex: 1, background: '#1976d2', borderColor: '#1976d2' }}
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </Card>
          </button>
        )}

        <Content style={{ 
          padding: '32px', 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {/* Countdown Timer */}
          {countdown && nextExam && (
            <Card
              style={{ 
                marginBottom: 24, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    <BellOutlined style={{ marginRight: 8 }} />
                    Next Exam: {nextExam.title}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {dayjs(nextExam.examDate).format('MMM DD, YYYY [at] HH:mm')}
                  </Text>
                </Col>
                <Col>
                  <Space size="large">
                    <div style={{ textAlign: 'center' }}>
                      <Title level={2} style={{ color: 'white', margin: 0 }}>
                        {countdown.days}
                      </Title>
                      <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Days</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={2} style={{ color: 'white', margin: 0 }}>
                        {countdown.hours}
                      </Title>
                      <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Hours</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={2} style={{ color: 'white', margin: 0 }}>
                        {countdown.minutes}
                      </Title>
                      <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Minutes</Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          )}

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ 
                textAlign: 'center', 
                borderRadius: 12, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'white'
              }}>
                <div style={{ fontSize: '24px', color: '#1976d2', marginBottom: 8 }}>
                  <FileTextOutlined />
                </div>
                <Title level={3} style={{ margin: 0, color: '#1976d2' }}>
                  {totalExams}
                </Title>
                <Text type="secondary">Total Exams</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ 
                textAlign: 'center', 
                borderRadius: 12, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'white'
              }}>
                <div style={{ fontSize: '24px', color: '#43a047', marginBottom: 8 }}>
                  <CheckCircleOutlined />
                </div>
                <Title level={3} style={{ margin: 0, color: '#43a047' }}>
                  {completedExams}
                </Title>
                <Text type="secondary">Completed</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ 
                textAlign: 'center', 
                borderRadius: 12, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'white'
              }}>
                <div style={{ fontSize: '24px', color: '#ffa726', marginBottom: 8 }}>
                  <ClockCircleOutlined />
                </div>
                <Title level={3} style={{ margin: 0, color: '#ffa726' }}>
                  {upcomingExams}
                </Title>
                <Text type="secondary">Upcoming</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ 
                textAlign: 'center', 
                borderRadius: 12, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'white'
              }}>
                <div style={{ fontSize: '24px', color: '#9c27b0', marginBottom: 8 }}>
                  <TrophyOutlined />
                </div>
                <Title level={3} style={{ margin: 0, color: '#9c27b0' }}>
                  {averageGrade.toFixed(1)}%
                </Title>
                <Text type="secondary">Average Grade</Text>
              </Card>
            </Col>
          </Row>

          {/* Filters and Actions */}
          <Card style={{ 
            marginBottom: 24, 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            background: 'white'
          }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Search exams..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Status"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="all">All Status</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="OVERDUE">Overdue</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Course"
                  style={{ width: '100%' }}
                  value={courseFilter}
                  onChange={setCourseFilter}
                >
                  <Option value="all">All Courses</Option>
                  {courses.map(course => (
                    <Option key={course.id} value={course.id.toString()}>
                      {course.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  placeholder="Exam Type"
                  style={{ width: '100%' }}
                  value={examTypeFilter}
                  onChange={setExamTypeFilter}
                >
                  <Option value="all">All Types</Option>
                  <Option value="Midterm">Midterm</Option>
                  <Option value="Final">Final</Option>
                  <Option value="Quiz">Quiz</Option>
                  <Option value="Assignment">Assignment</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchExams}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingExam(null);
                      examForm.resetFields();
                      setExamModalVisible(true);
                    }}
                  >
                    Add Exam
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Exams Table */}
          <Card style={{ 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            background: 'white'
          }}>
            <Table
              columns={columns}
              dataSource={filteredExams}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} exams`
              }}
              onChange={(pagination, filters, sorter: any) => {
                if (sorter && !Array.isArray(sorter) && sorter.key) {
                  setSortBy(sorter.key as string);
                  setSortOrder(sorter.order || 'ascend');
                }
              }}
            />
          </Card>
        </Content>
      </Layout>

      {/* Add/Edit Exam Modal */}
      <Modal
        title={editingExam ? "Edit Exam" : "Add New Exam"}
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={examForm}
          layout="vertical"
          onFinish={editingExam ? (values) => handleUpdateExam(editingExam, values) : handleAddExam}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Exam Title"
                rules={[{ required: true, message: 'Please enter exam title' }]}
              >
                <Input placeholder="Enter exam title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="examType"
                label="Exam Type"
              >
                <Select placeholder="Select exam type">
                  <Option value="Midterm">Midterm</Option>
                  <Option value="Final">Final</Option>
                  <Option value="Quiz">Quiz</Option>
                  <Option value="Assignment">Assignment</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="examDate"
                label="Exam Date & Time"
                rules={[{ required: true, message: 'Please select exam date and time' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="Select date and time"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="courseId"
                label="Course"
                rules={[{ required: true, message: 'Please select a course' }]}
              >
                <Select placeholder="Select course">
                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>
                      {course.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
              >
                <Input placeholder="Enter exam location" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
              >
                <Input type="number" placeholder="Enter duration" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter exam description" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingExam ? 'Update Exam' : 'Add Exam'}
              </Button>
              <Button onClick={() => setExamModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Exam"
        open={deleteModalVisible}
        onOk={handleDeleteExam}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={loading}
      >
        <p>Are you sure you want to delete "{examToDelete?.title}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* View Exam Details Modal */}
      <Modal
        title="Exam Details"
        open={viewExamModalVisible}
        onCancel={() => setViewExamModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewExamModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedExam && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Basic Information">
                  <p><strong>Title:</strong> {selectedExam.title}</p>
                  <p><strong>Type:</strong> {selectedExam.examType || 'N/A'}</p>
                  <p><strong>Course:</strong> {selectedExam.course?.name}</p>
                  <p><strong>Status:</strong> 
                    <Tag color={getStatusColor(selectedExam.status)} style={{ marginLeft: 8 }}>
                      {selectedExam.status.replace('_', ' ')}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Schedule & Location">
                  <p><strong>Date:</strong> {dayjs(selectedExam.examDate).format('MMM DD, YYYY')}</p>
                  <p><strong>Time:</strong> {dayjs(selectedExam.examDate).format('HH:mm')}</p>
                  <p><strong>Location:</strong> {selectedExam.location || 'TBD'}</p>
                  <p><strong>Duration:</strong> {selectedExam.duration ? `${selectedExam.duration} minutes` : 'TBD'}</p>
                </Card>
              </Col>
            </Row>
            
            {selectedExam.description && (
              <Card size="small" title="Description" style={{ marginTop: 16 }}>
                <p>{selectedExam.description}</p>
              </Card>
            )}

            {selectedExam.grade !== null && (
              <Card size="small" title="Grade" style={{ marginTop: 16 }}>
                <Progress
                  type="circle"
                  percent={selectedExam.grade}
                  format={percent => `${percent}%`}
                  strokeColor={selectedExam.grade >= 90 ? '#52c41a' : selectedExam.grade >= 80 ? '#1890ff' : selectedExam.grade >= 70 ? '#faad14' : '#f5222d'}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Add Course Modal */}
      <Modal
        title="Add New Course"
        open={courseModalVisible}
        onCancel={() => setCourseModalVisible(false)}
        footer={null}
      >
        <Form
          form={courseForm}
          layout="vertical"
          onFinish={handleAddCourse}
        >
          <Form.Item
            name="name"
            label="Course Name"
            rules={[{ required: true, message: 'Please enter course name' }]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>
          
          <Form.Item
            name="semester"
            label="Semester"
          >
            <Select placeholder="Select semester">
              {allSemesters.map(semester => (
                <Option key={semester} value={semester}>{semester}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter course description" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Course
              </Button>
              <Button onClick={() => setCourseModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Semester Modal */}
      <Modal
        title="Add New Semester"
        open={addingNewSemester}
        onOk={handleAddSemester}
        onCancel={() => setAddingNewSemester(false)}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter semester name (e.g., Fall 2024)"
          value={newSemesterValue}
          onChange={(e) => setNewSemesterValue(e.target.value)}
          onPressEnter={handleAddSemester}
        />
      </Modal>
    </Layout>
  );
} 