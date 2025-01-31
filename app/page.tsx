"use client";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";
import HomeContent from "../components/HomeContent";
import { Layout } from "antd";

const { Content } = Layout;

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
        {isAuthenticated ? <HomeContent /> : <LoginForm />}
      </Content>
    </Layout>
  );
}
