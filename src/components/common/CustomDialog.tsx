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
  onClose?: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  visible,
  title,
  content,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}) => {
  return (
    <Dialog
      visible={visible}
      title={title}
      content={content}
      closeOnAction
      closeOnMaskClick
      actions={[
        ...(cancelText
          ? [
              {
                key: 'cancel',
                text: cancelText,
                onClick: () => {
                  if (onCancel) onCancel();
                  if (onClose) onClose();
                },
              },
            ]
          : []),
        {
          key: 'confirm',
          text: confirmText,
          bold: true,
          onClick: () => {
            if (onConfirm) onConfirm();
            if (onClose) onClose();
          },
        },
      ]}
    />
  );
};

export default CustomDialog;
