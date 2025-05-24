import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { getChatSuggestions } from '@/api/chat';

interface SmartSuggestionsProps {
  childId: number;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
  maxVisible?: number;
}

interface SuggestionCategory {
  title: string;
  icon: string;
  suggestions: string[];
  color: string;
}

/**
 * 智能建议组件
 * 支持分类建议、个性化推荐和预设问题
 */
export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  childId,
  onSuggestionClick,
  className = '',
  maxVisible = 8,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<SuggestionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 预设分类建议
  const defaultCategories: SuggestionCategory[] = [
    {
      title: '健康护理',
      icon: 'ph:heartbeat',
      color: '#FF6B6B',
      suggestions: [
        '宝宝发烧怎么办？',
        '如何判断宝宝是否生病？',
        '宝宝咳嗽要注意什么？',
        '如何预防宝宝感冒？',
        '宝宝接种疫苗后的注意事项',
      ],
    },
    {
      title: '营养喂养',
      icon: 'ph:bowl',
      color: '#4ECDC4',
      suggestions: [
        '如何判断宝宝是否缺乏营养？',
        '什么时候可以添加辅食？',
        '宝宝不爱吃饭怎么办？',
        '母乳喂养的注意事项',
        '如何选择适合的奶粉？',
      ],
    },
    {
      title: '睡眠行为',
      icon: 'ph:moon',
      color: '#A8E6CF',
      suggestions: [
        '宝宝睡眠不规律怎么调整？',
        '如何建立良好的睡眠习惯？',
        '宝宝夜里频繁醒来怎么办？',
        '白天不睡觉的原因',
        '什么时候可以让宝宝独立睡觉？',
      ],
    },
    {
      title: '成长发育',
      icon: 'ph:plant',
      color: '#FFD93D',
      suggestions: [
        '宝宝什么时候会坐会爬？',
        '如何促进宝宝大脑发育？',
        '语言发育迟缓怎么办？',
        '如何训练宝宝的精细动作？',
        '宝宝身高体重不达标怎么办？',
      ],
    },
  ];

  // 加载API建议
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        const apiSuggestions = await getChatSuggestions(childId);
        setSuggestions(apiSuggestions || []);
        setCategories(defaultCategories);
      } catch (error) {
        console.error('获取智能建议失败:', error);
        // 使用默认分类
        setCategories(defaultCategories);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [childId]);

  // 获取显示的建议列表
  const getDisplaySuggestions = useCallback(() => {
    if (selectedCategory) {
      const category = categories.find((cat) => cat.title === selectedCategory);
      return category?.suggestions || [];
    }

    // 混合API建议和默认建议
    const allSuggestions = [
      ...suggestions,
      ...defaultCategories.flatMap((cat) => cat.suggestions.slice(0, 2)),
    ];

    return allSuggestions.slice(0, maxVisible);
  }, [selectedCategory, categories, suggestions, maxVisible]);

  // 处理分类点击
  const handleCategoryClick = useCallback(
    (categoryTitle: string) => {
      setSelectedCategory(
        selectedCategory === categoryTitle ? null : categoryTitle,
      );
    },
    [selectedCategory],
  );

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Icon
          icon="ph:spinner"
          width={32}
          height={32}
          className="text-[#FFB38A] animate-spin"
        />
      </div>
    );
  }

  const displaySuggestions = getDisplaySuggestions();

  return (
    <div className={`w-full ${className}`}>
      {/* 分类标签 */}
      <div className="mb-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 pb-2 w-max">
          {categories.map((category) => (
            <button
              key={category.title}
              onClick={() => handleCategoryClick(category.title)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.title
                  ? 'bg-[#FFB38A] text-white shadow-sm'
                  : 'bg-white border border-[#E0E0E0] text-[#666666] hover:border-[#FFB38A] hover:text-[#FFB38A]'
              }`}
            >
              <Icon
                icon={category.icon}
                width={16}
                height={16}
                style={{
                  color:
                    selectedCategory === category.title
                      ? 'white'
                      : category.color,
                }}
              />
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* 建议卡片 */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 pb-2 w-max">
          {displaySuggestions.map((suggestion, index) => {
            // 找到当前建议所属的分类
            const category = categories.find((cat) =>
              cat.suggestions.includes(suggestion),
            );

            return (
              <button
                key={`${selectedCategory || 'mixed'}-${index}`}
                className="p-4 min-w-[180px] max-w-[220px] bg-gradient-to-br from-white to-[#FFF8F5] rounded-xl shadow-sm border border-[#FFE5D6] transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95 text-left group"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-2 mb-2">
                  {category && (
                    <Icon
                      icon={category.icon}
                      width={18}
                      height={18}
                      style={{ color: category.color }}
                      className="flex-shrink-0 mt-0.5"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-base text-[#333333] leading-snug">
                      {suggestion}
                    </div>
                  </div>
                </div>

                {/* 悬停时显示发送图标 */}
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon
                    icon="ph:arrow-right"
                    width={16}
                    height={16}
                    className="text-[#FFB38A]"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 空状态提示 */}
      {displaySuggestions.length === 0 && (
        <div className="text-center py-8">
          <Icon
            icon="ph:lightbulb"
            width={48}
            height={48}
            className="mx-auto mb-2 text-[#E0E0E0]"
          />
          <p className="text-[#999999] text-sm">暂无建议，试试选择其他分类</p>
        </div>
      )}

      {/* 样式 */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
