import React, { InputHTMLAttributes } from 'react';
import { Input } from '@chatui/core';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  icon?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  error,
  type = 'text',
  icon,
  ...props
}) => {
  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        className={`w-full rounded-lg ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        placeholder={props.placeholder || `Enter your ${label.toLowerCase()}`}
        size="large"
        prefix={icon}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
