import React, { useState, useEffect } from 'react';
import { Tag, Layout, Button, Space, Modal, InputNumber, Radio, Menu, Checkbox } from 'antd';
import { useNavigate, Link } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GenerateExamPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [singleChoiceCount, setSingleChoiceCount] = useState(200);
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(20);
  const [language, setLanguage] = useState('cn');
  const [autoNext, setAutoNext] = useState(false);

  const fetchQuestions = async () => {
    const response = await fetch(`${API_BASE_URL}/generate_exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        types: [1, 2],
        count_per_type: [singleChoiceCount, multipleChoiceCount],
      }),
    });
    const data = await response.json();
    localStorage.setItem('examQuestions', JSON.stringify(data));
    setQuestions(data);
  };

  const handleModalOk = async () => {
    localStorage.removeItem('examQuestions');
    localStorage.removeItem('examAnswers');
    await fetchQuestions();
    setIsModalVisible(false);
  };

  const handleAnswer = (questionId, answerId) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);
    localStorage.setItem('examAnswers', JSON.stringify(newAnswers));

    const current = questions[currentQuestionIndex];
    if (
      autoNext &&
      current?.type === 1 &&
      currentQuestionIndex < questions.length - 1
    ) {
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
    }
  };

  const arraysEqualIgnoreOrder = (a, b) =>
    Array.isArray(a) && Array.isArray(b) &&
    a.length === b.length &&
    a.every(id => b.includes(id));

  const handleSubmit = () => {
    const confirmSubmission = window.confirm('您确认要提交考试吗？');
    if (!confirmSubmission) return;

    const storedQuestions = JSON.parse(localStorage.getItem('examQuestions') || '[]');
    const results = storedQuestions.map((question) => {
      const correctAnswerIds = question.answers.filter(a => a.is_correct).map(a => a.id);
      const yourAnswer = answers[question.id];
      const isCorrect = question.type === 1
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
    if (language === 'cn') return <h2>{`${index + 1}. ${question.question_cn}`}</h2>;
    if (language === 'en') return <h2>{`${index + 1}. ${question.question_en}`}</h2>;
    return (
      <>
        <h2>{`${index + 1}. ${question.question_cn}`}</h2>
        <h2 style={{ color: '#888' }}>{`${index + 1}. ${question.question_en}`}</h2>
      </>
    );
  };

  const renderAnswerWithIndex = (answer, index) => {
    const options = ['A', 'B', 'C', 'D', 'E'];
    if (language === 'cn') return `${options[index]}. ${answer.content_cn}`;
    if (language === 'en') return `${options[index]}. ${answer.content_en}`;
    return `${options[index]}. ${answer.content_cn} / ${answer.content_en}`;
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
              <Link to="/generate-exam">答题</Link>
            </Menu.Item>
          </Menu>
          <Button type="primary" onClick={handleSubmit} style={{ margin: '10px 0', width: '100%' }}>
            提交
          </Button>
          {Array.isArray(questions) && questions.length > 0 && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, 30px)',
                  gap: '6px',
                  marginTop: '20px',
                  justifyContent: 'center'
                }}
              >
                {questions.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor:
                        index === currentQuestionIndex
                          ? '#1890ff'
                          : answers[item.id]
                          ? '#4caf50'
                          : '#d3d3d3',
                      fontWeight: index === currentQuestionIndex ? 'bold' : 'normal',
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
              <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px', width: '100%' }}>
                提交
              </Button>
            </>
          )}
        </Sider>

        <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
          <Modal
            title="选择题目数量"
            open={isModalVisible}
            onOk={handleModalOk}
            okText="重新答题"
            cancelText="继续答题"
            onCancel={() => {
              const cached = JSON.parse(localStorage.getItem('examQuestions') || '[]');
              const cachedAnswers = JSON.parse(localStorage.getItem('examAnswers') || '{}');
              if (Array.isArray(cached) && cached.length > 0) {
                setQuestions(cached);
                setAnswers(cachedAnswers);
                setIsModalVisible(false);
              } else {
                alert('暂无缓存的题目，请重新答题');
              }
            }}
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

          {!isModalVisible && Array.isArray(questions) && questions.length > 0 && (
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
              <div>
                <Checkbox
                  checked={autoNext}
                  onChange={(e) => setAutoNext(e.target.checked)}
                  style={{ marginBottom: '20px' }}
                >
                  自动跳转到下一题（仅单选题）
                </Checkbox>
              </div>

              <div style={{ marginBottom: '10px' }}>
                {questions[currentQuestionIndex]?.type === 1 && <Tag color='blue'>单选题</Tag>}
                {questions[currentQuestionIndex]?.type === 2 && <Tag color='orange'>多选题</Tag>}
              </div>

              {renderQuestionWithIndex(questions[currentQuestionIndex], currentQuestionIndex)}

              {questions[currentQuestionIndex]?.type === 2 && (
                <div style={{ color: 'orange', marginBottom: '10px' }}>可以多选</div>
              )}

              <Space direction="vertical">
                {questions[currentQuestionIndex]?.answers.map((answer, answerIndex) => {
                  const qid = questions[currentQuestionIndex].id;
                  if (questions[currentQuestionIndex].type === 2) {
                    const selected = answers[qid]?.includes(answer.id);
                    return (
                      <Button
                        key={answer.id}
                        type={selected ? 'primary' : 'default'}
                        onClick={() => {
                          const currentAnswers = answers[qid] || [];
                          const updated = currentAnswers.includes(answer.id)
                            ? currentAnswers.filter(id => id !== answer.id)
                            : [...currentAnswers, answer.id];
                          const newAnswers = { ...answers, [qid]: updated };
                          setAnswers(newAnswers);
                          localStorage.setItem('examAnswers', JSON.stringify(newAnswers));
                        }}
                        style={{ fontSize: '16px', padding: '10px 20px' }}
                      >
                        {renderAnswerWithIndex(answer, answerIndex)}
                      </Button>
                    );
                  } else {
                    return (
                      <Button
                        key={answer.id}
                        type={answers[qid] === answer.id ? 'primary' : 'default'}
                        onClick={() => handleAnswer(qid, answer.id)}
                        style={{ fontSize: '16px', padding: '10px 20px' }}
                      >
                        {renderAnswerWithIndex(answer, answerIndex)}
                      </Button>
                    );
                  }
                })}
              </Space>

              <div style={{ marginTop: '20px' }}>
                <Button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  style={{ marginRight: '10px' }}
                >上一题</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    if (currentQuestionIndex === questions.length - 1) {
                      handleSubmit();
                    } else {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    }
                  }}
                >
                  {currentQuestionIndex === questions.length - 1 ? '提交' : '下一题'}
                </Button>
              </div>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default GenerateExamPage;
