import React from "react";
import { Table, Input, Select, Button, Tag, Space, Dropdown, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface HomeworkTableProps {
  homeworks: any[];
  exams: any[];
  courses: any[];
  loading: boolean;
  editingHomework: number | null;
  editingField: string | null;
  setEditingHomework: (id: number | null) => void;
  setEditingField: (field: string | null) => void;
  handleUpdateHomeworkField: (homeworkId: number, field: string, value: any) => void;
  getStatusColor: (status: string) => string;
  getStatusDisplayText: (status: string) => string;
}

export const HomeworkTable: React.FC<HomeworkTableProps> = ({
  homeworks,
  exams,
  courses,
  loading,
  editingHomework,
  editingField,
  setEditingHomework,
  setEditingField,
  handleUpdateHomeworkField,
  getStatusColor,
  getStatusDisplayText,
}) => {
  const [editValues, setEditValues] = React.useState<Record<number, string>>({});

  const setEditValue = (recordId: number, value: string) => {
    setEditValues(prev => ({ ...prev, [recordId]: value }));
  };
  const columns = [
    {
      title: "Assignment",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'title';
        const isExam = record.type === 'exam' || record.examType;
        return isEditing ? (
          <Input
            defaultValue={text}
            onPressEnter={(e: any) => handleUpdateHomeworkField(record.id, 'title', e.target.value)}
            onBlur={() => setEditingHomework(null)}
            autoFocus
            style={{ borderRadius: 8 }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag 
              color={isExam ? 'purple' : 'blue'}
              style={{ fontSize: '10px' }}
            >
              {isExam ? 'Exam' : 'HW'}
            </Tag>
            <button
              type="button"
              style={{ 
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'bold',
                color: 'inherit',
                outline: 'none'
              }}
              onClick={() => {
                setEditingHomework(record.id);
                setEditingField('title');
              }}
              aria-label={`Edit title for ${text}`}
            >
              {text}
            </button>
          </div>
        );
      },
    },
    {
      title: "Course",
      dataIndex: ["course", "name"],
      key: "course",
      render: (text: string, record: any) => {
        const isEditing = editingHomework === record.id && editingField === 'courseId';
        const course = courses.find(c => c.id === record.courseId);
        const courseColor = course?.color || '#1976d2';
        const bgColor = `${courseColor}15`; // 15% opacity
        
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
          <button
            type="button"
            style={{ 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '16px',
              backgroundColor: bgColor,
              border: `2px solid ${courseColor}`,
              color: courseColor,
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: 'none',
              outline: 'none'
            }}
            onClick={() => {
              setEditingHomework(record.id);
              setEditingField('courseId');
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label={`Edit course for ${text}`}
          >
            {text}
          </button>
        );
      },
    },
    {
      title: "Due Date/Time",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string, record: any) => {
        const isExam = record.type === 'exam' || record.examType;
        const fieldName = isExam ? 'examDate' : 'dueDate';
        const isEditing = editingHomework === record.id && editingField === fieldName;
        const editValue = editValues[record.id] ?? (date ? new Date(date).toISOString().slice(0, 16) : '');
        
        return isEditing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              type="datetime-local"
              value={editValue}
              onChange={(e) => setEditValue(record.id, e.target.value)}
              onPressEnter={() => {
                if (editValue) {
                  handleUpdateHomeworkField(record.id, fieldName, editValue);
                }
              }}
              autoFocus
              style={{ borderRadius: 8 }}
            />
            <Button
              size="small"
              type="primary"
              onClick={() => {
                if (editValue) {
                  handleUpdateHomeworkField(record.id, fieldName, editValue);
                }
              }}
              disabled={!editValue}
              style={{ 
                borderRadius: 8,
                background: '#1976d2',
                borderColor: '#1976d2',
                fontSize: 12,
                height: 32
              }}
            >
              Save
            </Button>
            <Button
              size="small"
              onClick={() => {
                setEditingHomework(null);
                setEditValue(record.id, date ? new Date(date).toISOString().slice(0, 16) : '');
              }}
              style={{ 
                borderRadius: 8,
                fontSize: 12,
                height: 32
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            style={{ 
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'inherit',
              outline: 'none'
            }}
            onClick={() => {
              setEditingHomework(record.id);
              setEditingField(fieldName);
            }}
            aria-label={`Edit ${isExam ? 'exam date' : 'due date'} for ${new Date(date).toLocaleString()}`}
          >
            {new Date(date).toLocaleString()}
          </button>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "PENDING",
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: getStatusColor("PENDING"),
                      boxShadow: `0 2px 4px ${getStatusColor("PENDING")}40`,
                      transition: 'all 0.2s ease'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Pending</span>
                  </div>
                ),
                onClick: () => {
                  handleUpdateHomeworkField(record.id, 'status', 'PENDING');
                }
              },
              {
                key: "IN_PROGRESS",
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: getStatusColor("IN_PROGRESS"),
                      boxShadow: `0 2px 4px ${getStatusColor("IN_PROGRESS")}40`,
                      transition: 'all 0.2s ease'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>In Progress</span>
                  </div>
                ),
                onClick: () => {
                  handleUpdateHomeworkField(record.id, 'status', 'IN_PROGRESS');
                }
              },
              {
                key: "COMPLETED",
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: getStatusColor("COMPLETED"),
                      boxShadow: `0 2px 4px ${getStatusColor("COMPLETED")}40`,
                      transition: 'all 0.2s ease'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Completed</span>
                  </div>
                ),
                onClick: () => {
                  handleUpdateHomeworkField(record.id, 'status', 'COMPLETED');
                }
              },
              {
                key: "OVERDUE",
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      backgroundColor: getStatusColor("OVERDUE"),
                      boxShadow: `0 2px 4px ${getStatusColor("OVERDUE")}40`,
                      transition: 'all 0.2s ease'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Overdue</span>
                  </div>
                ),
                onClick: () => {
                  handleUpdateHomeworkField(record.id, 'status', 'OVERDUE');
                }
              }
            ]
          }}
          trigger={["click"]}
        >
          <button
            type="button"
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: getStatusColor(status),
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              textAlign: 'center',
              minWidth: '80px',
              boxShadow: `0 2px 8px ${getStatusColor(status)}40`,
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: status === 'COMPLETED' ? 'celebrate 0.6s ease-in-out' : 'none',
              transform: status === 'COMPLETED' ? 'scale(1.05)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${getStatusColor(status)}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = status === 'COMPLETED' ? 'scale(1.05)' : 'scale(1)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${getStatusColor(status)}40`;
            }}
            aria-label={`Change status from ${getStatusDisplayText(status)}`}
          >
            {getStatusDisplayText(status)}
          </button>
        </Dropdown>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button 
            size="small" 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            style={{ padding: 4 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={homeworks}
      loading={loading}
      rowKey="id"
      pagination={false}
      style={{ marginTop: 0 }}
    />
  );
};
