import React from 'react';
import { NavBar } from '@/components/ui';
import { Icon } from '@iconify/react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF8]">
      <NavBar title="隐私政策" />

      <div className="overflow-auto flex-1">
        <div className="px-5 pt-4 pb-8">
          {/* 头部说明 */}
          <div className="mb-6 p-5 bg-gradient-to-br from-white to-[#FFF8F4] rounded-xl border border-[#F0F0F0]">
            <div className="flex items-center mb-3">
              <Icon
                icon="mdi:shield-check"
                className="mr-3 text-2xl text-[#4A90E2]"
              />
              <h1 className="text-xl font-semibold text-[#333333]">
                萌芽育儿助手隐私政策
              </h1>
            </div>
            <p className="text-sm text-[#666666] leading-relaxed">
              我们非常重视您的隐私保护。本政策详细说明了我们如何收集、使用、存储和保护您的个人信息。
            </p>
            <div className="mt-3 text-xs text-[#999999]">
              最后更新时间：2024年1月1日
            </div>
          </div>

          {/* 信息收集 */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              <div className="p-5 border-b border-[#F0F0F0]">
                <h2 className="flex items-center text-lg font-semibold text-[#333333] mb-3">
                  <Icon icon="mdi:database" className="mr-2 text-[#FFB38A]" />
                  信息收集
                </h2>
                <div className="space-y-4 text-sm text-[#666666] leading-relaxed">
                  <div>
                    <h3 className="font-medium text-[#333333] mb-2">
                      我们收集的信息类型：
                    </h3>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>账户信息：邮箱地址、用户ID等注册必需信息</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>儿童信息：昵称、出生日期、性别等基本信息</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>记录数据：睡眠、喂养、排便等日常记录信息</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>使用数据：应用使用情况、功能偏好等</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 信息使用 */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              <div className="p-5 border-b border-[#F0F0F0]">
                <h2 className="flex items-center text-lg font-semibold text-[#333333] mb-3">
                  <Icon icon="mdi:cogs" className="mr-2 text-[#FFB38A]" />
                  信息使用
                </h2>
                <div className="space-y-4 text-sm text-[#666666] leading-relaxed">
                  <div>
                    <h3 className="font-medium text-[#333333] mb-2">
                      我们使用您的信息用于：
                    </h3>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>提供核心功能服务，如记录管理、数据分析</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>生成个性化的育儿建议和报告</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>改善应用性能和用户体验</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>提供技术支持和客户服务</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 信息保护 */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              <div className="p-5 border-b border-[#F0F0F0]">
                <h2 className="flex items-center text-lg font-semibold text-[#333333] mb-3">
                  <Icon
                    icon="mdi:shield-lock"
                    className="mr-2 text-[#FFB38A]"
                  />
                  信息保护
                </h2>
                <div className="space-y-4 text-sm text-[#666666] leading-relaxed">
                  <div>
                    <h3 className="font-medium text-[#333333] mb-2">
                      安全措施：
                    </h3>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>使用行业标准的加密技术保护数据传输</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>实施严格的访问控制和权限管理</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>定期进行安全审计和漏洞检测</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>数据存储在安全的云服务器中</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 用户权利 */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              <div className="p-5 border-b border-[#F0F0F0]">
                <h2 className="flex items-center text-lg font-semibold text-[#333333] mb-3">
                  <Icon
                    icon="mdi:account-check"
                    className="mr-2 text-[#FFB38A]"
                  />
                  您的权利
                </h2>
                <div className="space-y-4 text-sm text-[#666666] leading-relaxed">
                  <div>
                    <h3 className="font-medium text-[#333333] mb-2">
                      您有权：
                    </h3>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>访问和查看您的个人信息</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>更正不准确或不完整的信息</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>删除您的账户和相关数据</span>
                      </li>
                      <li className="flex items-start">
                        <Icon
                          icon="mdi:circle-small"
                          className="mt-1 mr-1 text-[#FFB38A]"
                        />
                        <span>导出您的数据备份</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 联系我们 */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              <div className="p-5">
                <h2 className="flex items-center text-lg font-semibold text-[#333333] mb-3">
                  <Icon icon="mdi:email" className="mr-2 text-[#FFB38A]" />
                  联系我们
                </h2>
                <div className="text-sm text-[#666666] leading-relaxed">
                  <p className="mb-3">
                    如果您对本隐私政策有任何疑问或需要帮助，请通过以下方式联系我们：
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Icon icon="mdi:email" className="mr-2 text-[#4A90E2]" />
                      <span>邮箱：privacy@mengya.app</span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="mdi:web" className="mr-2 text-[#4A90E2]" />
                      <span>网站：www.mengya.app</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 政策更新 */}
          <div className="p-4 bg-[#FFF8F4] rounded-xl border border-[#FFB38A]/20">
            <div className="flex items-start">
              <Icon
                icon="mdi:information"
                className="mr-2 mt-0.5 text-[#FFB38A]"
              />
              <div className="text-sm text-[#666666]">
                <span className="font-medium text-[#333333]">政策更新：</span>
                我们可能会不时更新本隐私政策。当有重大变更时，我们会通过应用内通知或邮件的方式告知您。
              </div>
            </div>
          </div>
        </div>

        {/* 底部安全区域 */}
        <div className="safe-bottom"></div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
