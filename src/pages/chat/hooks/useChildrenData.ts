import { useState, useCallback, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { childrenApi } from '../../../api';
import { ChildPublic } from '../../../types/api';

/**
 * 管理儿童数据的自定义Hook
 * @param initialChildId 初始选中的儿童ID
 * @returns 儿童数据和相关操作
 */
export const useChildrenData = (initialChildId?: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [children, setChildren] = useState<ChildPublic[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(initialChildId);
  const [selectedChild, setSelectedChild] = useState<ChildPublic | null>(null);
  const [showChildPrompt, setShowChildPrompt] = useState<boolean>(false);

  // 获取儿童列表
  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      const response = await childrenApi.getChildren();
      setChildren(response.data);

      // 如果有选定的儿童ID，找到对应的儿童信息
      if (selectedChildId) {
        const child = response.data.find((c) => c.id === selectedChildId);
        if (child) {
          setSelectedChild(child);
        }
      }

      // 如果没有儿童信息，显示提示
      if (response.data.length === 0) {
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
      const child = children.find((c) => c.id === selectedChildId);
      setSelectedChild(child || null);
    } else {
      setSelectedChild(null);
    }
  }, [selectedChildId, children]);

  // 选择儿童
  const handleSelectChild = (childId: string) => {
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
