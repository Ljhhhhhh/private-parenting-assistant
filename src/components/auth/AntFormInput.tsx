import React, { InputHTMLAttributes } from 'react';
import { Input, Form } from 'antd-mobile';
import { UserOutline, LockOutline, MailOutline } from 'antd-mobile-icons';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  id: string;
  error?: string;
  icon?: 'user' | 'lock' | 'mail' | string;
  onChange?: (value: string) => void;
}

const AntFormInput: React.FC<FormInputProps> = ({
  label,
  id,
  error,
  type = 'text',
  icon,
  onChange,
  value,
  ...props
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'user':
        return <UserOutline />;
      case 'lock':
        return <LockOutline />;
      case 'mail':
        return <MailOutline />;
      default:
        return null;
    }
  };

  const handleChange = (val: string) => {
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <Form.Item
      label={label}
      className="mb-4"
      validateStatus={error ? 'error' : undefined}
      help={error}
    >
      <Input
        id={id}
        type={type}
        value={value as string}
        onChange={handleChange}
        placeholder={props.placeholder || `Enter your ${label.toLowerCase()}`}
        clearable
        prefix={getIcon()}
        {...props}
      />
    </Form.Item>
  );
};

export default AntFormInput;
