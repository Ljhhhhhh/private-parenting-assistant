import React from 'react';
import { Form, Input, Button } from '@/components/ui';
import { FormInstance } from '@/components/ui';

export interface ChildFormValues {
  nickname: string;
  dateOfBirth: string;
  gender?: string;
}

interface ChildFormProps {
  initialValues?: Partial<ChildFormValues>;
  loading?: boolean;
  onSubmit: (values: ChildFormValues) => void;
  submitText?: string;
}

// 自定义的性别选择组件
interface GenderSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onChange }) => {
  const handleSelect = (gender: string) => {
    if (onChange) {
      onChange(gender);
    }
  };

  return (
    <div className="flex gap-4">
      <div
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${
          value === 'male' ? 'bg-primary/10 border-primary' : 'border-gray-300'
        }`}
        onClick={() => handleSelect('male')}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            value === 'male' ? 'border-primary' : 'border-gray-300'
          }`}
        >
          {value === 'male' && (
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          )}
        </div>
        <span className="text-text-primary">男</span>
      </div>
      <div
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${
          value === 'female'
            ? 'bg-primary/10 border-primary'
            : 'border-gray-300'
        }`}
        onClick={() => handleSelect('female')}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            value === 'female' ? 'border-primary' : 'border-gray-300'
          }`}
        >
          {value === 'female' && (
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          )}
        </div>
        <span className="text-text-primary">女</span>
      </div>
    </div>
  );
};

const ChildForm: React.FC<ChildFormProps> = ({
  initialValues = {},
  loading,
  onSubmit,
  submitText = '保存',
}) => {
  const formRef = React.useRef<FormInstance>(null);
  const [selectedDate, setSelectedDate] = React.useState(
    initialValues.dateOfBirth || '',
  );

  React.useEffect(() => {
    if (formRef.current && initialValues) {
      // 确保表单初始值设置正确
      if (initialValues.nickname) {
        formRef.current.setFieldValue('nickname', initialValues.nickname);
      }
      if (initialValues.dateOfBirth) {
        formRef.current.setFieldValue('dateOfBirth', initialValues.dateOfBirth);
      }
      if (initialValues.gender) {
        formRef.current.setFieldValue('gender', initialValues.gender);
      }

      setSelectedDate(initialValues.dateOfBirth || '');
    }
  }, [initialValues]);

  const handleFinish = (values: any) => {
    // 直接使用表单收集的值
    onSubmit({
      ...values,
      // 确保日期有值
      dateOfBirth: values.dateOfBirth || selectedDate,
    });
  };

  // 简单的日期选择
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // 确保值同步到表单
    if (formRef.current) {
      formRef.current.setFieldValue('dateOfBirth', newDate);
    }
  };

  return (
    <Form
      form={formRef}
      layout="vertical"
      onFinish={handleFinish}
      footer={
        <Button
          block
          loading={loading}
          variant="primary"
          gradient
          className="h-12 text-base font-medium"
          type="submit"
        >
          {submitText}
        </Button>
      }
    >
      <Form.Item
        name="nickname"
        label="宝宝昵称"
        rules={[{ required: true, message: '请输入宝宝昵称' }]}
      >
        <Input placeholder="请输入宝宝昵称" clearable />
      </Form.Item>

      <Form.Item
        name="dateOfBirth"
        label="出生日期"
        rules={[{ required: true, message: '请选择出生日期' }]}
      >
        <Input type="date" value={selectedDate} onChange={handleDateChange} />
      </Form.Item>

      <Form.Item name="gender" label="性别">
        <GenderSelector />
      </Form.Item>
    </Form>
  );
};

export default ChildForm;
