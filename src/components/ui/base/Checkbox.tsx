import React, { useState, useEffect } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  label,
  className = '',
  onChange,
  ...rest
}) => {
  // 使用内部状态跟踪复选框状态（用于非受控模式）
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  // 判断是否为受控组件
  const isControlled = controlledChecked !== undefined;
  // 当前复选框的实际checked状态
  const checked = isControlled ? controlledChecked : internalChecked;

  const ref = React.useRef<HTMLInputElement>(null);

  // 当受控值改变时更新内部状态
  useEffect(() => {
    if (isControlled && ref.current) {
      ref.current.checked = controlledChecked;
    }
  }, [controlledChecked, isControlled]);

  // 设置indeterminate属性（半选状态）
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // 处理复选框变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 非受控模式下，更新内部状态
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }

    // 调用外部传入的onChange回调
    if (onChange) {
      onChange(e);
    } else if (isControlled) {
      // 如果是受控组件但没有提供onChange处理器，创建一个空的处理器
      // 防止React警告："You provided a `checked` prop without an `onChange` handler"
      e.preventDefault();
      console.warn('Checkbox组件是受控组件，但未提供onChange处理器');
    }
  };

  return (
    <label
      className={`inline-flex items-center cursor-pointer select-none text-base ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
    >
      <span className="relative flex items-center justify-center w-5 h-5 mr-2">
        <input
          ref={ref}
          type="checkbox"
          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-[6px] bg-white 
            checked:bg-primary checked:border-primary 
            focus:ring-2 focus:ring-primary/30 focus:outline-none
            transition-all duration-200 
            disabled:bg-gray-200 disabled:border-gray-300"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          {...rest}
        />
        <span className="absolute top-0 left-0 flex items-center justify-center w-5 h-5 pointer-events-none">
          {checked && !indeterminate && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 8.5L7 11.5L12 5.5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {indeterminate && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="4"
                y="7.25"
                width="8"
                height="1.5"
                rx="0.75"
                fill="#fff"
              />
            </svg>
          )}
        </span>
      </span>
      {label && (
        <span className="text-base text-gray-800 align-middle">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;
