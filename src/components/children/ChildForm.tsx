import React, { useState } from 'react';
import { Form, Input, Button } from '@/components/ui';
import { FormInstance } from '@/components/ui';

export interface ChildFormValues {
  nickname: string;
  dateOfBirth: string;
  gender?: string;
  allergies?: string[];
  additionalInfo?: string;
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
  error?: string;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleSelect = (gender: string) => {
    if (onChange) {
      onChange(gender);
    }
  };

  return (
    <div className="flex w-full gap-4">
      <div
        className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-[12px] cursor-pointer transition-all duration-200 ${
          value === 'male'
            ? 'bg-[#E8F0FE] border-[#4A90E2] text-[#4A90E2]'
            : 'border-[#E8F0FE] bg-white/70'
        } ${error ? 'border-[#FF5252]' : ''}`}
        onClick={() => handleSelect('male')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 11C9.79 11 8 12.79 8 15C8 17.21 9.79 19 12 19C14.21 19 16 17.21 16 15C16 12.79 14.21 11 12 11Z"
            fill={value === 'male' ? '#4A90E2' : '#999'}
          />
          <path
            d="M12 2C11.72 2 11.5 2.22 11.5 2.5V5.5H12.5V3.31L14.38 5.19C14.76 5.57 15 6.11 15 6.69V9.5C15 10.33 14.33 11 13.5 11V12C14.88 12 16 10.88 16 9.5V6.69C16 5.9 15.66 5.15 15.12 4.61L13.06 2.56C12.85 2.22 12.45 2 12 2Z"
            fill={value === 'male' ? '#4A90E2' : '#999'}
          />
          <path
            d="M17.31 2.68C17.12 2.5 16.84 2.5 16.66 2.68L14 5.34L14.71 6.05L17.31 3.45C17.5 3.26 17.5 2.9 17.31 2.68Z"
            fill={value === 'male' ? '#4A90E2' : '#999'}
          />
        </svg>
        <span className="text-base font-medium">男孩</span>
      </div>

      <div
        className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-[12px] cursor-pointer transition-all duration-200 ${
          value === 'female'
            ? 'bg-[#FFDCE8] border-[#F8BBD0] text-[#E091B1]'
            : 'border-[#E8F0FE] bg-white/70'
        } ${error ? 'border-[#FF5252]' : ''}`}
        onClick={() => handleSelect('female')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 11C9.79 11 8 12.79 8 15C8 17.21 9.79 19 12 19C14.21 19 16 17.21 16 15C16 12.79 14.21 11 12 11Z"
            fill={value === 'female' ? '#E091B1' : '#999'}
          />
          <path
            d="M12 2C11.72 2 11.5 2.22 11.5 2.5V5.5H12.5V3.31L14.38 5.19C14.76 5.57 15 6.11 15 6.69V9.5C15 10.33 14.33 11 13.5 11V12C14.88 12 16 10.88 16 9.5V6.69C16 5.9 15.66 5.15 15.12 4.61L13.06 2.56C12.85 2.22 12.45 2 12 2Z"
            fill={value === 'female' ? '#E091B1' : '#999'}
          />
          <path
            d="M9 10C9.55 10 10 9.55 10 9C10 8.45 9.55 8 9 8C8.45 8 8 8.45 8 9C8 9.55 8.45 10 9 10Z"
            fill={value === 'female' ? '#E091B1' : '#999'}
          />
        </svg>
        <span className="text-base font-medium">女孩</span>
      </div>
    </div>
  );
};

// 过敏源选择组件
interface AllergyTagProps {
  name: string;
  selected: boolean;
  onClick: () => void;
}

const AllergyTag: React.FC<AllergyTagProps> = ({ name, selected, onClick }) => {
  return (
    <div
      className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-200 text-sm flex items-center gap-1 ${
        selected
          ? 'bg-[#4A90E2]/10 text-[#4A90E2] border border-[#4A90E2]'
          : 'bg-white/70 border border-[#E8F0FE] text-[#666]'
      }`}
      onClick={onClick}
    >
      {selected && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
            fill="#4A90E2"
          />
        </svg>
      )}
      {name}
    </div>
  );
};

const AllergySelector: React.FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
}> = ({ value = [], onChange, error }) => {
  const commonAllergies = [
    { id: 'milk', name: '牛奶' },
    { id: 'eggs', name: '鸡蛋' },
    { id: 'peanuts', name: '花生' },
    { id: 'nuts', name: '坚果' },
    { id: 'soy', name: '大豆' },
    { id: 'wheat', name: '小麦' },
    { id: 'fish', name: '鱼类' },
    { id: 'shellfish', name: '贝类' },
  ];

  const [customAllergy, setCustomAllergy] = useState('');

  const toggleAllergy = (id: string) => {
    if (onChange) {
      if (value.includes(id)) {
        onChange(value.filter((item) => item !== id));
      } else {
        onChange([...value, id]);
      }
    }
  };

  const handleAddCustom = () => {
    if (customAllergy && !value.includes(customAllergy) && onChange) {
      onChange([...value, customAllergy]);
      setCustomAllergy('');
    }
  };

  return (
    <div>
      <div
        className={`flex flex-wrap gap-2 mb-3 ${
          error ? 'border border-[#FF5252] rounded-[12px] p-2' : ''
        }`}
      >
        {commonAllergies.map((allergy) => (
          <AllergyTag
            key={allergy.id}
            name={allergy.name}
            selected={value.includes(allergy.id)}
            onClick={() => toggleAllergy(allergy.id)}
          />
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          placeholder="添加其他过敏源..."
          value={customAllergy}
          onChange={(e) => setCustomAllergy(e.target.value)}
          className="rounded-[12px] h-[44px] pl-4 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300 flex-1"
        />
        <Button
          onClick={handleAddCustom}
          disabled={!customAllergy}
          className="h-[44px] w-24 rounded-[12px] px-4 bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] text-white border-none"
        >
          添加
        </Button>
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
  const [selectedDate, setSelectedDate] = useState(
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
      if (initialValues.allergies) {
        formRef.current.setFieldValue('allergies', initialValues.allergies);
      }
      if (initialValues.additionalInfo) {
        formRef.current.setFieldValue(
          'additionalInfo',
          initialValues.additionalInfo,
        );
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

  // 日期选择处理
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // 确保值同步到表单
    if (formRef.current) {
      formRef.current.setFieldValue('dateOfBirth', newDate);
    }
  };

  return (
    <Form form={formRef} layout="vertical" onFinish={handleFinish}>
      <div className="space-y-6">
        {/* 昵称 */}
        <div>
          <label className="block text-[#555] text-base mb-2 font-medium">
            昵称
          </label>
          <Form.Item
            name="nickname"
            rules={[{ required: true, message: '请输入宝宝昵称' }]}
          >
            <Input
              placeholder="请输入宝宝昵称"
              clearable
              className="rounded-[12px] h-[52px] pl-4 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
            />
          </Form.Item>
        </div>

        {/* 生日 */}
        <div>
          <label className="block text-[#555] text-base mb-2 font-medium">
            生日
          </label>
          <Form.Item
            name="dateOfBirth"
            rules={[{ required: true, message: '请选择出生日期' }]}
          >
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="rounded-[12px] h-[52px] pl-4 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
            />
          </Form.Item>
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-[#555] text-base mb-2 font-medium">
            性别
          </label>
          <Form.Item name="gender">
            <GenderSelector />
          </Form.Item>
        </div>

        {/* 过敏源 */}
        <div>
          <label className="block text-[#555] text-base mb-2 font-medium">
            过敏史
          </label>
          <Form.Item name="allergies">
            <AllergySelector />
          </Form.Item>
        </div>

        {/* 额外信息 */}
        <div>
          <label className="block text-[#555] text-base mb-2 font-medium">
            更多信息
          </label>
          <Form.Item name="additionalInfo">
            <Input.TextArea
              placeholder="添加任何重要信息，例如医疗状况，偏好或特殊需求"
              className="rounded-[12px] min-h-[120px] p-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
              rows={4}
            />
          </Form.Item>
        </div>

        {/* 提交按钮 */}
        <Button
          block
          loading={loading}
          className="h-[56px] rounded-[16px] text-white text-base font-medium bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] border-none shadow-lg shadow-[#4A90E2]/20 hover:shadow-xl hover:shadow-[#4A90E2]/30 transition-all duration-300 flex items-center justify-center mt-8"
          type="submit"
        >
          {submitText}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="ml-1"
          >
            <path
              d="M13 5l7 7-7 7M5 12h15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </Form>
  );
};

export default ChildForm;
