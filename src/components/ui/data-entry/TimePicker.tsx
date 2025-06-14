import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';

interface TimePickerProps {
  value: string; // ISO格式的时间字符串或datetime-local格式
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

type QuickOptionType = 'now' | '1hour' | '2hour' | 'custom';

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className = '',
  label = '时间',
}) => {
  const [selectedType, setSelectedType] = useState<QuickOptionType>('now');
  const [customHours, setCustomHours] = useState<number>();

  // 初始化选中状态
  useEffect(() => {
    if (value) {
      const date = dayjs(value);
      const now = dayjs();

      // 计算时间差（小时）
      const hoursDiff = now.diff(date, 'hour', true);

      // 允许30分钟的误差
      if (Math.abs(hoursDiff) <= 0.5) {
        setSelectedType('now');
      } else if (Math.abs(hoursDiff - 1) <= 0.5) {
        setSelectedType('1hour');
      } else if (Math.abs(hoursDiff - 2) <= 0.5) {
        setSelectedType('2hour');
      } else {
        setSelectedType('custom');
        setCustomHours(Math.round(hoursDiff));
      }
    }
  }, [value]);

  // 处理快捷选项点击
  const handleQuickOptionClick = (type: QuickOptionType, hours: number = 0) => {
    setSelectedType(type);

    let newValue: string;
    if (type === 'now') {
      newValue = dayjs().format('YYYY-MM-DDTHH:mm');
    } else {
      newValue = dayjs().subtract(hours, 'hour').format('YYYY-MM-DDTHH:mm');
    }
    onChange(newValue);
  };

  // 处理自定义小时数输入
  const handleCustomHoursChange = (inputValue: string) => {
    setCustomHours(Number(inputValue));
    setSelectedType('custom');

    // 只有当输入的是有效数字时才更新时间
    const hours = parseFloat(inputValue);
    if (!isNaN(hours) && hours >= 0) {
      const newValue = dayjs()
        .subtract(hours, 'hour')
        .format('YYYY-MM-DDTHH:mm');
      onChange(newValue);
    }
  };

  // 处理自定义输入框点击
  const handleCustomInputClick = () => {
    setSelectedType('custom');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      {/* 时间选择按钮组 - 横向滚动 */}
      <div className="relative">
        <div className="flex items-center space-x-3 overflow-x-auto hide-scrollbar pb-2">
          {/* 现在 */}
          <button
            onClick={() => handleQuickOptionClick('now')}
            className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-btn transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              selectedType === 'now'
                ? 'bg-sleep text-white shadow-sm'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            <Icon
              icon="mdi:clock"
              className={`text-base ${
                selectedType === 'now' ? 'text-white' : 'text-text-tertiary'
              }`}
            />
            <span className="text-sm font-medium">现在</span>
          </button>

          {/* 1小时前 */}
          <button
            onClick={() => handleQuickOptionClick('1hour', 1)}
            className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-btn transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              selectedType === '1hour'
                ? 'bg-sleep text-white shadow-sm'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            <Icon
              icon="mdi:clock-minus"
              className={`text-base ${
                selectedType === '1hour' ? 'text-white' : 'text-text-tertiary'
              }`}
            />
            <span className="text-sm font-medium">1小时前</span>
          </button>

          {/* 2小时前 */}
          <button
            onClick={() => handleQuickOptionClick('2hour', 2)}
            className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-btn transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              selectedType === '2hour'
                ? 'bg-sleep text-white shadow-sm'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            <Icon
              icon="mdi:clock-minus-outline"
              className={`text-base ${
                selectedType === '2hour' ? 'text-white' : 'text-text-tertiary'
              }`}
            />
            <span className="text-sm font-medium">2小时前</span>
          </button>

          {/* 自定义输入框 */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div
              className={`flex items-center space-x-1 px-3 py-2.5 rounded-btn transition-all duration-200 ${
                selectedType === 'custom'
                  ? 'bg-sleep/10 border border-sleep'
                  : 'bg-gray-100 border border-transparent'
              }`}
            >
              <input
                type="number"
                value={customHours}
                onChange={(e) => handleCustomHoursChange(e.target.value)}
                onClick={handleCustomInputClick}
                placeholder="?"
                min="0"
                step="0.5"
                className={`w-6 px-1 py-0 text-center text-sm bg-transparent border-none outline-none ${
                  selectedType === 'custom'
                    ? 'text-sleep font-medium'
                    : 'text-text-secondary'
                }`}
              />
              <span
                className={`text-sm whitespace-nowrap ${
                  selectedType === 'custom'
                    ? 'text-sleep font-medium'
                    : 'text-text-secondary'
                }`}
              >
                小时前
              </span>
            </div>
          </div>
        </div>

        {/* 滚动提示渐变 */}
        <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default TimePicker;
