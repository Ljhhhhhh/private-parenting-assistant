import React, { useState } from 'react';
import { Form, Input, Button } from '@/components/ui';
import { FormInstance } from '@/components/ui';
import { Icon } from '@iconify/react';

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
        className={`flex-1 flex items-center justify-center gap-3 py-4 border rounded-btn cursor-pointer transition-all duration-300 hover:shadow-sm ${
          value === 'male'
            ? 'bg-primary/10 border-primary text-primary'
            : 'border-gray-300 bg-background-card hover:bg-gray-50'
        } ${error ? 'border-error' : ''}`}
        onClick={() => handleSelect('male')}
      >
        <Icon
          icon="material-symbols:male"
          className={`text-xl ${
            value === 'male' ? 'text-primary' : 'text-gray-500'
          }`}
        />
        <span
          className={`text-base-lg font-medium ${
            value === 'male' ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          男孩
        </span>
      </div>

      <div
        className={`flex-1 flex items-center justify-center gap-3 py-4 border rounded-btn cursor-pointer transition-all duration-300 hover:shadow-sm ${
          value === 'female'
            ? 'bg-primary/10 border-primary text-primary'
            : 'border-gray-300 bg-background-card hover:bg-gray-50'
        } ${error ? 'border-error' : ''}`}
        onClick={() => handleSelect('female')}
      >
        <Icon
          icon="material-symbols:female"
          className={`text-xl ${
            value === 'female' ? 'text-primary' : 'text-gray-500'
          }`}
        />
        <span
          className={`text-base-lg font-medium ${
            value === 'female' ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          女孩
        </span>
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
      className={`px-4 py-2 rounded-tag cursor-pointer transition-all duration-300 text-sm flex items-center gap-2 hover:shadow-sm ${
        selected
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-background-card border border-gray-300 text-text-secondary hover:bg-gray-50 hover:border-gray-400'
      }`}
      onClick={onClick}
    >
      {selected && (
        <Icon
          icon="material-symbols:check-small"
          className="text-base text-primary"
        />
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
    { id: 'nuts', name: '坚果' },
    { id: 'seafood', name: '海鲜' },
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
    if (
      customAllergy.trim() &&
      !value.includes(customAllergy.trim()) &&
      onChange
    ) {
      onChange([...value, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  // 获取所有需要显示的过敏源
  const getAllergiesDisplay = () => {
    const commonAllergyIds = commonAllergies.map((a) => a.id);
    if (!value) {
      return {
        common: commonAllergies,
        custom: [],
      };
    }
    const customAllergies = value.filter(
      (item) => !commonAllergyIds.includes(item),
    );

    return {
      common: commonAllergies,
      custom: customAllergies,
    };
  };

  const { common: displayCommon, custom: displayCustom } =
    getAllergiesDisplay();

  return (
    <div>
      <div
        className={`flex flex-wrap gap-2 mb-4 ${
          error ? 'border border-error rounded-btn p-3 bg-error/5' : ''
        }`}
      >
        {/* 显示常见过敏源 */}
        {displayCommon.map((allergy) => (
          <AllergyTag
            key={allergy.id}
            name={allergy.name}
            selected={value.includes(allergy.id)}
            onClick={() => toggleAllergy(allergy.id)}
          />
        ))}

        {/* 显示自定义过敏源 */}
        {displayCustom.map((allergy) => (
          <AllergyTag
            key={`custom-${allergy}`}
            name={allergy}
            selected={true} // 自定义过敏源始终是已选择状态
            onClick={() => toggleAllergy(allergy)}
          />
        ))}
      </div>

      <div className="flex gap-3 mt-3">
        <div className="relative flex-1">
          <Input
            placeholder="添加其他过敏源..."
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            className="rounded-input h-[48px] pl-4 pr-12 text-base bg-background-card border-gray-300 focus:border-primary transition-all duration-300"
          />
        </div>
        <Button
          type="button"
          onClick={handleAddCustom}
          disabled={!customAllergy.trim()}
          className="h-[48px] px-6 bg-primary text-white rounded-input hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="material-symbols:add" className="text-lg" />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-error">
          <Icon icon="material-symbols:error-outline" className="text-base" />
          {error}
        </div>
      )}
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
        {/* 昵称字段 */}
        <div>
          <label className="flex items-center gap-2 mb-3 font-medium text-text-primary text-base-lg">
            <Icon
              icon="material-symbols:child-care"
              className="text-lg text-primary"
            />
            宝宝昵称
            <span className="text-error">*</span>
          </label>
          <Form.Item
            name="nickname"
            rules={[{ required: true, message: '请输入宝宝昵称' }]}
          >
            <Input
              placeholder="给宝宝起个可爱的昵称吧"
              clearable
              className="rounded-input h-[52px] px-4 text-base bg-background-card border-gray-300 focus:border-primary transition-all duration-300 hover:border-gray-400"
            />
          </Form.Item>
        </div>

        {/* 生日字段 */}
        <div>
          <label className="flex items-center gap-2 mb-3 font-medium text-text-primary text-base-lg">
            <Icon
              icon="material-symbols:calendar-today"
              className="text-lg text-primary"
            />
            出生日期
            <span className="text-error">*</span>
          </label>
          <Form.Item
            name="dateOfBirth"
            rules={[{ required: true, message: '请选择出生日期' }]}
          >
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="rounded-input h-[52px] px-4 text-base bg-background-card border-gray-300 focus:border-primary transition-all duration-300 hover:border-gray-400"
            />
          </Form.Item>
        </div>

        {/* 性别字段 */}
        <div>
          <label className="flex items-center gap-2 mb-3 font-medium text-text-primary text-base-lg">
            <Icon
              icon="material-symbols:person"
              className="text-lg text-primary"
            />
            性别
          </label>
          <Form.Item name="gender">
            <GenderSelector />
          </Form.Item>
        </div>

        {/* 过敏史字段 */}
        <div>
          <label className="flex items-center gap-2 mb-3 font-medium text-text-primary text-base-lg">
            <Icon
              icon="material-symbols:health-and-safety"
              className="text-lg text-primary"
            />
            过敏史
            <span className="ml-1 text-sm text-text-tertiary">(可选)</span>
          </label>
          <Form.Item name="allergies">
            <AllergySelector />
          </Form.Item>
        </div>

        {/* 额外信息字段 */}
        <div>
          <label className="flex items-center gap-2 mb-3 font-medium text-text-primary text-base-lg">
            <Icon
              icon="material-symbols:notes"
              className="text-lg text-primary"
            />
            更多信息
            <span className="ml-1 text-sm text-text-tertiary">(可选)</span>
          </label>
          <Form.Item name="additionalInfo">
            <Input.TextArea
              placeholder="您还可以添加任何重要信息，例如医疗状况、特殊偏好或护理需求..."
              className="rounded-input min-h-[120px] p-4 text-base bg-background-card border-gray-300 focus:border-primary transition-all duration-300 hover:border-gray-400 resize-none"
              rows={4}
            />
          </Form.Item>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4">
          <Button
            block
            loading={loading}
            className="h-[56px] rounded-btn text-white text-base-lg font-medium bg-gradient-to-r from-primary to-primary-light border-none shadow-card hover:shadow-btn transition-all duration-300 flex items-center justify-center group"
            type="submit"
          >
            <span className="flex items-center gap-2">
              {submitText}
              <Icon
                icon="material-symbols:arrow-forward"
                className="text-xl transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default ChildForm;
