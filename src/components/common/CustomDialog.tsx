import React from 'react';
import { Dialog } from 'antd-mobile';

interface CustomDialogProps {
  visible: boolean;
  title?: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  visible,
  title,
  content,
  confirmText = '确定',
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Dialog
      visible={visible}
      title={title}
      content={content}
      closeOnAction
      closeOnMaskClick
      onClose={onClose}
      actions={[
        ...(cancelText
          ? [
              {
                key: 'cancel',
                text: cancelText,
                onClick: () => {
                  onCancel?.();
                  onClose();
                },
              },
            ]
          : []),
        {
          key: 'confirm',
          text: confirmText,
          bold: true,
          onClick: () => {
            onConfirm?.();
            onClose();
          },
        },
      ]}
    />
  );
};

export default CustomDialog;
