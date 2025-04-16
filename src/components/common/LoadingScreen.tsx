import React from 'react';
import { SpinLoading, SafeArea } from 'antd-mobile';

interface LoadingScreenProps {
  tip?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ tip = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <SafeArea position="top" />
      <div className="flex flex-col items-center">
        <SpinLoading color="primary" />
        <p className="mt-4 text-gray-500">{tip}</p>
      </div>
      <SafeArea position="bottom" />
    </div>
  );
};

export default LoadingScreen;
