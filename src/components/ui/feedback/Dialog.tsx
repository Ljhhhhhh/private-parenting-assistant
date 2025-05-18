import React from 'react';

interface DialogProps {
  visible: boolean;
  title?: React.ReactNode;
  content: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  className?: string;
  centered?: boolean;
  showMask?: boolean;
  closeOnMaskClick?: boolean;
  actions?: React.ReactNode;
}

// 创建一个全局对话框管理钩子
export const useDialog = () => {
  const [dialogs, setDialogs] = React.useState<DialogProps[]>([]);

  const show = (props: Omit<DialogProps, 'visible'>) => {
    const dialog = { ...props, visible: true };
    setDialogs((prev) => [...prev, dialog]);
    return dialogs.length;
  };

  const hide = (index: number = dialogs.length - 1) => {
    setDialogs((prev) => {
      const newDialogs = [...prev];
      if (newDialogs[index]) {
        newDialogs.splice(index, 1);
      }
      return newDialogs;
    });
  };

  const alert = (
    content: React.ReactNode,
    title?: React.ReactNode,
    onConfirm?: () => void,
  ) => {
    return show({
      title,
      content,
      onConfirm,
    });
  };

  const confirm = (
    content: React.ReactNode,
    title?: React.ReactNode,
    onConfirm?: () => void,
    onCancel?: () => void,
  ) => {
    return show({
      title,
      content,
      onConfirm,
      onCancel,
    });
  };

  const DialogContainer = () => (
    <>
      {dialogs.map((dialog, index) => (
        <Dialog
          key={index}
          {...dialog}
          onCancel={() => {
            dialog.onCancel?.();
            hide(index);
          }}
          onConfirm={() => {
            dialog.onConfirm?.();
            hide(index);
          }}
        />
      ))}
    </>
  );

  return { show, hide, alert, confirm, DialogContainer };
};

const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  content,
  cancelText = '取消',
  confirmText = '确认',
  onCancel,
  onConfirm,
  className = '',
  centered = true,
  showMask = true,
  closeOnMaskClick = true,
  actions,
}) => {
  if (!visible) return null;

  // 处理遮罩点击
  const handleMaskClick = () => {
    if (closeOnMaskClick && onCancel) {
      onCancel();
    }
  };

  // 阻止冒泡
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`fixed inset-0 z-[1000] flex ${
        centered ? 'items-center' : 'items-start pt-[30vh]'
      } justify-center`}
      onClick={handleMaskClick}
    >
      {showMask && (
        <div className="fixed inset-0 transition-opacity duration-300 bg-black/50"></div>
      )}

      <div
        className={`
          relative bg-white rounded-dialog 
          w-[300px] max-w-[90vw] max-h-[80vh]
          shadow-dialog overflow-hidden
          animate-scale-in
          ${className}
        `}
        onClick={handleDialogClick}
      >
        {/* 标题 */}
        {title && (
          <div className="px-6 pt-6 pb-2 text-lg font-medium text-gray-900">
            {title}
          </div>
        )}

        {/* 内容 */}
        <div className="px-6 py-4 text-base text-gray-700 max-h-[60vh] overflow-auto">
          {content}
        </div>

        {/* 操作按钮 */}
        {actions ? (
          <div className="px-6 pt-2 pb-6">{actions}</div>
        ) : (
          <div className="flex border-t border-gray-100">
            {onCancel && (
              <button
                className="flex-1 py-3 text-base font-medium text-gray-600 transition border-r border-gray-100 hover:bg-gray-50 active:bg-gray-100"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}

            {onConfirm && (
              <button
                className="flex-1 py-3 text-base font-medium transition text-primary hover:bg-primary-light/10 active:bg-primary-light/20"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
