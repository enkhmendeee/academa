import React from "react";
import { Button, Select, Typography } from "antd";
import { FilterOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

interface FilterControlsProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  courseFilter: string;
  setCourseFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "ascend" | "descend";
  setSortOrder: (order: "ascend" | "descend") => void;
  hideCompleted: boolean;
  handleHideCompletedChange: (value: boolean) => void;
  currentSemesterCourses: any[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  showFilters,
  setShowFilters,
  statusFilter,
  setStatusFilter,
  courseFilter,
  setCourseFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  hideCompleted,
  handleHideCompletedChange,
  currentSemesterCourses,
}) => {
  const clearFilters = () => {
    setStatusFilter("all");
    setCourseFilter("all");
    setSortBy("dueDate");
    setSortOrder("ascend");
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8,
        padding: '8px'
      }}>
        <Button
          type="text"
          icon={<FilterOutlined />}
          onClick={() => setShowFilters(!showFilters)}
          style={{ 
            color: '#1976d2',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters ? <UpOutlined /> : <DownOutlined />}
        </Button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Completed assignments:</Text>
          <Button
            type={hideCompleted ? 'primary' : 'default'}
            size="small"
            onClick={() => handleHideCompletedChange(!hideCompleted)}
            style={{ 
              fontSize: 11,
              height: 24,
              padding: '0 8px',
              borderRadius: 12,
              background: hideCompleted ? '#1976d2' : '#f0f0f0',
              borderColor: hideCompleted ? '#1976d2' : '#d9d9d9',
              color: hideCompleted ? 'white' : '#666'
            }}
          >
            {hideCompleted ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      {showFilters && (
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
              <Option value="COMPLETED" disabled={hideCompleted}>Completed</Option>
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
            onClick={clearFilters}
            style={{ color: '#666' }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
};
