import React, { useState, useEffect } from 'react';
import { Tag, Layout, Button, Space, Modal, InputNumber, Radio, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const GenerateExamPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [singleChoiceCount, setSingleChoiceCount] = useState(0);
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(0);
  const [language, setLanguage] = useState('cn'); // 'cn', 'en', 'both'

  const fetchQuestions = async () => {
    const response = await fetch('http://localhost:8000/generate_exam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ types: [1, 2], count_per_type: [singleChoiceCount, multipleChoiceCount] })
    });
    const data = await response.json();
    localStorage.setItem('examQuestions', JSON.stringify(data));
    setQuestions(data);
  };

  const handleModalOk = async () => {
    setIsModalVisible(false);
    await fetchQuestions();
  };

  useEffect(() => {
    const storedQuestions = localStorage.getItem('examQuestions');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
  }, []);

  const handleAnswer = (questionId, answerId) => {
    setAnswers({ ...answers, [questionId]: answerId });
  };
  const arraysEqualIgnoreOrder = (a, b) =>
    Array.isArray(a) && Array.isArray(b) &&
    a.length === b.length &&
    a.every(id => b.includes(id));

  const handleSubmit = async () => {

    const confirmSubmission = window.confirm('您确认要提交考试吗？');
    if (!confirmSubmission) return;
    const storedQuestions = JSON.parse(localStorage.getItem('examQuestions'));
    const results = storedQuestions.map((question) => {
      const correctAnswerIds = question.answers
        .filter(answer => answer.is_correct)
        .map(answer => answer.id);
      const yourAnswer = answers[question.id];
      const isCorrect =
        question.type === 1
          ? correctAnswerIds[0] === yourAnswer
          : arraysEqualIgnoreOrder(correctAnswerIds, yourAnswer);
      return {
        questionNumber: question.id,
        correctAnswer: question.type === 1 ? correctAnswerIds[0] : correctAnswerIds,
        yourAnswer,
        result: isCorrect ? '正确' : '错误',
        question_cn: question.question_cn,
        question_en: question.question_en,
        questionText: question.questionText,
        type: question.type,
        answers: question.answers,
        explanation: question.explanation,
    };
    });

    navigate('/exam-result', { state: { results } });
  };

  const renderQuestionWithIndex = (question, index) => {
    if (language === 'cn') {
      return <h2 style={{ fontSize: '18px', color: '#333' }}>{`${index + 1}. ${question.question_cn}`}</h2>;
    } else if (language === 'en') {
      return <h2 style={{ fontSize: '18px', color: '#333' }}>{`${index + 1}. ${question.question_en}`}</h2>;
    } else {
      return (
        <div>
          <h2 style={{ fontSize: '18px', color: '#333' }}>{`${index + 1}. ${question.question_cn}`}</h2>
          <h2 style={{ fontSize: '18px', color: '#666' }}>{`${index + 1}. ${question.question_en}`}</h2>
        </div>
      );
    }
  };

  const renderAnswerWithIndex = (answer, index) => {
    const options = ['A', 'B', 'C', 'D', 'E'];
    if (language === 'cn') {
      return `${options[index]}. ${answer.content_cn}`;
    } else if (language === 'en') {
      return `${options[index]}. ${answer.content_en}`;
    } else {
      return `${options[index]}. ${answer.content_cn} / ${answer.content_en}`;
    }
  };

  return (
    <Layout style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f9f9f9' }}>
      <Header style={{ backgroundColor: '#001529' }}>
        <div style={{ color: '#fff', textAlign: 'center', fontSize: '20px' }}>考试系统</div>
      </Header>
      <Layout>
        <Sider width={250} style={{ background: '#fff', padding: '10px', borderRight: '1px solid #ddd' }}>
          <Menu mode="vertical" defaultSelectedKeys={['generate-exam']}>
            <Menu.Item key="create-question">
              <Link to="/create-question">录入考题</Link>
            </Menu.Item>
            <Menu.Item key="generate-exam">
              <Link to="/generate-exam">出题</Link>
            </Menu.Item>
          </Menu>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 50px)', gap: '10px', marginTop: '20px' }}>
            {questions.map((item, index) => (
              <div
                key={item.id}
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: answers[item.id] ? '#4caf50' : '#d3d3d3',
                  color: '#fff',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px', width: '100%' }}>提交</Button>
        </Sider>
        <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
          <Modal
            title="选择题目数量"
            visible={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
          >
            <div style={{ marginBottom: '10px' }}>
              <span>单选题数量: </span>
              <InputNumber min={0} value={singleChoiceCount} onChange={setSingleChoiceCount} />
            </div>
            <div>
              <span>多选题数量: </span>
              <InputNumber min={0} value={multipleChoiceCount} onChange={setMultipleChoiceCount} />
            </div>
          </Modal>
          {questions.length > 0 && (
            <div>
              <Radio.Group
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ marginBottom: '20px' }}
              >
                <Radio.Button value="cn">中文</Radio.Button>
                <Radio.Button value="en">英文</Radio.Button>
                <Radio.Button value="both">双语</Radio.Button>
              </Radio.Group>
              <div style={{ marginBottom: '10px' }}>
                {questions[currentQuestionIndex].type === 1 && <Tag color='blue'>单选题</Tag>}
                {questions[currentQuestionIndex].type === 2 && <Tag color='orange'>多选题</Tag>}
              </div>
              {renderQuestionWithIndex(questions[currentQuestionIndex], currentQuestionIndex)}
              {questions[currentQuestionIndex].type === 2 && <div style={{ color: 'orange', marginBottom: '10px' }}>可以多选</div>}

              <Space direction="vertical">
                {questions[currentQuestionIndex].type === 2 ? (
                  questions[currentQuestionIndex].answers.map((answer, answerIndex) => (
                    <Button
                      key={answer.id}
                      type={answers[questions[currentQuestionIndex].id]?.includes(answer.id) ? 'primary' : 'default'}
                      onClick={() => {
                        const updatedAnswers = { ...answers };
                        const currentAnswers = updatedAnswers[questions[currentQuestionIndex].id] || [];
                        if (currentAnswers.includes(answer.id)) {
                          updatedAnswers[questions[currentQuestionIndex].id] = currentAnswers.filter(id => id !== answer.id);
                        } else {
                          updatedAnswers[questions[currentQuestionIndex].id] = [...currentAnswers, answer.id];
                        }
                        setAnswers(updatedAnswers);
                      }}
                      style={{ fontSize: '16px', padding: '10px 20px' }}
                    >
                      {renderAnswerWithIndex(answer, answerIndex)}
                    </Button>
                  ))
                ) : (
                  questions[currentQuestionIndex].answers.map((answer, answerIndex) => (
                    <Button
                      key={answer.id}
                      type={answers[questions[currentQuestionIndex].id] === answer.id ? 'primary' : 'default'}
                      onClick={() => handleAnswer(questions[currentQuestionIndex].id, answer.id)}
                      style={{ fontSize: '16px', padding: '10px 20px' }}
                    >
                      {renderAnswerWithIndex(answer, answerIndex)}
                    </Button>
                  ))
                )}
              </Space>

              <div style={{ marginTop: '20px' }}>
                <Button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  style={{ marginRight: '10px' }}
                >上一题</Button>
                <Button
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >下一题</Button>
              </div>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default GenerateExamPage;
