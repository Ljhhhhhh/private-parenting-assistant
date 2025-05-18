import React from 'react';

export interface LoadingProps {
  color?: 'primary' | 'white' | 'gray';
  size?: 'small' | 'default' | 'large';
}

const Loading: React.FC<LoadingProps> = ({
  color = 'primary',
  size = 'default',
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary';
      case 'white':
        return 'bg-white';
      case 'gray':
        return 'bg-gray-500';
      default:
        return 'bg-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-1.5 h-1.5 mx-0.5';
      case 'large':
        return 'w-3 h-3 mx-1.5';
      default:
        return 'w-2 h-2 mx-1';
    }
  };

  return (
    <div className="flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full ${getColorClass()} ${getSizeClass()} animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        ></div>
      ))}
    </div>
  );
};

const DotLoading: React.FC<LoadingProps> = (props) => {
  return <Loading {...props} />;
};

export { DotLoading };
export default Loading;
