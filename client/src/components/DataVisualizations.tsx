import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DataVisualizationsProps {
  homeworks: any[];
  courses: any[];
}

const DataVisualizations: React.FC<DataVisualizationsProps> = ({ homeworks, courses }) => {
  // Calculate statistics
  const totalHomeworks = homeworks.length;
  const completedHomeworks = homeworks.filter(hw => hw.status === 'COMPLETED').length;
  const pendingHomeworks = homeworks.filter(hw => hw.status === 'PENDING').length;
  const inProgressHomeworks = homeworks.filter(hw => hw.status === 'IN_PROGRESS').length;
  const overdueHomeworks = homeworks.filter(hw => hw.status === 'OVERDUE').length;
  const completionRate = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;

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

      {/* Charts Row */}
      <Row gutter={[24, 24]}>
        {/* Status Distribution Pie Chart */}
        <Col xs={24} lg={12}>
          <Card
            title="Homework Status Distribution"
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <ReactApexChart
              options={pieChartOptions}
              series={statusData.map(item => item.value)}
              type="pie"
              height={300}
            />
          </Card>
        </Col>

        {/* Course-wise Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title="Homework Distribution by Course"
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <ReactApexChart
              options={barChartOptions}
              series={[
                {
                  name: 'Completed',
                  data: courseData.map(course => course.completed)
                },
                {
                  name: 'In Progress',
                  data: courseData.map(course => course.inProgress)
                },
                {
                  name: 'Pending',
                  data: courseData.map(course => course.pending)
                },
                {
                  name: 'Overdue',
                  data: courseData.map(course => course.overdue)
                }
              ]}
              type="bar"
              height={300}
            />
          </Card>
        </Col>

        {/* Monthly Progress Line Chart */}
        <Col xs={24}>
          <Card
            title="Monthly Homework Progress"
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <ReactApexChart
              options={lineChartOptions}
              series={[
                {
                  name: 'Total Homeworks',
                  data: getMonthlyData().map(item => item.total)
                },
                {
                  name: 'Completed',
                  data: getMonthlyData().map(item => item.completed)
                }
              ]}
              type="line"
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Completion Rate */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Overall Completion Rate"
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Statistic
                title="Completion Rate"
                value={completionRate}
                suffix="%"
                valueStyle={{ 
                  color: getCompletionRateColor(completionRate),
                  fontSize: '48px',
                  fontWeight: 'bold'
                }}
              />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {completedHomeworks} out of {totalHomeworks} homeworks completed
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataVisualizations; 