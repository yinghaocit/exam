import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import 'antd/dist/reset.css';
import CreateQuestionPage from './CreateQuestionPage';
import GenerateExamPage from './GenerateExamPage';
 import ExamResultPage from './ExamResultPage';

const { Header, Content, Footer } = Layout;

const WelcomePage = () => (
  <Layout>
    <Header style={{ backgroundColor: '#001529' }}>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['welcome']}>
        <Menu.Item key="welcome">欢迎页面</Menu.Item>
      </Menu>
    </Header>
    <Content style={{ padding: '50px', textAlign: 'center' }}>
      <h1>欢迎使用考试系统</h1>
      <p>请选择功能</p>
      <div>
        <p>
          <a href="/create-question" style={{ marginRight: '20px' }}>录入考题</a>
          <a href="/generate-exam">出题</a>
        </p>
      </div>
    </Content>
    <Footer style={{ textAlign: 'center' }}>考试系统 ©2025</Footer>
  </Layout>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create-question" element={<CreateQuestionPage />} />
      <Route path="/generate-exam" element={<GenerateExamPage />} />
       <Route path="/exam-result" element={<ExamResultPage />} />
    </Routes>
  </Router>
);

export default App;
