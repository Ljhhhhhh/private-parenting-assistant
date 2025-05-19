import React, { useRef } from 'react';

// 分离原生HTML属性和自定义属性
type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'prefix' | 'suffix'
>;

interface InputProps extends NativeInputProps {
  error?: string;
  clearable?: boolean;
  variant?: 'default' | 'search';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

// TextArea组件的属性
interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'prefix'> {
  error?: string;
  clearable?: boolean;
  rows?: number;
}

// TextArea组件
const TextArea: React.FC<TextAreaProps> = ({
  error,
  clearable = false,
  className = '',
  disabled = false,
  rows = 4,
  ...rest
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = React.useState(rest.value ?? '');

  React.useEffect(() => {
    setValue(rest.value ?? '');
  }, [rest.value]);

  const handleClear = () => {
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus();
    }
    if (rest.onChange) {
      const event = {
        ...new Event('input'),
        target: textareaRef.current,
      } as any;
      rest.onChange(event);
    }
  };

  const bg = disabled
    ? 'bg-background-disabled'
    : 'bg-gray-100 focus:bg-gray-50';

  const textareaClass = `w-full p-4 text-base rounded-input border 
    ${
      error
        ? 'border-error focus:border-error'
        : 'border-gray-300 focus:border-primary focus:shadow-sm'
    } 
    ${bg}
    outline-none transition-all duration-300 
    ${clearable ? 'pr-10' : ''}
    ${className}`;

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        className={textareaClass}
        value={value}
        disabled={disabled}
        rows={rows}
        onChange={(e) => {
          setValue(e.target.value);
          if (rest.onChange) {
            rest.onChange(e);
          }
        }}
        {...rest}
      />
      {clearable && value && (
        <button
          type="button"
          className="absolute right-3 top-4 text-lg text-text-tertiary hover:text-error"
          onClick={handleClear}
          tabIndex={-1}
        >
          ×
        </button>
      )}
      {error && (
        <div className="mt-1 ml-1 text-xs leading-4 text-error">{error}</div>
      )}
    </div>
  );
};

// 定义包含TextArea的Input组件类型
interface InputComponent extends React.FC<InputProps> {
  TextArea: React.FC<TextAreaProps>;
}

const Input: React.FC<InputProps> = ({
  error,
  clearable = false,
  variant = 'default',
  prefix,
  suffix,
  className = '',
  type = 'text',
  disabled = false,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState(rest.value ?? '');

  React.useEffect(() => {
    setValue(rest.value ?? '');
  }, [rest.value]);

  const handleClear = () => {
    setValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    if (rest.onChange) {
      const event = { ...new Event('input'), target: inputRef.current } as any;
      rest.onChange(event);
    }
  };

  const borderRadius = variant === 'search' ? 'rounded-full' : 'rounded-input';
  const height = variant === 'search' ? 'h-11' : 'h-12'; // 搜索44px，标准48px
  const bg = disabled
    ? 'bg-background-disabled'
    : 'bg-gray-100 focus:bg-gray-50';

  const inputClass = `w-full ${height} px-4 text-base ${borderRadius} border 
    ${
      error
        ? 'border-error focus:border-error'
        : 'border-gray-300 focus:border-primary focus:shadow-sm'
    } 
    ${bg}
    outline-none transition-all duration-300 
    ${prefix ? 'pl-10' : ''}
    ${clearable || suffix ? 'pr-10' : ''}
    ${className}`;

  return (
    <div className="relative w-full">
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
          {prefix}
        </div>
      )}
      <input
        ref={inputRef}
        type={type}
        className={inputClass}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          if (rest.onChange) {
            rest.onChange(e);
          }
        }}
        {...rest}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
          {suffix}
        </div>
      )}
      {clearable && value && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-text-tertiary hover:text-error"
          onClick={handleClear}
          tabIndex={-1}
        >
          ×
        </button>
      )}
      {error && (
        <div className="mt-1 ml-1 text-xs leading-4 text-error">{error}</div>
      )}
    </div>
  );
};

// 将TextArea作为Input的属性导出
(Input as InputComponent).TextArea = TextArea;

export default Input as InputComponent;
