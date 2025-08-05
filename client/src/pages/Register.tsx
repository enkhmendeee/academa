import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { register as registerService } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleRegister = async (values: { name: string; email: string; password: string; confirmPassword: string }) => {
    try {
      const { token, user } = await registerService(values.name, values.email, values.password, values.confirmPassword);
      login(token, user);
      message.success('Registration successful!');
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      message.error('Registration failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
      >
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: '#1976d2', marginBottom: '8px' }}>
              Create Account
            </Title>
            <Text type="secondary">Join us today</Text>
          </div>

          <Form
            form={form}
            onFinish={handleRegister}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your name!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#1976d2' }} />}
                placeholder="Full Name"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1976d2' }} />}
                placeholder="Email"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1976d2' }} />}
                placeholder="Password"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1976d2' }} />}
                placeholder="Confirm Password"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<UserAddOutlined />}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '8px',
                  background: '#1976d2',
                  borderColor: '#1976d2',
                  fontSize: '16px'
                }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text type="secondary">Already have an account? </Text>
            <Link to="/login" style={{ color: '#1976d2', fontWeight: '500' }}>
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
