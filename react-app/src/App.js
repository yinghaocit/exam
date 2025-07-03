import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, Menu, Card, Button, Row, Col } from 'antd';
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
    <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card title="欢迎使用考试系统" style={{ width: 400, textAlign: 'center' }}>
        <Row gutter={16} justify="center">
          <Col>
            <Button type="default" href="/create-question">
              录入考题
            </Button>
          </Col>
          <Col>
            <Button type="primary" href="/generate-exam">
              出题
            </Button>
          </Col>
        </Row>
        <div style={{ marginTop: 24, textAlign: 'left' }}>
          <p><strong>缺失题</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <li><a href="/AIF-C01.pdf#page=42" target="_blank" rel="noopener noreferrer">[跳转] 第 114 题</a></li>
            <li><a href="/AIF-C01.pdf#page=48" target="_blank" rel="noopener noreferrer">[跳转] 第 125 题</a></li>
            <li><a href="/AIF-C01.pdf#page=52" target="_blank" rel="noopener noreferrer">[跳转] 第 135 题</a></li>
            <li><a href="/AIF-C01.pdf#page=56" target="_blank" rel="noopener noreferrer">[跳转] 第 143 题</a></li>
            <li><a href="/AIF-C01.pdf#page=57" target="_blank" rel="noopener noreferrer">[跳转] 第 144 题</a></li>
            <li><a href="/AIF-C01.pdf#page=63" target="_blank" rel="noopener noreferrer">[跳转] 第 155 题</a></li>
            <li><a href="/AIF-C01.pdf#page=73" target="_blank" rel="noopener noreferrer">[跳转] 第 185 题</a></li>
            <li><a href="/AIF-C01.pdf#page=75" target="_blank" rel="noopener noreferrer">[跳转] 第 188 题</a></li>
            <li><a href="/AIF-C01.pdf#page=77" target="_blank" rel="noopener noreferrer">[跳转] 第 191 题</a></li>
          </ul>
        </div>
      </Card>
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
