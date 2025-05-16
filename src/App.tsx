import { Suspense } from 'react';
import { Routes } from 'react-router-dom';
import { SafeArea, DotLoading } from 'antd-mobile';

// 加载状态组件
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <DotLoading color="primary" />
  </div>
);

const App = () => {
  return (
    <div className="App">
      <SafeArea position="top" />
      <Suspense fallback={<Loading />}>
        <Routes></Routes>
      </Suspense>
      <SafeArea position="bottom" />
    </div>
  );
};

export default App;
