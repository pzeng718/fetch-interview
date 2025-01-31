"use client";
import { useAuth } from "../context/AuthContext";
import { Form, Input, Button, Card, message } from "antd";

export default function LoginForm() {
  const { login } = useAuth();

  const onFinish = async (values: { name: string; email: string }) => {
    const success = await login(values.name, values.email);
    if (success) {
      message.success("Login successful!");
    } else {
      message.error("Login failed. Please try again.");
    }
  };

  return (
    <Card title="Login" style={{ width: 400, margin: "auto", marginTop: "50px" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter your name" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email" }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
