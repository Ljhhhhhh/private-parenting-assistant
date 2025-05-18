import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  className = '',
  onChange,
  ...rest
}) => {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

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
          onChange={onChange}
          {...rest}
        />
        <span className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none">
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
