import React from 'react';
import { Button } from '@/components/ui';
import { ChildResponseDto } from '@/types/models';
import { calculateAge } from '@/utils';

interface ChildCardProps {
  child: ChildResponseDto;
  onEdit?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onEdit,
  onSelect,
  isSelected = false,
}) => {
  const { nickname, dateOfBirth, gender } = child;

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  // 根据性别确定头像背景颜色
  const avatarBgColor =
    gender === 'male'
      ? 'bg-primary-light text-primary'
      : gender === 'female'
      ? 'bg-pink text-text-white'
      : 'bg-gray-300 text-text-primary';

  return (
    <div
      className={`rounded-card bg-gray-50 shadow-card p-4 flex items-center justify-between transition-all duration-200 
        ${isSelected ? 'border-2 border-primary' : 'border border-gray-200'} 
        ${onSelect ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        {/* 头像占位 */}
        <div
          className={`flex items-center justify-center w-12 h-12 text-xl font-bold rounded-full ${avatarBgColor}`}
        >
          {nickname?.[0] || '宝'}
        </div>
        <div>
          <div className="text-lg font-semibold text-text-primary">
            {nickname}
          </div>
          <div className="mt-1 text-sm text-text-tertiary">
            {calculateAge(dateOfBirth)} ·{' '}
            {new Date(dateOfBirth).toLocaleDateString()}
          </div>
          {gender && (
            <div className="text-sm text-text-tertiary">
              性别：
              {gender === 'male' ? '男' : gender === 'female' ? '女' : gender}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isSelected && (
          <div className="mr-2 text-sm font-medium text-primary">当前选中</div>
        )}
        <Button
          variant="secondary"
          className="px-3 py-1 text-sm"
          onClick={handleEditClick}
        >
          编辑
        </Button>
      </div>
    </div>
  );
};

export default ChildCard;
