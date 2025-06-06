import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button, NavBar, Toast } from '@/components/ui';
import { useUserStore } from '@/stores';
import { sendFeedback } from '@/api/auth';
import { FeedbackType, type FeedbackDto } from '@/types/models';

interface FormData {
  email: string;
  type: FeedbackType;
  title: string;
  content: string;
}

interface FormErrors {
  email?: string;
  title?: string;
  content?: string;
}

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();

  // 获取来源页面，默认为个人中心
  const fromPage = (location.state as any)?.from || '/profile';

  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    email: user?.email || '',
    type: FeedbackType.SUGGESTION,
    title: '',
    content: '',
  });

  // 表单验证错误
  const [errors, setErrors] = useState<FormErrors>({});

  // 加载状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast状态
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
  } | null>(null);

  // 反馈类型配置
  const feedbackTypes = [
    {
      value: FeedbackType.SUGGESTION,
      label: '功能建议',
      icon: 'mdi:lightbulb',
      color: '#66BB6A',
      bgColor: 'rgba(102, 187, 106, 0.1)',
      description: '对产品功能的改进建议',
    },
    {
      value: FeedbackType.BUG,
      label: '问题反馈',
      icon: 'mdi:bug',
      color: '#FF9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      description: '应用使用中遇到的问题',
    },
    {
      value: FeedbackType.FEATURE_REQUEST,
      label: '新功能请求',
      icon: 'mdi:plus-circle',
      color: '#4A90E2',
      bgColor: 'rgba(74, 144, 226, 0.1)',
      description: '希望增加的新功能',
    },
    {
      value: FeedbackType.PRAISE,
      label: '表扬夸赞',
      icon: 'mdi:heart',
      color: '#F8BBD0',
      bgColor: 'rgba(248, 187, 208, 0.1)',
      description: '对产品的肯定和赞美',
    },
    {
      value: FeedbackType.OTHER,
      label: '其他反馈',
      icon: 'mdi:message-text',
      color: '#999999',
      bgColor: 'rgba(153, 153, 153, 0.1)',
      description: '其他类型的意见反馈',
    },
  ];

  // 预设标题模板
  const titleTemplates = {
    [FeedbackType.SUGGESTION]: [
      '希望增加记录提醒功能',
      '建议优化数据统计界面',
      '希望支持数据导出功能',
    ],
    [FeedbackType.BUG]: ['应用闪退问题', '数据同步异常', '界面显示错误'],
    [FeedbackType.FEATURE_REQUEST]: [
      '添加成长曲线对比功能',
      '支持多宝宝账户切换',
      '增加育儿知识推送',
    ],
    [FeedbackType.PRAISE]: [
      '非常实用的育儿助手',
      '界面设计很温馨',
      '功能贴心实用',
    ],
    [FeedbackType.OTHER]: ['关于隐私保护的建议', '使用体验分享', '合作建议'],
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    } else if (formData.email.length > 255) {
      newErrors.email = '邮箱长度不能超过255个字符';
    }

    // 验证标题
    if (!formData.title.trim()) {
      newErrors.title = '反馈标题不能为空';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '反馈标题至少需要2个字符';
    } else if (formData.title.length > 200) {
      newErrors.title = '反馈标题不能超过200个字符';
    }

    // 验证内容
    if (!formData.content.trim()) {
      newErrors.content = '反馈内容不能为空';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = '反馈内容至少需要10个字符';
    } else if (formData.content.length > 2000) {
      newErrors.content = '反馈内容不能超过2000个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      setToast({ type: 'fail', content: '请检查输入信息' });
      return;
    }

    setIsSubmitting(true);
    setToast({ type: 'loading', content: '正在提交反馈...' });

    try {
      const feedbackData: FeedbackDto = {
        email: formData.email.trim(),
        type: formData.type,
        title: formData.title.trim(),
        content: formData.content.trim(),
      };

      const response = await sendFeedback(feedbackData);

      setToast({
        type: 'success',
        content: response.message || '反馈提交成功，感谢您的宝贵意见！',
      });

      // 成功后清空表单（保留邮箱）
      setFormData({
        email: formData.email,
        type: FeedbackType.SUGGESTION,
        title: '',
        content: '',
      });
      setErrors({});

      // 2秒后返回来源页面
      setTimeout(() => {
        navigate(fromPage);
      }, 2000);
    } catch (error: any) {
      console.error('提交反馈失败:', error);
      const errorMessage =
        error?.data?.message || error?.message || '提交失败，请稍后重试';
      setToast({ type: 'fail', content: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取当前选中类型的配置
  const currentTypeConfig = feedbackTypes.find(
    (t) => t.value === formData.type,
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FDFBF8] to-[#FFF8F4]">
      <NavBar title="建议与反馈" onBack={() => navigate(fromPage)} />

      <div className="flex-1 overflow-auto">
        <div className="px-4 pt-6 pb-8">
          {/* 温馨引导区域 */}
          <div className="mb-8">
            <div className="relative p-6 bg-gradient-to-br from-white via-[#FFF8F4] to-[#FFEFEB] rounded-3xl shadow-[0_8px_32px_rgba(255,179,138,0.12)] border border-[#FFE8D6] overflow-hidden">
              {/* 背景装饰元素 */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#66BB6A]/20 to-[#81C784]/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-[#4A90E2]/15 to-[#7AADEE]/10 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="flex justify-center items-center mr-4 w-12 h-12 bg-gradient-to-br from-[#66BB6A] to-[#81C784] rounded-2xl shadow-[0_6px_20px_rgba(102,187,106,0.4)]">
                    <Icon
                      icon="tabler:message-chatbot"
                      className="text-2xl text-white"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#333333] mb-1">
                      您的声音很重要
                    </h2>
                    <p className="text-sm text-[#666666]">
                      每一条反馈都是我们改进的动力
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#999999] leading-relaxed">
                  感谢您使用萌芽育儿！我们致力于为每位父母提供更好的育儿体验。请告诉我们您的想法、建议或遇到的问题，我们会认真对待每一条反馈。
                </p>
              </div>
            </div>
          </div>

          {/* 反馈类型选择 */}
          <div className="mb-8">
            <h3 className="flex items-center text-lg font-semibold text-[#333333] mb-4">
              <Icon
                icon="mdi:format-list-bulleted-type"
                className="mr-2 text-[#FFB38A]"
              />
              反馈类型
            </h3>

            <div className="space-y-3">
              {feedbackTypes.map((type) => (
                <div
                  key={type.value}
                  className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    formData.type === type.value
                      ? 'border-2 shadow-[0_4px_12px_rgba(255,179,138,0.15)]'
                      : 'border-[#E0E0E0] bg-white hover:border-[#FFB38A]/30 hover:shadow-md'
                  }`}
                  style={{
                    borderColor:
                      formData.type === type.value ? type.color : undefined,
                    background:
                      formData.type === type.value
                        ? `linear-gradient(to right, ${type.bgColor}, transparent)`
                        : undefined,
                  }}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: type.value }))
                  }
                >
                  {/* 选中指示器 */}
                  {formData.type === type.value && (
                    <div
                      className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                      style={{ backgroundColor: type.color }}
                    ></div>
                  )}

                  <div className="flex items-center">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl mr-3"
                      style={{
                        backgroundColor:
                          formData.type === type.value
                            ? type.color
                            : type.bgColor,
                      }}
                    >
                      <Icon
                        icon={type.icon}
                        className={`text-lg ${
                          formData.type === type.value ? 'text-white' : ''
                        }`}
                        style={{
                          color:
                            formData.type === type.value ? 'white' : type.color,
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-base font-medium text-[#333333] mr-2">
                          {type.label}
                        </span>
                        {formData.type === type.value && (
                          <Icon
                            icon="mdi:check-circle"
                            className="text-sm"
                            style={{ color: type.color }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-[#999999] mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 邮箱输入 */}
          <div className="mb-6">
            <label className="flex items-center text-base font-medium text-[#333333] mb-3">
              <Icon icon="mdi:email" className="mr-2 text-[#FFB38A]" />
              联系邮箱
              <span className="text-[#EF5350] ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="请输入您的邮箱地址"
                className={`w-full h-12 px-4 pr-12 text-base bg-white border rounded-xl transition-all duration-200 focus:outline-none ${
                  errors.email
                    ? 'border-[#EF5350] focus:border-[#EF5350] focus:shadow-[0_0_0_3px_rgba(239,83,80,0.1)]'
                    : 'border-[#E0E0E0] focus:border-[#FFB38A] focus:shadow-[0_0_0_3px_rgba(255,179,138,0.1)]'
                }`}
              />
              <Icon
                icon="mdi:email-outline"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#CCCCCC]"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-[#EF5350] mt-2 flex items-center">
                <Icon icon="mdi:alert-circle" className="mr-1" />
                {errors.email}
              </p>
            )}
            <p className="text-xs text-[#999999] mt-2">
              我们会通过此邮箱与您联系，请确保邮箱地址正确
            </p>
          </div>

          {/* 标题输入 */}
          <div className="mb-6">
            <label className="flex items-center text-base font-medium text-[#333333] mb-3">
              <Icon icon="mdi:format-title" className="mr-2 text-[#FFB38A]" />
              反馈标题
              <span className="text-[#EF5350] ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="简要描述您的反馈主题"
              maxLength={200}
              className={`w-full h-12 px-4 text-base bg-white border rounded-xl transition-all duration-200 focus:outline-none ${
                errors.title
                  ? 'border-[#EF5350] focus:border-[#EF5350] focus:shadow-[0_0_0_3px_rgba(239,83,80,0.1)]'
                  : 'border-[#E0E0E0] focus:border-[#FFB38A] focus:shadow-[0_0_0_3px_rgba(255,179,138,0.1)]'
              }`}
            />
            {errors.title && (
              <p className="text-sm text-[#EF5350] mt-2 flex items-center">
                <Icon icon="mdi:alert-circle" className="mr-1" />
                {errors.title}
              </p>
            )}

            {/* 预设标题模板 */}
            {currentTypeConfig && titleTemplates[formData.type] && (
              <div className="mt-3">
                <p className="text-xs text-[#999999] mb-2">💡 常见标题参考：</p>
                <div className="flex flex-wrap gap-2">
                  {titleTemplates[formData.type].map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, title: template }))
                      }
                      className="text-xs px-3 py-1.5 bg-[#FFB38A]/10 text-[#FFB38A] rounded-full border border-[#FFB38A]/20 hover:bg-[#FFB38A]/20 transition-colors duration-200"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs text-[#999999] mt-2">
              <span>2-200个字符</span>
              <span
                className={formData.title.length > 200 ? 'text-[#EF5350]' : ''}
              >
                {formData.title.length}/200
              </span>
            </div>
          </div>

          {/* 内容输入 */}
          <div className="mb-8">
            <label className="flex items-center text-base font-medium text-[#333333] mb-3">
              <Icon icon="mdi:message-text" className="mr-2 text-[#FFB38A]" />
              详细描述
              <span className="text-[#EF5350] ml-1">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="请详细描述您的反馈内容..."
              maxLength={2000}
              rows={6}
              className={`w-full p-4 text-base bg-white border rounded-xl transition-all duration-200 focus:outline-none resize-none ${
                errors.content
                  ? 'border-[#EF5350] focus:border-[#EF5350] focus:shadow-[0_0_0_3px_rgba(239,83,80,0.1)]'
                  : 'border-[#E0E0E0] focus:border-[#FFB38A] focus:shadow-[0_0_0_3px_rgba(255,179,138,0.1)]'
              }`}
            />
            {errors.content && (
              <p className="text-sm text-[#EF5350] mt-2 flex items-center">
                <Icon icon="mdi:alert-circle" className="mr-1" />
                {errors.content}
              </p>
            )}

            {/* 内容提示 */}
            <div className="mt-3 p-3 bg-[#F5F7FA] rounded-lg">
              <p className="text-xs text-[#666666] mb-2">
                💡 为了更好地帮助您，建议包含以下信息：
              </p>
              <ul className="text-xs text-[#999999] space-y-1">
                <li>• 使用场景和具体操作步骤</li>
                <li>• 期望的功能或改进效果</li>
                <li>• 您的设备信息（可选）</li>
              </ul>
            </div>

            <div className="flex justify-between text-xs text-[#999999] mt-2">
              <span>至少10个字符</span>
              <span
                className={
                  formData.content.length > 2000 ? 'text-[#EF5350]' : ''
                }
              >
                {formData.content.length}/2000
              </span>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full py-4 text-base font-medium bg-gradient-to-r from-[#FFB38A] to-[#FFC9A8] hover:from-[#FF9F73] hover:to-[#FFB38A] text-white rounded-2xl transition-all duration-300 shadow-[0_8px_24px_rgba(255,179,138,0.3)] hover:shadow-[0_12px_32px_rgba(255,179,138,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon icon="mdi:loading" className="mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Icon icon="mdi:send" className="mr-2" />
                  提交反馈
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              className="w-full py-3 text-base font-medium text-[#999999] border-[#E0E0E0] hover:bg-[#F5F7FA] rounded-2xl transition-all duration-300"
              onClick={() => navigate('/profile')}
              disabled={isSubmitting}
            >
              <Icon icon="mdi:arrow-left" className="mr-2" />
              返回个人中心
            </Button>
          </div>
        </div>

        {/* 底部安全区域 */}
        <div className="safe-bottom"></div>
      </div>

      {/* 渲染Toast */}
      {toast && (
        <Toast
          type={toast.type}
          content={toast.content}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Feedback;
