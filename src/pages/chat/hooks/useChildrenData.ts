import { useState, useCallback, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { getAllChildren } from '../../../api/children';
import { ChildResponseDto } from '../../../types/models';

/**
 * 管理儿童数据的自定义Hook
 * @param initialChildId 初始选中的儿童ID
 * @returns 儿童数据和相关操作
 */
export const useChildrenData = (initialChildId?: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [children, setChildren] = useState<ChildResponseDto[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(initialChildId ? Number(initialChildId) : undefined);
  const [selectedChild, setSelectedChild] = useState<ChildResponseDto | null>(null);
  const [showChildPrompt, setShowChildPrompt] = useState<boolean>(false);

  // 获取儿童列表
  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllChildren();
      setChildren(response);

      // 如果有选定的儿童ID，找到对应的儿童信息
      if (selectedChildId) {
        const child = response.find((c: ChildResponseDto) => c.id === selectedChildId);
        if (child) {
          setSelectedChild(child);
        }
      }

      // 如果没有儿童信息，显示提示
      if (response.length === 0) {
        setShowChildPrompt(true);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
      Toast.show({
        icon: 'fail',
        content: '获取宝宝信息失败',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  // 当选择的儿童ID变化时，更新选择的儿童信息
  useEffect(() => {
    if (selectedChildId && children.length > 0) {
      const child = children.find((c: ChildResponseDto) => c.id === selectedChildId);
      setSelectedChild(child || null);
    } else {
      setSelectedChild(null);
    }
  }, [selectedChildId, children]);

  // 选择儿童
  const handleSelectChild = (childId: number) => {
    setSelectedChildId(childId);
  };

  return {
    loading,
    children,
    selectedChildId,
    selectedChild,
    showChildPrompt,
    setShowChildPrompt,
    fetchChildren,
    handleSelectChild,
    setSelectedChildId,
  };
};
