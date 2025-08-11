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
  const inProgressHomeworks = homeworks.filter(hw => hw.status === 'IN_PROGRESS').length;
  const overdueHomeworks = homeworks.filter(hw => hw.status === 'OVERDUE').length;

  // Exam Statistics
  const totalExams = exams.length;
  const completedExams = exams.filter(exam => exam.status === 'COMPLETED').length;
  const upcomingExams = exams.filter(exam => new Date(exam.examDate) > new Date()).length;
  const averageExamGrade = exams.filter(exam => exam.grade !== null).length > 0
    ? exams.filter(exam => exam.grade !== null).reduce((sum, exam) => sum + exam.grade, 0) / exams.filter(exam => exam.grade !== null).length
    : 0;

  return (
    <div style={{ padding: '8px 0' }}>
      <Title level={3} style={{ color: '#1976d2', marginBottom: 16, textAlign: 'center' }}>
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



      {/* Charts Row */}
      <Row gutter={[24, 24]}>
        {/* Upcoming Deadlines */}
        <Col xs={24} lg={12}>
          <Card
            title="Upcoming Deadlines"
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >

            {(() => {
              const processUpcomingDeadlines = () => {
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

                // Get course colors from actual course data
                const courseColors = Object.keys(deadlinesByCourse).map(courseName => {
                  const course = courses.find(c => c.name === courseName);
                  return course?.color || '#1976d2';
                });

                return { deadlinesByCourse, courseColors, allDeadlines };
              };

              const { deadlinesByCourse, courseColors, allDeadlines } = processUpcomingDeadlines();

              const renderCourseSection = (courseName: string, courseHomeworks: any[], index: number, courseColors: string[]) => {
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
                        {courseName} ({courseHomeworks.length} due)
                      </Text>
                    </div>
                    <div style={{ paddingLeft: 20 }}>
                      {renderCourseItems(courseHomeworks)}
                    </div>
                  </div>
                );
              };

              const renderCourseItems = (courseHomeworks: any[]) => {
                return (
                  <>
                    {courseHomeworks.slice(0, 3).map((item: any) => (
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
                    {courseHomeworks.length > 3 && (
                      <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
                        +{courseHomeworks.length - 3} more...
                      </Text>
                    )}
                  </>
                );
              };

              const renderUpcomingDeadlines = (deadlinesByCourse: Record<string, any[]>, courseColors: string[]) => {
                return (
                  <div>
                    {renderDeadlinesList(deadlinesByCourse, courseColors)}
                    {renderDeadlinesFooter()}
                  </div>
                );
              };

              const renderDeadlinesList = (deadlinesByCourse: Record<string, any[]>, courseColors: string[]) => {
                return Object.entries(deadlinesByCourse).map(([courseName, courseHomeworks], index) => 
                  renderCourseSection(courseName, courseHomeworks, index, courseColors)
                );
              };

              const renderDeadlinesFooter = () => {
                return (
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
                );
              };

              return allDeadlines.length > 0 ? (
                renderUpcomingDeadlines(deadlinesByCourse, courseColors)
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

            {/* Exam Countdown */}
            {(() => {
              const getNextPendingExam = () => {
                const now = new Date();
                return exams
                  .filter(exam => exam.status === 'PENDING')
                  .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
                  .find(exam => new Date(exam.examDate) > now);
              };

              const calculateTimeRemaining = (examDate: string) => {
                const now = new Date();
                const exam = new Date(examDate);
                const diff = exam.getTime() - now.getTime();
                
                if (diff <= 0) return null;
                
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                
                return { days, hours, minutes };
              };

              const nextExam = getNextPendingExam();
              const timeRemaining = nextExam ? calculateTimeRemaining(nextExam.examDate) : null;
              const course = nextExam ? courses.find(c => c.id === nextExam.courseId) : null;

              return (
                <div style={{ 
                  marginTop: 20, 
                  padding: '16px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 8,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 12 
                  }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: '#9c27b0',
                      marginRight: 8
                    }} />
                    <Text strong style={{ fontSize: 16, color: '#9c27b0' }}>
                      Next Exam Countdown
                    </Text>
                  </div>
                  
                  {nextExam && timeRemaining ? (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14, color: '#333' }}>
                          {nextExam.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          {course?.name}
                        </Text>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: 12, 
                        justifyContent: 'center',
                        marginBottom: 8
                      }}>
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '8px 12px',
                          backgroundColor: '#9c27b0',
                          color: 'white',
                          borderRadius: 6,
                          minWidth: '60px'
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                            {timeRemaining.days}
                          </div>
                          <div style={{ fontSize: 10 }}>Days</div>
                        </div>
                        
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '8px 12px',
                          backgroundColor: '#9c27b0',
                          color: 'white',
                          borderRadius: 6,
                          minWidth: '60px'
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                            {timeRemaining.hours}
                          </div>
                          <div style={{ fontSize: 10 }}>Hours</div>
                        </div>
                        
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '8px 12px',
                          backgroundColor: '#9c27b0',
                          color: 'white',
                          borderRadius: 6,
                          minWidth: '60px'
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                            {timeRemaining.minutes}
                          </div>
                          <div style={{ fontSize: 10 }}>Minutes</div>
                        </div>
                      </div>
                      
                      <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
                        {new Date(nextExam.examDate).toLocaleString()}
                      </Text>
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px 0',
                      color: '#666'
                    }}>
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        No pending exams found
                      </Text>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        All exams are completed or no exams scheduled
                      </div>
                    </div>
                  )}
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
              // Helper functions
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

              const getStatusColor = (status: string) => {
                switch (status) {
                  case "COMPLETED": return "#43a047";
                  case "IN_PROGRESS": return "#ffa726";
                  case "OVERDUE": return "#e53935";
                  case "PENDING": return "#1976d2";
                  default: return "#1976d2";
                }
              };

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

              const renderHomeworkItems = (homeworks: any[]) => {
                return homeworks.map(hw => {
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
                });
              };

              const renderExamItems = (exams: any[]) => {
                return exams.map(exam => {
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
                        backgroundColor: course?.color || '#9c27b0'
                      }} />
                    </div>
                  );
                });
              };

              const renderSelectedDateDetails = (selectedDate: Date) => {
                const selectedHomeworks = getHomeworksForDate(selectedDate);
                const selectedExams = getExamsForDate(selectedDate);
                const totalItems = selectedHomeworks.length + selectedExams.length;
                
                if (totalItems > 0) {
                  return (
                    <div style={{ marginTop: 8 }}>
                      {/* Homeworks */}
                      {renderHomeworkItems(selectedHomeworks)}
                      {/* Exams */}
                      {renderExamItems(selectedExams)}
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
              };

              const renderDayIndicators = (day: Date, dayHomeworks: any[]) => {
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
                      {dayHomeworks.slice(0, 2).map((hw) => (
                        <div
                          key={`hw-${hw.id}`}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(hw.status)
                          }}
                        />
                      ))}
                      {/* Exam indicators */}
                      {dayExams.slice(0, 2).map((exam) => {
                        const course = courses.find(c => c.id === exam.courseId);
                        return (
                          <div
                            key={`exam-${exam.id}`}
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: course?.color || '#9c27b0'
                            }}
                          />
                        );
                      })}
                      {totalItems > 4 && (
                        <Text style={{ fontSize: 8, color: '#999' }}>
                          +{totalItems - 4}
                        </Text>
                      )}
                    </div>
                  );
                }
                return null;
              };

              const renderCalendarDay = (day: Date) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const dayHomeworks = getHomeworksForDate(day);
                const dayExams = getExamsForDate(day);
                const hasAssignments = dayHomeworks.length > 0 || dayExams.length > 0;
                const hasExams = dayExams.length > 0;
                const hasOnlyHomework = dayHomeworks.length > 0 && dayExams.length === 0;
                const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                
                let borderStyle = '1px solid #f0f0f0';
                if (isSelected) {
                  borderStyle = '2px solid #1976d2';
                } else if (isToday) {
                  borderStyle = '2px solid #43a047';
                } else if (hasExams) {
                  borderStyle = '2px solid #9c27b0';
                } else if (hasOnlyHomework) {
                  borderStyle = '2px solid #ffa726';
                }
                
                let backgroundColor = 'white';
                if (isSelected) {
                  backgroundColor = '#f0f8ff';
                } else if (isToday) {
                  backgroundColor = '#e8f5e8';
                } else if (hasExams) {
                  backgroundColor = '#f3e5f5';
                } else if (hasOnlyHomework) {
                  backgroundColor = '#fff3e0';
                }
                
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    style={{
                      aspectRatio: '1',
                      border: borderStyle,
                      borderRadius: '8px',
                      padding: '4px',
                      cursor: 'pointer',
                      backgroundColor: backgroundColor,
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
                    {(() => {
                      let textColor = '#ccc';
                      if (isCurrentMonth) {
                        textColor = isToday ? '#43a047' : '#333';
                      }
                      
                      return (
                        <Text style={{ 
                          fontSize: 12, 
                          color: textColor,
                          fontWeight: (isSelected || isToday) ? 'bold' : 'normal'
                        }}>
                          {day.getDate()}
                        </Text>
                      );
                                        })()}
                    
                    {/* Assignment count indicator */}
                    {hasAssignments && (
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        backgroundColor: hasExams ? '#9c27b0' : '#ffa726',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {dayHomeworks.length + dayExams.length}
                      </div>
                    )}
                  </button>
                );
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
                    {calendarDays.map(renderCalendarDay)}
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
                      {renderSelectedDateDetails(selectedDate)}
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