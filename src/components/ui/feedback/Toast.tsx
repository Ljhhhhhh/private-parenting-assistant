import React, { useEffect } from 'react';

export type ToastType = 'success' | 'fail' | 'loading' | 'info';

interface ToastProps {
  type?: ToastType;
  content: React.ReactNode;
  duration?: number; // ms
  onClose?: () => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#4CAF50" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  fail: (
    <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#FF5252" />
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  loading: (
    <span className="w-6 h-6 border-2 border-primary rounded-full animate-spin border-t-transparent inline-block"></span>
  ),
  info: (
    <svg className="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#2196F3" />
      <path
        d="M12 8v4m0 4h.01"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

// 创建一个全局Toast管理钩子
export const useToast = () => {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    [],
  );

  const show = (props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { ...props, id, onClose: () => hide(id) };
    setToasts((prev) => [...prev, toast]);

    if (props.duration !== 0) {
      setTimeout(() => {
        hide(id);
      }, props.duration || 2000);
    }

    return id;
  };

  const hide = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>
  );

  return { show, hide, ToastContainer };
};

const Toast: React.FC<ToastProps> = ({
  type = 'info',
  content,
  duration = 2000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className="fixed left-1/2 top-1/3 z-[9999] -translate-x-1/2 
      bg-white rounded-[20px] shadow-dialog px-6 py-4 
      flex flex-col items-center min-w-[120px] max-w-[80vw]
      animate-fade-in-down"
    >
      <div className="mb-2">{iconMap[type]}</div>
      <div className="text-base text-gray-900 text-center break-words">
        {content}
      </div>
    </div>
  );
};

export default Toast;
