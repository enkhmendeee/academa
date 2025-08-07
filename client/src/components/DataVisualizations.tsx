import React, { useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Button, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DataVisualizationsProps {
  homeworks: any[];
  courses: any[];
  exams?: any[];
}

const DataVisualizations: React.FC<DataVisualizationsProps> = ({ homeworks, courses, exams = [] }) => {
  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate statistics
  const totalHomeworks = homeworks.length;
  const completedHomeworks = homeworks.filter(hw => hw.status === 'COMPLETED').length;
  const pendingHomeworks = homeworks.filter(hw => hw.status === 'PENDING').length;
  const inProgressHomeworks = homeworks.filter(hw => hw.status === 'IN_PROGRESS').length;
  const overdueHomeworks = homeworks.filter(hw => hw.status === 'OVERDUE').length;
  const completionRate = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;

  // Exam Statistics
  const totalExams = exams.length;
  const completedExams = exams.filter(exam => exam.status === 'COMPLETED').length;
  const pendingExams = exams.filter(exam => exam.status === 'PENDING').length;
  const inProgressExams = exams.filter(exam => exam.status === 'IN_PROGRESS').length;
  const overdueExams = exams.filter(exam => exam.status === 'OVERDUE').length;
  const upcomingExams = exams.filter(exam => new Date(exam.examDate) > new Date()).length;
  const averageExamGrade = exams.filter(exam => exam.grade !== null).length > 0
    ? exams.filter(exam => exam.grade !== null).reduce((sum, exam) => sum + exam.grade, 0) / exams.filter(exam => exam.grade !== null).length
    : 0;

  // Get completion rate color
  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return '#43a047';
    if (rate >= 60) return '#ffa726';
    return '#e53935';
  };

  // Status distribution for pie chart
  const statusData = [
    { name: 'Completed', value: completedHomeworks, color: '#43a047' },
    { name: 'In Progress', value: inProgressHomeworks, color: '#ffa726' },
    { name: 'Pending', value: pendingHomeworks, color: '#1976d2' },
    { name: 'Overdue', value: overdueHomeworks, color: '#e53935' }
  ];

  // Course-wise homework distribution
  const courseData = courses.map(course => {
    const courseHomeworks = homeworks.filter(hw => hw.courseId === course.id);
    return {
      name: course.name,
      total: courseHomeworks.length,
      completed: courseHomeworks.filter(hw => hw.status === 'COMPLETED').length,
      pending: courseHomeworks.filter(hw => hw.status === 'PENDING').length,
      inProgress: courseHomeworks.filter(hw => hw.status === 'IN_PROGRESS').length,
      overdue: courseHomeworks.filter(hw => hw.status === 'OVERDUE').length
    };
  }).filter(course => course.total > 0);

  // Monthly progress data
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = months.indexOf(month);
      const monthHomeworks = homeworks.filter(hw => {
        const hwDate = new Date(hw.dueDate);
        return hwDate.getFullYear() === currentYear && hwDate.getMonth() === monthIndex;
      });
      
      return {
        month,
        total: monthHomeworks.length,
        completed: monthHomeworks.filter(hw => hw.status === 'COMPLETED').length
      };
    });
  };

  // Pie Chart Options
  const pieChartOptions = {
    chart: {
      type: 'pie' as const,
      toolbar: {
        show: false
      }
    },
    labels: statusData.map(item => item.name),
    colors: statusData.map(item => item.color),
    legend: {
      position: 'bottom' as const,
      fontSize: '12px'
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: any, opts: any) {
        return opts.w.globals.seriesTotals[opts.seriesIndex] > 0 ? val.toFixed(1) + '%' : '';
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    }
  };

  // Bar Chart Options for Course Distribution
  const barChartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: courseData.map(course => course.name),
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Homeworks'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function(val: any) {
          return val + " homeworks"
        }
      }
    },
    legend: {
      position: 'top' as const
    }
  };

  // Line Chart Options for Monthly Progress
  const lineChartOptions = {
    chart: {
      type: 'line' as const,
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    xaxis: {
      categories: getMonthlyData().map(item => item.month),
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Homeworks'
      }
    },
    colors: ['#1976d2', '#43a047'],
    legend: {
      position: 'top' as const
    },
    tooltip: {
      y: {
        formatter: function(val: any) {
          return val + " homeworks"
        }
      }
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={3} style={{ color: '#1976d2', marginBottom: 24, textAlign: 'center' }}>
        Academic Analytics Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Total Homeworks"
              value={totalHomeworks}
              prefix={<BookOutlined style={{ color: '#1976d2' }} />}
              valueStyle={{ color: '#1976d2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Completed"
              value={completedHomeworks}
              prefix={<CheckCircleOutlined style={{ color: '#43a047' }} />}
              valueStyle={{ color: '#43a047' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="In Progress"
              value={inProgressHomeworks}
              prefix={<ClockCircleOutlined style={{ color: '#ffa726' }} />}
              valueStyle={{ color: '#ffa726' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Overdue"
              value={overdueHomeworks}
              prefix={<ExclamationCircleOutlined style={{ color: '#e53935' }} />}
              valueStyle={{ color: '#e53935' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Exam Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Total Exams"
              value={totalExams}
              prefix={<BookOutlined style={{ color: '#9c27b0' }} />}
              valueStyle={{ color: '#9c27b0' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Completed Exams"
              value={completedExams}
              prefix={<CheckCircleOutlined style={{ color: '#43a047' }} />}
              valueStyle={{ color: '#43a047' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Upcoming Exams"
              value={upcomingExams}
              prefix={<ClockCircleOutlined style={{ color: '#ffa726' }} />}
              valueStyle={{ color: '#ffa726' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Average Grade"
              value={averageExamGrade.toFixed(1)}
              suffix="%"
              prefix={<BookOutlined style={{ color: '#1976d2' }} />}
              valueStyle={{ color: '#1976d2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]}>
        {/* Upcoming Deadlines */}
        <Col xs={24} lg={12}>
          <Card
            title="Upcoming Deadlines"
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {(() => {
              // Get upcoming deadlines (next 30 days)
              const now = new Date();
              const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              
              const upcomingHomeworks = homeworks.filter(hw => {
                const dueDate = new Date(hw.dueDate);
                return dueDate >= now && dueDate <= thirtyDaysFromNow;
              }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

              const upcomingExams = exams.filter(exam => {
                const examDate = new Date(exam.examDate);
                return examDate >= now && examDate <= thirtyDaysFromNow;
              }).sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

              // Combine and group by course
              const allDeadlines = [
                ...upcomingHomeworks.map(hw => ({ ...hw, type: 'homework', date: hw.dueDate })),
                ...upcomingExams.map(exam => ({ ...exam, type: 'exam', date: exam.examDate }))
              ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              const deadlinesByCourse = allDeadlines.reduce((acc, item) => {
                const course = courses.find(c => c.id === item.courseId);
                const courseName = course?.name || 'Unknown Course';
                
                if (!acc[courseName]) {
                  acc[courseName] = [];
                }
                acc[courseName].push(item);
                return acc;
              }, {} as Record<string, any[]>);

              // Course colors for consistent coloring
              const courseColors = [
                '#1976d2', '#43a047', '#ff9800', '#e91e63',
                '#9c27b0', '#00bcd4', '#ff5722', '#4caf50'
              ];

              return allDeadlines.length > 0 ? (
                <div>
                  {Object.entries(deadlinesByCourse).map(([courseName, courseHomeworks], index) => {
                    const typedCourseHomeworks = courseHomeworks as any[];
                    return (
                      <div key={courseName} style={{ marginBottom: 16 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: 8,
                          padding: '8px 12px',
                          backgroundColor: `${courseColors[index % courseColors.length]}15`,
                          borderRadius: 8,
                          border: `2px solid ${courseColors[index % courseColors.length]}`
                        }}>
                          <div style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: courseColors[index % courseColors.length],
                            marginRight: 8
                          }} />
                          <Text strong style={{ 
                            color: courseColors[index % courseColors.length],
                            fontSize: 14
                          }}>
                            {courseName} ({typedCourseHomeworks.length} due)
                          </Text>
                        </div>
                        <div style={{ paddingLeft: 20 }}>
                          {typedCourseHomeworks.slice(0, 3).map((item: any) => (
                            <div key={item.id} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '4px 0',
                              borderBottom: '1px solid #f0f0f0'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12 }}>{item.title}</Text>
                                <Tag 
                                  color={item.type === 'exam' ? 'purple' : 'blue'}
                                  style={{ marginLeft: 8, fontSize: '10px' }}
                                >
                                  {item.type === 'exam' ? 'Exam' : 'HW'}
                                </Tag>
                              </div>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {new Date(item.date).toLocaleDateString()}
                              </Text>
                            </div>
                          ))}
                          {typedCourseHomeworks.length > 3 && (
                            <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
                              +{typedCourseHomeworks.length - 3} more...
                            </Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ 
                    marginTop: 16, 
                    padding: '12px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 8,
                    textAlign: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Showing deadlines for next 30 days
                    </Text>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  height: 200, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: '#999'
                }}>
                  <Text type="secondary">No upcoming homeworks or exams in the next 30 days.</Text>
                </div>
              );
            })()}
          </Card>
        </Col>

        {/* Monthly Calendar */}
        <Col xs={24} lg={12}>
          <Card
            title="Monthly Calendar"
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {(() => {
              // Get homeworks and exams for a specific date
              const getHomeworksForDate = (date: Date) => {
                return homeworks.filter(hw => {
                  const hwDate = new Date(hw.dueDate);
                  return hwDate.toDateString() === date.toDateString();
                });
              };

              const getExamsForDate = (date: Date) => {
                return exams.filter(exam => {
                  const examDate = new Date(exam.examDate);
                  return examDate.toDateString() === date.toDateString();
                });
              };

              // Get status color for a homework
              const getStatusColor = (status: string) => {
                switch (status) {
                  case "COMPLETED": return "#43a047";
                  case "IN_PROGRESS": return "#ffa726";
                  case "OVERDUE": return "#e53935";
                  case "PENDING": return "#1976d2";
                  default: return "#1976d2";
                }
              };

              // Generate calendar days
              const generateCalendarDays = () => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                
                const days = [];
                const currentDate = new Date(startDate);
                
                while (currentDate <= lastDay || currentDate.getDay() !== 0) {
                  days.push(new Date(currentDate));
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                
                return days;
              };

              const calendarDays = generateCalendarDays();
              const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

              return (
                <div>
                  {/* Calendar Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 16
                  }}>
                    <Button
                      type="text"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      style={{ color: '#1976d2' }}
                    >
                      ←
                    </Button>
                    <Text strong style={{ fontSize: 16 }}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <Button
                      type="text"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      style={{ color: '#1976d2' }}
                    >
                      →
                    </Button>
                  </div>

                  {/* Weekday Headers */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '4px',
                    marginBottom: 8
                  }}>
                    {weekdays.map(day => (
                      <div key={day} style={{ 
                        textAlign: 'center', 
                        padding: '8px',
                        fontWeight: 'bold',
                        fontSize: 12,
                        color: '#666'
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '4px'
                  }}>
                    {calendarDays.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                      const dayHomeworks = getHomeworksForDate(day);
                      const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                      const isToday = day.toDateString() === new Date().toDateString();
                      
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          style={{
                            aspectRatio: '1',
                            border: isSelected ? '2px solid #1976d2' : isToday ? '2px solid #43a047' : '1px solid #f0f0f0',
                            borderRadius: '8px',
                            padding: '4px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f0f8ff' : isToday ? '#e8f5e8' : 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            opacity: isCurrentMonth ? 1 : 0.5
                          }}
                        >
                          {isToday && (
                            <Text style={{ 
                              fontSize: 8, 
                              color: '#43a047',
                              fontWeight: 'bold',
                              marginBottom: '2px'
                            }}>
                              Today
                            </Text>
                          )}
                          <Text style={{ 
                            fontSize: 12, 
                            color: isCurrentMonth ? (isToday ? '#43a047' : '#333') : '#ccc',
                            fontWeight: (isSelected || isToday) ? 'bold' : 'normal'
                          }}>
                            {day.getDate()}
                          </Text>
                          
                          {/* Homework and Exam indicators */}
                          {(() => {
                            const dayExams = getExamsForDate(day);
                            const totalItems = dayHomeworks.length + dayExams.length;
                            
                            if (totalItems > 0) {
                              return (
                                <div style={{ 
                                  display: 'flex', 
                                  gap: '2px',
                                  marginTop: '2px'
                                }}>
                                  {/* Homework indicators */}
                                  {dayHomeworks.slice(0, 2).map((hw, hwIndex) => (
                                    <div
                                      key={`hw-${hwIndex}`}
                                      style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: getStatusColor(hw.status)
                                      }}
                                    />
                                  ))}
                                  {/* Exam indicators */}
                                  {dayExams.slice(0, 2).map((exam, examIndex) => (
                                    <div
                                      key={`exam-${examIndex}`}
                                      style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: '#9c27b0'
                                      }}
                                    />
                                  ))}
                                  {totalItems > 4 && (
                                    <Text style={{ fontSize: 8, color: '#999' }}>
                                      +{totalItems - 4}
                                    </Text>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Date Details */}
                  {selectedDate && (
                    <div style={{ 
                      marginTop: 16, 
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: 8,
                      border: '1px solid #e9ecef'
                    }}>
                      <Text strong style={{ fontSize: 14, color: '#1976d2' }}>
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                      {(() => {
                        const selectedHomeworks = getHomeworksForDate(selectedDate);
                        const selectedExams = getExamsForDate(selectedDate);
                        const totalItems = selectedHomeworks.length + selectedExams.length;
                        
                        if (totalItems > 0) {
                          return (
                            <div style={{ marginTop: 8 }}>
                              {/* Homeworks */}
                              {selectedHomeworks.map(hw => {
                                const course = courses.find(c => c.id === hw.courseId);
                                return (
                                  <div key={`hw-${hw.id}`} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 0',
                                    borderBottom: '1px solid #f0f0f0'
                                  }}>
                                    <div>
                                      <Text style={{ fontSize: 12 }}>{hw.title}</Text>
                                      <Tag color="blue" style={{ marginLeft: 4, fontSize: '10px' }}>HW</Tag>
                                      <br />
                                      <Text type="secondary" style={{ fontSize: 10 }}>
                                        {course?.name || 'Unknown Course'}
                                      </Text>
                                    </div>
                                    <div style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: getStatusColor(hw.status)
                                    }} />
                                  </div>
                                );
                              })}
                              {/* Exams */}
                              {selectedExams.map(exam => {
                                const course = courses.find(c => c.id === exam.courseId);
                                return (
                                  <div key={`exam-${exam.id}`} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 0',
                                    borderBottom: '1px solid #f0f0f0'
                                  }}>
                                    <div>
                                      <Text style={{ fontSize: 12 }}>{exam.title}</Text>
                                      <Tag color="purple" style={{ marginLeft: 4, fontSize: '10px' }}>Exam</Tag>
                                      <br />
                                      <Text type="secondary" style={{ fontSize: 10 }}>
                                        {course?.name || 'Unknown Course'}
                                      </Text>
                                    </div>
                                    <div style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: '#9c27b0'
                                    }} />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        } else {
                          return (
                            <div style={{ 
                              marginTop: 12, 
                              textAlign: 'center',
                              padding: '16px 8px'
                            }}>
                              <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px',
                                fontSize: 16,
                                color: '#999'
                              }}>
                                ✓
                              </div>
                              <Text type="secondary" style={{ 
                                fontSize: 12, 
                                color: '#666',
                                fontStyle: 'italic'
                              }}>
                                No items due on this date
                              </Text>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {/* Legend */}
                  <div style={{ 
                    marginTop: 16, 
                    display: 'flex', 
                    justifyContent: 'space-around',
                    fontSize: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#43a047' }} />
                      <Text type="secondary">Completed</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffa726' }} />
                      <Text type="secondary">In Progress</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#e53935' }} />
                      <Text type="secondary">Overdue</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1976d2' }} />
                      <Text type="secondary">Pending</Text>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default DataVisualizations; 