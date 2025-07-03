import React, { useState } from 'react';
import { Layout, Menu, Form, Input, Button, Space, Checkbox } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CreateQuestionPage = () => {
  const [answers, setAnswers] = useState([{ content: '', isCorrect: false }]);
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');

  const addAnswer = () => {
    setAnswers([...answers, { content: '', isCorrect: false }]);
  };

  const updateAnswer = (index, key, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index][key] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    if (!question || !explanation) {
      alert('请填写完整的题目和解释字段');
      return;
    }

    const correctAnswersCount = answers.filter(answer => answer.isCorrect).length;
    if (correctAnswersCount === 0) {
      alert('必须选择至少一个正确答案');
      return;
    }

    const payload = {
      type: correctAnswersCount === 1 ? 1 : 2,
      question,
      explanation,
      answers: answers.map(answer => ({
        content: answer.content,
        is_correct: answer.isCorrect
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`题目创建成功，ID: ${result.id}`);
      } else {
        alert('题目创建失败，请检查输入内容');
      }
    } catch (error) {
      alert('网络错误，请稍后重试');
    }
  };

  return (
    <Layout style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Header style={{ backgroundColor: '#001529' }}>
        <div style={{ color: '#fff', textAlign: 'center', fontSize: '20px' }}>考试系统</div>
      </Header>
      <Layout>
        <Sider width={250} style={{ background: '#fff', padding: '10px', borderRight: '1px solid #ddd' }}>
          <Menu mode="vertical" defaultSelectedKeys={['create-question']}>
            <Menu.Item key="create-question">
              <Link to="/create-question">录入考题</Link>
            </Menu.Item>
            <Menu.Item key="generate-exam">
              <Link to="/generate-exam">答题</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
          <Form layout="vertical">
            <Form.Item label="题目" name="question" rules={[{ required: true, message: '请输入题目' }]}>
              <Input.TextArea
                placeholder="请输入题目"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="解释" name="explanation">
              <Input.TextArea
                placeholder="请输入解释"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="答案" name="answers">
              {answers.map((answer, index) => (
                <Space key={index} direction="horizontal" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                  <Input
                    placeholder="答案内容"
                    value={answer.content}
                    onChange={(e) => updateAnswer(index, 'content', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Checkbox
                    checked={answer.isCorrect}
                    onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                  >
                    正确
                  </Checkbox>
                  <Button type="link" danger onClick={() => setAnswers(answers.filter((_, i) => i !== index))}>删除</Button>
                </Space>
              ))}
              <Button type="dashed" onClick={addAnswer} style={{ marginTop: '10px', width: '100%' }}>添加答案</Button>
            </Form.Item>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>提交</Button>
          </Form>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CreateQuestionPage;
