import { createRoot } from 'react-dom/client';
import 'antd-mobile/es/global';
import '@chatui/core/dist/index.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
