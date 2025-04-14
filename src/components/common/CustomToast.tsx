import React, { useState, useEffect } from 'react';
import { Toast } from 'antd-mobile';

interface CustomToastProps {
  content: string;
  visible: boolean;
  icon?: 'success' | 'fail' | 'loading';
  duration?: number;
  onClose?: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
  content,
  visible,
  icon,
  duration = 2000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(visible);
    
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  return (
    <>
      {isVisible && (
        <Toast
          content={content}
          icon={icon}
          visible={true}
        />
      )}
    </>
  );
};

export default CustomToast;
