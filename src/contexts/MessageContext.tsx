import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomToast from '../components/common/CustomToast';
import CustomDialog from '../components/common/CustomDialog';

interface ToastOptions {
  content: string;
  icon?: 'success' | 'fail' | 'loading';
  duration?: number;
}

interface DialogOptions {
  title?: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface MessageContextType {
  showToast: (options: ToastOptions) => void;
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions & { visible: boolean }>({
    content: '',
    visible: false,
  });
  
  const [dialog, setDialog] = useState<DialogOptions & { visible: boolean }>({
    content: '',
    visible: false,
  });

  const showToast = (options: ToastOptions) => {
    setToast({
      ...options,
      visible: true,
    });
  };

  const showDialog = (options: DialogOptions) => {
    setDialog({
      ...options,
      visible: true,
    });
  };

  const hideDialog = () => {
    setDialog((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const handleToastClose = () => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const handleDialogClose = () => {
    hideDialog();
  };

  const value = {
    showToast,
    showDialog,
    hideDialog,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
      <CustomToast
        content={toast.content}
        visible={toast.visible}
        icon={toast.icon}
        duration={toast.duration}
        onClose={handleToastClose}
      />
      <CustomDialog
        visible={dialog.visible}
        title={dialog.title}
        content={dialog.content}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        onClose={handleDialogClose}
      />
    </MessageContext.Provider>
  );
};
