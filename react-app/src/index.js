import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const SECRET_KEY = 'ciandt20251';

function ProtectedApp() {
  const [key, setKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('access_key');
    if (savedKey === SECRET_KEY) {
      setIsAuthorized(true);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (key === SECRET_KEY) {
      localStorage.setItem('access_key', key);
      setIsAuthorized(true);
      setError('');
    } else {
      setError('密钥错误，无法访问');
    }
  }

  if (isAuthorized) {
    return <App />;
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '30px 40px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 320,
        }}
      >
        <label
          htmlFor="accessKey"
          style={{
            fontSize: 18,
            marginBottom: 15,
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          请输入访问密钥
        </label>
        <input
          id="accessKey"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: 16,
            borderRadius: 4,
            border: '1px solid #d9d9d9',
            marginBottom: 20,
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 0',
            fontSize: 16,
            width: '100%',
            borderRadius: 4,
            backgroundColor: '#1890ff',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          提交
        </button>
        {error && (
          <div style={{ color: 'red', marginTop: 12, fontWeight: 'bold' }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ProtectedApp />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
