import React from 'react';
import { Tag, Layout, Button, Space, Radio } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const ExamResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 读取所有题目
  const [questions, setQuestions] = React.useState([]);
  // 读取答题结果
  const results = location.state?.results || [];
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [language, setLanguage] = React.useState('cn'); // 'cn', 'en', 'both'

  React.useEffect(() => {
    const storedQuestions = localStorage.getItem('examQuestions');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
  }, []);

  // 兼容无数据
  if (!questions.length) {
    return (
      <Layout style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f9f9f9' }}>
        <Header style={{ backgroundColor: '#001529' }}>
          <div style={{ color: '#fff', textAlign: 'center', fontSize: '20px' }}>考试结果</div>
        </Header>
        <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>暂无考试数据</div>
          <Button type="primary" style={{ marginTop: '20px' }} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </Content>
      </Layout>
    );
  }

  // 获取当前题目
  const question = questions[currentIndex];

  // 获取当前题目的答题结果
  const resultObj = results.find(r => r.questionNumber === question.id) || {};

  // 题干
  const getQuestionText = () => {
    if (language === 'cn') return question.question_cn || question.questionText || '';
    if (language === 'en') return question.question_en || '';
    if (language === 'both') return (
      <>
        <div>{question.question_cn || question.questionText || ''}</div>
        <div style={{ color: '#666' }}>{question.question_en || ''}</div>
      </>
    );
    return '';
  };

  // 解析
  const getExplanation = () => {
    if (language === 'cn') return question.explanation_cn || question.explanation || '暂无解析';
    if (language === 'en') return question.explanation_en || question.explanation || 'No explanation';
    if (language === 'both') return (
      <>
        <div>{question.explanation_cn || question.explanation || '暂无解析'}</div>
        <div style={{ color: '#666' }}>{question.explanation_en || question.explanation || 'No explanation'}</div>
      </>
    );
    return '';
  };

  // 选项内容
  const renderAnswers = () => {
    if (!question.answers) return null;
    const options = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        {question.answers.map((ans, idx) => {
          // 判断是否为用户答案
          const yourAnswer = resultObj.yourAnswer;
          const isYourAnswer = Array.isArray(yourAnswer)
            ? yourAnswer?.includes(ans.id)
            : yourAnswer === ans.id;
          // 判断是否为正确答案
          const isCorrect = ans.is_correct;
          return (
            <div
              key={ans.id}
              style={{
                padding: '10px 16px',
                borderRadius: 6,
                background: isYourAnswer ? '#ffe7ba' : '#f5f5f5',
                border: isCorrect ? '2px solid #52c41a' : '1px solid #ddd',
                color: isCorrect ? '#52c41a' : '#333',
                fontWeight: isCorrect ? 600 : 400,
                fontSize: 16,
                marginBottom: 4,
                position: 'relative'
              }}
            >
              <span style={{ marginRight: 8 }}>{options[idx] || ''}.</span>
              {language === 'cn' && ans.content_cn}
              {language === 'en' && ans.content_en}
              {language === 'both' && (
                <span>
                  {ans.content_cn} / <span style={{ color: '#666' }}>{ans.content_en}</span>
                </span>
              )}
              {isYourAnswer && (
                <Tag color="orange" style={{ marginLeft: 8 }}>你的答案</Tag>
              )}
              {isCorrect && (
                <Tag color="green" style={{ marginLeft: 8 }}>正确答案</Tag>
              )}
            </div>
          );
        })}
      </Space>
    );
  };

  return (
    <Layout style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f9f9f9' }}>
      <Header style={{ backgroundColor: '#001529' }}>
        <div style={{ color: '#fff', textAlign: 'center', fontSize: '20px' }}>考试结果</div>
      </Header>
      <Layout>
        <Sider width={250} style={{ background: '#fff', padding: '10px', borderRight: '1px solid #ddd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 50px)', gap: '10px', marginTop: '20px' }}>
            {questions.map((item, index) => {
              const r = results.find(r => r.questionNumber === item.id) || {};
              return (
                <div
                  key={item.id}
                  style={{
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: index === currentIndex
                      ? '#1890ff'
                      : r.result === '正确'
                        ? '#4caf50'
                        : '#f44336',
                    color: '#fff',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: index === currentIndex ? '2px solid #001529' : 'none',
                    fontWeight: index === currentIndex ? 700 : 400,
                    fontSize: 18
                  }}
                  onClick={() => setCurrentIndex(index)}
                  title={r.result}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
          <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: '30px', width: '100%' }}>返回首页</Button>
        </Sider>
        <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
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
            <Tag color={question.type === 1 ? 'blue' : 'orange'}>
              {question.type === 1 ? '单选题' : '多选题'}
            </Tag>
            <Tag color={resultObj.result === '正确' ? 'success' : 'error'}>
              {resultObj.result || '未作答'}
            </Tag>
          </div>
          <div style={{ fontSize: '18px', color: '#333', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
            {getQuestionText()}
          </div>
          {renderAnswers()}
          <div style={{ margin: '16px 0', color: '#888', fontSize: 14 }}>
            <b>解析：</b>{getExplanation()}
          </div>
          <div style={{ marginTop: '20px' }}>
            <Button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              style={{ marginRight: '10px' }}
            >上一题</Button>
            <Button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >下一题</Button>
          </div>
          <div style={{ marginTop: 20, color: '#aaa', fontSize: 13, textAlign: 'center' }}>
            {currentIndex + 1} / {questions.length}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ExamResultPage;
