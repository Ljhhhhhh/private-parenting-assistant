import React, { useEffect } from 'react';
import { Toast } from 'antd-mobile';

interface CustomToastProps {
  content: string;
  visible: boolean;
  icon?: 'success' | 'fail' | 'loading';
  duration?: number;
  onClose: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
  content,
  visible,
  icon,
  duration = 2000,
  onClose,
}) => {
  useEffect(() => {
    if (visible) {
      Toast.show({
        content,
        icon,
        duration,
        afterClose: onClose,
      });
    }
  }, [visible, content, icon, duration, onClose]);

  return null;
};

export default CustomToast;
