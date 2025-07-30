import React, { useEffect, useState } from "react";
import { Card, Typography, Form, Input, Button, List, message, Popconfirm, Select } from "antd";
import { PlusOutlined, DeleteOutlined, BookOutlined, FileTextOutlined } from "@ant-design/icons";
import { getCourses, createCourse, deleteCourse } from "../services/course";
import { getHomeworks, createHomework, deleteHomework } from "../services/homework";
import { useAuth } from "../hooks/useAuth";
import LogoutButton from "../components/LogoutButton";

const { Title, Text } = Typography;

export default function Dashboard() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [courseForm] = Form.useForm();
  const [homeworkForm] = Form.useForm();

  // Fetch courses and homeworks
  const fetchCourses = async () => {
    if (!token) return;
    setCourseLoading(true);
    try {
      const data = await getCourses(token);
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
      const data = await getHomeworks(token);
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

  // Add course
  const onAddCourse = async (values: { name: string }) => {
    if (!token) return;
    try {
      await createCourse(values.name, token);
      message.success("Course added");
      courseForm.resetFields();
      fetchCourses();
    } catch {
      message.error("Failed to add course");
    }
  };

  // Delete course
  const onDeleteCourse = async (id: number) => {
    if (!token) return;
    try {
      await deleteCourse(id, token);
      message.success("Course deleted");
      fetchCourses();
    } catch {
      message.error("Failed to delete course");
    }
  };

  // Add homework
  const onAddHomework = async (values: any) => {
    if (!token) return;
    try {
      await createHomework(values, token);
      message.success("Homework added");
      homeworkForm.resetFields();
      fetchHomeworks();
    } catch {
      message.error("Failed to add homework");
    }
  };

  // Delete homework
  const onDeleteHomework = async (id: number) => {
    if (!token) return;
    try {
      await deleteHomework(id, token);
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
          title={<span><BookOutlined style={{ color: '#1976d2' }} /> <span style={{ color: '#1976d2' }}>Courses</span></span>}
        >
          <Form form={courseForm} layout="vertical" onFinish={onAddCourse} style={{ marginBottom: 24 }}>
            <Form.Item name="name" rules={[{ required: true, message: 'Please enter course name!' }]}> 
              <Input placeholder="Course Name" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ width: '100%', borderRadius: 8, background: '#1976d2', borderColor: '#1976d2' }} loading={courseLoading}>
                Add Course
              </Button>
            </Form.Item>
          </Form>
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
                <Text>{item.name}</Text>
              </List.Item>
            )}
            locale={{ emptyText: 'No courses yet.' }}
          />
        </Card>
        {/* Homeworks Section */}
        <Card
          style={{ flex: 1, minWidth: 340, maxWidth: 420, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: 'none' }}
          title={<span><FileTextOutlined style={{ color: '#1976d2' }} /> <span style={{ color: '#1976d2' }}>Homeworks</span></span>}
        >
          <Form form={homeworkForm} layout="vertical" onFinish={onAddHomework} style={{ marginBottom: 24 }}>
            <Form.Item name="title" rules={[{ required: true, message: 'Please enter homework title!' }]}> 
              <Input placeholder="Homework Title" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="courseId" rules={[{ required: true, message: 'Select course!' }]}> 
              <Select placeholder="Select Course" style={{ borderRadius: 8 }}>
                {courses.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="dueDate" rules={[{ required: true, message: 'Enter due date!' }]}> 
              <Input type="date" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ width: '100%', borderRadius: 8, background: '#1976d2', borderColor: '#1976d2' }} loading={homeworkLoading}>
                Add Homework
              </Button>
            </Form.Item>
          </Form>
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
                  <Text type="secondary">Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : ''}</Text>
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
