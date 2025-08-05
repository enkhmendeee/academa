import React, { useEffect, useState } from "react";
import { Card, Typography, List, message, Popconfirm, Button } from "antd";
import { DeleteOutlined, BookOutlined, FileTextOutlined } from "@ant-design/icons";
import { getCourses, deleteCourse } from "../services/course";
import { getHomeworks, deleteHomework } from "../services/homework";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const { Title, Text } = Typography;

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [homeworkLoading, setHomeworkLoading] = useState(false);

  // Fetch courses and homeworks
  const fetchCourses = async () => {
    if (!token) return;
    setCourseLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch {
      message.error("Failed to load courses");
    }
    setCourseLoading(false);
  };
  const fetchHomeworks = async () => {
    if (!token) return;
    setHomeworkLoading(true);
    try {
      const data = await getHomeworks();
      setHomeworks(data);
    } catch {
      message.error("Failed to load homeworks");
    }
    setHomeworkLoading(false);
  };

  useEffect(() => {
    fetchCourses();
    fetchHomeworks();
    // eslint-disable-next-line
  }, [token]);

  // Delete course
  const onDeleteCourse = async (id: number) => {
    if (!token) return;
    try {
      await deleteCourse(id);
      message.success("Course deleted");
      fetchCourses();
    } catch {
      message.error("Failed to delete course");
    }
  };

  // Delete homework
  const onDeleteHomework = async (id: number) => {
    if (!token) return;
    try {
      await deleteHomework(id);
      message.success("Homework deleted");
      fetchHomeworks();
    } catch {
      message.error("Failed to delete homework");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '40px 0'
    }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <Title level={2} style={{ color: '#1976d2', margin: 0 }}>Dashboard</Title>
        <LogoutButton />
      </div>
      
      <div style={{ display: 'flex', gap: 32, width: '100%', maxWidth: 900, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Courses Section */}
        <Card
          style={{ flex: 1, minWidth: 340, maxWidth: 420, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: 'none' }}
          title={
            <Button
              type="link"
              style={{ padding: 0, height: 'auto', color: '#1976d2' }}
              onClick={() => navigate('/courses')}
            >
              <BookOutlined style={{ color: '#1976d2' }} /> <span style={{ color: '#1976d2' }}>Courses</span>
            </Button>
          }
        >
          <List
            dataSource={courses}
            loading={courseLoading}
            renderItem={item => (
              <List.Item
                key={item.id}
                actions={[
                  <Popconfirm key="delete-course" title="Delete this course?" onConfirm={() => onDeleteCourse(item.id)} okText="Yes" cancelText="No">
                    <Button icon={<DeleteOutlined />} danger size="small" />
                  </Popconfirm>
                ]}
              >
                <div>
                  <Text>{item.name}</Text>
                  {item.semester && <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Semester: {item.semester}</Text>}
                </div>
              </List.Item>
            )}
            locale={{ emptyText: 'No courses yet.' }}
          />
        </Card>
        {/* Homeworks Section */}
        <Card
          style={{ flex: 1, minWidth: 340, maxWidth: 420, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: 'none' }}
          title={
            <Button
              type="link"
              style={{ padding: 0, height: 'auto', color: '#1976d2' }}
              onClick={() => navigate('/homeworks')}
            >
              <FileTextOutlined style={{ color: '#1976d2' }} /> <span style={{ color: '#1976d2' }}>Homeworks & Courses</span>
            </Button>
          }
        >
          <List
            dataSource={homeworks}
            loading={homeworkLoading}
            renderItem={item => (
              <List.Item
                key={item.id}
                actions={[
                  <Popconfirm key="delete-homework" title="Delete this homework?" onConfirm={() => onDeleteHomework(item.id)} okText="Yes" cancelText="No">
                    <Button icon={<DeleteOutlined />} danger size="small" />
                  </Popconfirm>
                ]}
              >
                <div>
                  <Text strong>{item.title}</Text> <br />
                  <Text type="secondary">Course: {item.course?.name || item.courseId}</Text> <br />
                  <Text type="secondary">Due: {item.dueDate ? new Date(item.dueDate).toLocaleString() : ''}</Text>
                  {item.semester && <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Semester: {item.semester}</Text>}
                </div>
              </List.Item>
            )}
            locale={{ emptyText: 'No homeworks yet.' }}
          />
        </Card>
      </div>
    </div>
  );
}
