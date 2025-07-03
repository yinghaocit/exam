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
  const [isCorrectMap, setIsCorrectMap] = useState({});
  const [confirmedMap, setConfirmedMap] = useState({});
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
    localStorage.setItem('practiseQuestions', JSON.stringify(data));
    setQuestions(data);
  };

  const handleModalOk = async () => {
    localStorage.removeItem('practiseQuestions');
    localStorage.removeItem('practiseAnswers');
    await fetchQuestions();
    setIsModalVisible(false);
  };

  const arraysEqualIgnoreOrder = (a, b) =>
    Array.isArray(a) && Array.isArray(b) &&
    a.length === b.length &&
    a.every(id => b.includes(id));

  const handleAnswer = (questionId, answerId) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);
    localStorage.setItem('practiseAnswers', JSON.stringify(newAnswers));

    const current = questions.find(q => q.id === questionId);
    const correctAnswerIds = current.answers.filter(a => a.is_correct).map(a => a.id);
    let isCorrect = false;
    if (current.type === 1) {
      isCorrect = correctAnswerIds[0] === answerId;
    } else if (Array.isArray(answerId)) {
      isCorrect = arraysEqualIgnoreOrder(correctAnswerIds, answerId);
    }
    setIsCorrectMap(prev => ({ ...prev, [questionId]: isCorrect }));

    if (
      autoNext &&
      isCorrect &&
      current?.type === 1 &&
      currentQuestionIndex < questions.length - 1
    ) {
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
    }
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
          <Menu mode="vertical" defaultSelectedKeys={['practise']}>
            {/* <Menu.Item key="create-question">
              <Link to="/create-question">录入考题</Link>
            </Menu.Item> */}
            <Menu.Item key="generate-exam">
              <Link to="/generate-exam">答题</Link>
            </Menu.Item>
             <Menu.Item key="practise">
               <Link to="/practise">练习</Link>
             </Menu.Item>
          </Menu>
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
                          ? '#1890ff' // 当前题蓝色
                          : isCorrectMap[item.id] === false
                            ? '#f5222d' // 答错红色
                            : answers[item.id]
                              ? '#4caf50' // 答对绿色
                              : '#d3d3d3', // 默认灰色
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
              const cached = JSON.parse(localStorage.getItem('practiseQuestions') || '[]');
              const cachedAnswers = JSON.parse(localStorage.getItem('practiseAnswers') || '{}');
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
                  答对自动跳转到下一题（仅单选题）
                </Checkbox>
              </div>

              <div style={{ marginBottom: '10px' }}>
                {questions[currentQuestionIndex]?.type === 1 && <Tag color='blue'>单选题</Tag>}
                {questions[currentQuestionIndex]?.type === 2 && <Tag color='orange'>多选题</Tag>}
              </div>

              {(() => {
                const q = questions[currentQuestionIndex];
                const qid = q?.id;
                const ans = answers[qid];
                const hasAnswered = q?.type === 1
                  ? ans !== undefined
                  : Array.isArray(ans) && ans.length > 0;
                return hasAnswered &&
                  (q?.type === 1 || confirmedMap[qid]) &&
                  isCorrectMap[qid] !== undefined;
              })() && (() => {
                const q = questions[currentQuestionIndex];
                const qid = q?.id;
                return (
                  <>
                    <div style={{ marginBottom: '10px', color: isCorrectMap[qid] ? 'green' : 'red' }}>
                      {isCorrectMap[qid] ? '回答正确' : '回答错误'}
                    </div>
                    <div style={{ marginBottom: '20px', color: '#555', fontStyle: 'italic' }}>
                      {language === 'cn' && questions[currentQuestionIndex]?.explanation_cn}
                      {language === 'en' && questions[currentQuestionIndex]?.explanation_en}
                      {language === 'both' && (
                        <>
                          <div>{questions[currentQuestionIndex]?.explanation_cn}</div>
                          <div style={{ color: '#888', marginTop: '6px' }}>{questions[currentQuestionIndex]?.explanation_en}</div>
                        </>
                      )}
                    </div>
                  </>
                );
              })()}

              {renderQuestionWithIndex(questions[currentQuestionIndex], currentQuestionIndex)}

              {questions[currentQuestionIndex]?.type === 2 && (
                <div style={{ color: 'orange', marginBottom: '10px' }}>可以多选</div>
              )}

              <Space direction="vertical">
                {questions[currentQuestionIndex]?.answers.map((answer, answerIndex) => {
                  const qid = questions[currentQuestionIndex].id;
                  const answered = answers[qid];
                  const isAnsweredCorrect = isCorrectMap[qid];
                  const isConfirmed = confirmedMap[qid];
                  const question = questions[currentQuestionIndex];
                  // 新逻辑: 只有“单选题已答”或“多选题确认后”才显示正确答案
                  const hasAnswered =
                    question.type === 1
                      ? answers[qid] !== undefined
                      : Array.isArray(answers[qid]) && answers[qid].length > 0;
                  const showResult =
                    hasAnswered &&
                    (question.type === 1 || confirmedMap[qid]);

                  const isSelected = (question.type === 2
                    ? (answers[qid] || []).includes(answer.id)
                    : answers[qid] === answer.id);

                  const isCorrect = answer.is_correct;
                  let borderColor;
                  if (showResult) {
                    if (isCorrect) {
                      borderColor = 'green';
                    } else if (isSelected && !isCorrect) {
                      borderColor = 'red';
                    }
                  }

                  if (question.type === 2) {
                    return (
                      <Button
                        key={answer.id}
                        type={isSelected ? 'primary' : 'default'}
                        onClick={() => {
                          const currentAnswers = answers[qid] || [];
                          const updated = currentAnswers.includes(answer.id)
                            ? currentAnswers.filter(id => id !== answer.id)
                            : [...currentAnswers, answer.id];
                          const newAnswers = { ...answers, [qid]: updated };
                          setAnswers(newAnswers);
                          localStorage.setItem('practiseAnswers', JSON.stringify(newAnswers));

                          setIsCorrectMap(prev => {
                            const updatedMap = { ...prev };
                            delete updatedMap[qid];
                            return updatedMap;
                          });
                          setConfirmedMap(prev => {
                            const updatedMap = { ...prev };
                            delete updatedMap[qid];
                            return updatedMap;
                          });

                          const current = questions.find(q => q.id === qid);
                          const correctAnswerIds = current.answers.filter(a => a.is_correct).map(a => a.id);
                          let isCorrect = false;
                          if (current.type === 1) {
                            isCorrect = correctAnswerIds[0] === updated;
                          } else if (Array.isArray(updated)) {
                            isCorrect = arraysEqualIgnoreOrder(correctAnswerIds, updated);
                          }
                          setIsCorrectMap(prev => ({ ...prev, [qid]: isCorrect }));
                        }}
                        style={{
                          fontSize: '16px',
                          padding: '10px 20px',
                          borderColor,
                          borderWidth: showResult ? 2 : undefined,
                          borderStyle: showResult ? 'solid' : undefined
                        }}
                      >
                        {renderAnswerWithIndex(answer, answerIndex)}
                      </Button>
                    );
                  } else {
                    return (
                      <Button
                        key={answer.id}
                        type={isSelected ? 'primary' : 'default'}
                        onClick={() => handleAnswer(qid, answer.id)}
                        style={{
                          fontSize: '16px',
                          padding: '10px 20px',
                          borderColor,
                          borderWidth: showResult ? 2 : undefined,
                          borderStyle: showResult ? 'solid' : undefined
                        }}
                      >
                        {renderAnswerWithIndex(answer, answerIndex)}
                      </Button>
                    );
                  }
                })}
              </Space>

              {questions[currentQuestionIndex]?.type === 2 && (
                <Button
                  type="primary"
                  onClick={() => {
                    const qid = questions[currentQuestionIndex].id;
                    const current = questions.find(q => q.id === qid);
                    const correctAnswerIds = current.answers.filter(a => a.is_correct).map(a => a.id);
                    const answer = answers[qid];
                    const isCorrect = arraysEqualIgnoreOrder(correctAnswerIds, answer);
                    setIsCorrectMap(prev => ({ ...prev, [qid]: isCorrect }));
                    setConfirmedMap(prev => ({ ...prev, [qid]: true }));
                  }}
                  style={{ marginTop: '10px', marginBottom: '20px' }}
                  disabled={confirmedMap[questions[currentQuestionIndex].id]}
                >
                  确认答案
                </Button>
              )}

              <div style={{ marginTop: '20px' }}>
                <Button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  style={{ marginRight: '10px' }}
                >上一题</Button>
                <Button
                  type="primary"
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  下一题
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
