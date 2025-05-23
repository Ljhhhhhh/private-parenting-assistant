import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/global.css'; // 引入全局样式
// 导入存储
import './stores';

// 应用初始化组件
import { AppInitializer } from './components/AppInitializer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppInitializer>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppInitializer>
  </React.StrictMode>,
);
