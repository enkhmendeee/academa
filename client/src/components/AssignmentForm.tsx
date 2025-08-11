import React from "react";
import { Form, Input, Select, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDefaultDateTime } from "../utils/homeworkUtils";

interface AssignmentFormProps {
  formType: 'homework' | 'exam';
  setFormType: (type: 'homework' | 'exam') => void;
  currentSemesterCourses: any[];
  addingHomework: boolean;
  onFinish: (values: any) => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  formType,
  setFormType,
  currentSemesterCourses,
  addingHomework,
  onFinish,
}) => {
  const [homeworkForm] = Form.useForm();

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
      {/* Assignment Adder Row - Always at top */}
      <div style={{ 
        padding: '16px', 
        background: '#fafafa', 
        borderBottom: '1px solid #f0f0f0',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Form 
          form={homeworkForm} 
          layout="inline" 
          onFinish={onFinish}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <Form.Item 
            name="title" 
            rules={[{ required: true, message: 'Title required!' }]}
            style={{ marginBottom: 0, flex: 1 }}
          >
            <Input 
              placeholder={formType === 'homework' ? 'Homework Title' : 'Exam Title'} 
              style={{ borderRadius: 8 }} 
            />
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
            name={formType === 'homework' ? 'dueDate' : 'examDate'} 
            rules={[{ required: true, message: formType === 'homework' ? 'Due date required!' : 'Exam date required!' }]}
            style={{ marginBottom: 0, width: 150 }}
            initialValue={getDefaultDateTime()}
          >
            <Input 
              type="datetime-local" 
              placeholder={formType === 'homework' ? 'Due Date' : 'Exam Date'}
              style={{ borderRadius: 8 }} 
            />
          </Form.Item>
          {formType === 'exam' && (
            <Form.Item 
              name="examType" 
              style={{ marginBottom: 0, width: 120 }}
            >
              <Select placeholder="Type" style={{ borderRadius: 8 }}>
                <Select.Option value="Midterm">Midterm</Select.Option>
                <Select.Option value="Final">Final</Select.Option>
                <Select.Option value="Quiz">Quiz</Select.Option>
                <Select.Option value="Assignment">Assignment</Select.Option>
              </Select>
            </Form.Item>
          )}
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
                background: formType === 'homework' ? '#1976d2' : '#9c27b0', 
                borderColor: formType === 'homework' ? '#1976d2' : '#9c27b0'
              }}
            >
              Add {formType === 'homework' ? 'Homework' : 'Exam'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
