import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { NavBar } from '@/components/ui';

const UserAgreement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/profile';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FDFBF8] to-[#FFF8F4]">
      <NavBar title="用户协议" onBack={() => navigate(from)} />

      <div className="flex-1 overflow-auto">
        <div className="px-4 pt-6 pb-8">
          {/* 协议标题 */}
          <div className="mb-8">
            <div className="relative p-6 bg-gradient-to-br from-white via-[#FFF8F4] to-[#FFEFEB] rounded-3xl shadow-[0_8px_32px_rgba(255,179,138,0.12)] border border-[#FFE8D6] overflow-hidden backdrop-blur-sm">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#FFB38A]/20 to-[#FFC9A8]/10 rounded-full blur-2xl"></div>
              <div className="absolute top-4 right-4 opacity-10">
                <Icon
                  icon="mdi:file-document-check"
                  className="text-3xl text-[#FFB38A]"
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  <div className="flex justify-center items-center mr-4 w-12 h-12 bg-[#FFB38A] rounded-xl">
                    <Icon
                      icon="mdi:shield-check"
                      className="text-2xl text-white"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-[#333333]">
                      萌芽育儿用户协议
                    </h1>
                    <p className="text-sm text-[#666666] mt-1">
                      保护您和宝宝的权益
                    </p>
                  </div>
                </div>
                <div className="text-xs text-[#999999] mt-4">
                  生效日期：2024年1月1日 | 最后更新：2024年1月1日
                </div>
              </div>
            </div>
          </div>

          {/* 协议内容 */}
          <div className="space-y-6">
            {/* 欢迎语 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:heart"
                  className="text-[#FFB38A] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  欢迎使用萌芽育儿
                </h2>
              </div>
              <div className="text-sm text-[#666666] leading-relaxed">
                感谢您选择萌芽育儿作为您的育儿伙伴。我们深知育儿的珍贵与不易，致力于为您和宝宝提供安全、专业、贴心的服务。请您仔细阅读本协议，它将帮助您了解我们的服务内容以及您的权利和义务。
              </div>
            </div>

            {/* 第一条：服务概述 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:baby-face"
                  className="text-[#56C0E0] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第一条 服务概述
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>
                  1.1
                  萌芽育儿是一款专业的育儿记录与智能咨询应用，由开发者"观默"开发和运营。
                </p>
                <p>1.2 我们的服务包括但不限于：</p>
                <ul className="ml-4 space-y-1">
                  <li>• 儿童成长记录功能（喂养、睡眠、排便、身高体重等）</li>
                  <li>• 智能育儿咨询与建议</li>
                  <li>• 成长数据分析与可视化</li>
                  <li>• 育儿知识分享与社区交流</li>
                </ul>
                <p>
                  1.3
                  本应用仅供辅助育儿参考，不能替代专业医疗建议，如有健康问题请及时咨询专业医生。
                </p>
              </div>
            </div>

            {/* 第二条：账户注册与使用 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:account-circle"
                  className="text-[#66BB6A] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第二条 账户注册与使用
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>
                  2.1
                  您需要提供真实、准确、完整的信息进行注册，并及时更新相关信息。
                </p>
                <p>
                  2.2
                  您应当妥善保管账户密码，对于因密码泄露导致的损失，我们不承担责任。
                </p>
                <p>2.3 一个账户仅限一人使用，不得转让、出售或与他人共享。</p>
                <p>
                  2.4 您有权随时注销账户，注销后相关数据将按照隐私政策进行处理。
                </p>
              </div>
            </div>

            {/* 第三条：儿童隐私保护 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:shield-star"
                  className="text-[#F8BBD0] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第三条 儿童隐私保护
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>
                  3.1
                  我们高度重视儿童隐私保护，严格遵守《个人信息保护法》及相关法律法规。
                </p>
                <p>3.2 收集儿童信息的目的：</p>
                <ul className="ml-4 space-y-1">
                  <li>• 提供个性化的育儿记录服务</li>
                  <li>• 生成成长曲线和发育评估</li>
                  <li>• 提供精准的育儿建议</li>
                </ul>
                <p>
                  3.3
                  我们不会将儿童信息用于商业营销，不会向第三方出售或泄露儿童信息。
                </p>
                <p>
                  3.4
                  家长有权查看、更正、删除儿童信息，可通过应用内设置或联系我们进行操作。
                </p>
              </div>
            </div>

            {/* 第四条：数据收集与使用 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:database-lock"
                  className="text-[#FFA726] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第四条 数据收集与使用
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>4.1 我们收集的信息类型：</p>
                <ul className="ml-4 space-y-1">
                  <li>• 账户信息：邮箱、昵称等注册信息</li>
                  <li>• 儿童信息：姓名、出生日期、性别等基本信息</li>
                  <li>• 记录数据：喂养、睡眠、成长等日常记录</li>
                  <li>• 设备信息：设备型号、操作系统等技术信息</li>
                </ul>
                <p>4.2 数据使用目的：</p>
                <ul className="ml-4 space-y-1">
                  <li>• 提供和改进服务功能</li>
                  <li>• 生成个性化建议和报告</li>
                  <li>• 保障应用安全和稳定运行</li>
                  <li>• 遵守法律法规要求</li>
                </ul>
                <p>
                  4.3
                  我们采用业界标准的安全措施保护您的数据，包括数据加密、访问控制等。
                </p>
              </div>
            </div>

            {/* 第五条：用户权利与义务 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:balance-scale"
                  className="text-[#9C27B0] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第五条 用户权利与义务
                </h2>
              </div>
              <div className="space-y-4 text-sm text-[#666666] leading-relaxed">
                <div>
                  <p className="font-medium text-[#333333] mb-2">您的权利：</p>
                  <ul className="ml-4 space-y-1">
                    <li>• 免费使用本应用的基础功能</li>
                    <li>• 查看、修改、删除您的个人信息</li>
                    <li>• 导出您的育儿记录数据</li>
                    <li>• 获得客户服务支持</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[#333333] mb-2">您的义务：</p>
                  <ul className="ml-4 space-y-1">
                    <li>• 遵守相关法律法规和本协议条款</li>
                    <li>• 提供真实准确的信息</li>
                    <li>• 不得利用本应用从事违法活动</li>
                    <li>• 尊重他人隐私和权益</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 第六条：服务限制与免责声明 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:alert-circle"
                  className="text-[#EF5350] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第六条 服务限制与免责声明
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>6.1 本应用提供的建议仅供参考，不构成医疗诊断或治疗建议。</p>
                <p>
                  6.2
                  我们努力保证服务的稳定性，但不保证服务不会中断或完全无错误。
                </p>
                <p>
                  6.3
                  因不可抗力、网络故障、系统维护等原因导致的服务中断，我们不承担责任。
                </p>
                <p>6.4 您因使用本应用而做出的育儿决策，后果由您自行承担。</p>
                <p>
                  6.5
                  我们保留在必要时修改、暂停或终止服务的权利，并会提前通知用户。
                </p>
              </div>
            </div>

            {/* 第七条：知识产权 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:copyright"
                  className="text-[#FF9800] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第七条 知识产权
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>
                  7.1
                  本应用的软件、界面设计、文字、图片等内容的知识产权归我们所有。
                </p>
                <p>
                  7.2
                  您对自己输入的数据享有相应权利，但授权我们为提供服务而使用。
                </p>
                <p>
                  7.3
                  未经许可，您不得复制、修改、传播本应用的内容或进行反向工程。
                </p>
              </div>
            </div>

            {/* 第八条：协议修改 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:file-edit"
                  className="text-[#4CAF50] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第八条 协议修改
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>8.1 我们可能会根据法律法规变化或业务发展需要修改本协议。</p>
                <p>8.2 协议修改后，我们会通过应用内通知或其他方式告知您。</p>
                <p>8.3 如您不同意修改后的协议，可以停止使用服务并注销账户。</p>
                <p>8.4 继续使用服务即表示您同意修改后的协议条款。</p>
              </div>
            </div>

            {/* 第九条：争议解决 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:gavel"
                  className="text-[#795548] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第九条 争议解决
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>9.1 本协议的签订、履行和解释均适用中华人民共和国法律。</p>
                <p>9.2 如发生争议，双方应友好协商解决。</p>
                <p>9.3 协商不成的，可向有管辖权的人民法院提起诉讼。</p>
              </div>
            </div>

            {/* 第十条：联系我们 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
              <div className="flex items-center mb-4">
                <Icon
                  icon="mdi:email-heart"
                  className="text-[#E91E63] mr-2 text-xl"
                />
                <h2 className="text-lg font-semibold text-[#333333]">
                  第十条 联系我们
                </h2>
              </div>
              <div className="space-y-3 text-sm text-[#666666] leading-relaxed">
                <p>
                  如果您对本协议有任何疑问或建议，欢迎通过以下方式联系我们：
                </p>
                <div className="bg-[#FFF8F4] rounded-xl p-4 space-y-2">
                  <div className="flex items-center">
                    <Icon icon="mdi:email" className="text-[#FFB38A] mr-2" />
                    <span className="font-medium">意见反馈：</span>
                    <span className="text-[#FFB38A]">通过应用内反馈功能</span>
                  </div>
                  <div className="flex items-center">
                    <Icon icon="mdi:account" className="text-[#FFB38A] mr-2" />
                    <span className="font-medium">开发者：</span>
                    <span>观默</span>
                  </div>
                  <div className="flex items-center">
                    <Icon icon="mdi:update" className="text-[#FFB38A] mr-2" />
                    <span className="font-medium">响应时间：</span>
                    <span>我们会在7个工作日内回复您的咨询</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 协议结尾 */}
            <div className="bg-gradient-to-r from-[#FFB38A]/10 to-[#F8BBD0]/10 rounded-2xl p-6 border border-[#FFB38A]/20">
              <div className="text-center">
                <Icon
                  icon="mdi:heart-multiple"
                  className="text-3xl text-[#FFB38A] mx-auto mb-3"
                />
                <p className="text-sm text-[#666666] leading-relaxed mb-2">
                  感谢您信任萌芽育儿，让我们一起记录宝宝的美好成长时光！
                </p>
                <p className="text-xs text-[#999999]">
                  再次提醒：本协议自您开始使用萌芽育儿服务时生效
                </p>
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

export default UserAgreement;
