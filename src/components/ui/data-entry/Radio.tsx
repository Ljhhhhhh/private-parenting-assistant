import React from 'react';

interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  disabled?: boolean;
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  children: React.ReactNode;
}

interface RadioGroupProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const Radio: React.FC<RadioProps> & { Group: React.FC<RadioGroupProps> } = ({
  checked = false,
  disabled = false,
  value = '',
  onChange,
  className = '',
  children,
  ...rest
}) => {
  const handleChange = () => {
    if (disabled) return;
    onChange?.(value);
  };

  return (
    <label
      className={`inline-flex items-center cursor-pointer select-none text-base ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
    >
      <span className="relative flex items-center justify-center w-5 h-5 mr-2">
        <input
          type="radio"
          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full bg-white 
            checked:bg-primary checked:border-primary
            focus:ring-2 focus:ring-primary/30 focus:outline-none
            transition-all duration-200 
            disabled:bg-background-disabled disabled:border-gray-300"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          value={value}
          {...rest}
        />
        <span className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none">
          {checked && <span className="w-2 h-2 rounded-full bg-gray-50"></span>}
        </span>
      </span>
      <span className="text-base text-text-primary">{children}</span>
    </label>
  );
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  className = '',
  children,
  disabled = false,
}) => {
  // 克隆子元素并添加checked和onChange属性
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as RadioProps;
      return React.cloneElement(child as React.ReactElement<RadioProps>, {
        checked: childProps.value === value,
        onChange: onChange,
        disabled: disabled || childProps.disabled,
      });
    }
    return child;
  });

  return <div className={`flex gap-4 ${className}`}>{childrenWithProps}</div>;
};

Radio.Group = RadioGroup;

export default Radio;
