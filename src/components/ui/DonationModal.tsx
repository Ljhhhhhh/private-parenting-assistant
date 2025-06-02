import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import parseImg from '@/assets/praise.jpg';
import userQrcode from '@/assets/userQrcode.jpg';

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'donation' | 'wechat';

const DonationModal: React.FC<DonationModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('donation');
  const [supporterCount, setSupporterCount] = useState(0);

  // 模拟支持者数量动画
  useEffect(() => {
    if (visible) {
      let count = 0;
      const target = 1247; // 模拟已有支持者数量
      const increment = target / 30;
      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          setSupporterCount(target);
          clearInterval(timer);
        } else {
          setSupporterCount(Math.floor(count));
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] max-w-md w-full mx-4 overflow-hidden animate-modal-enter">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-[5px] right-[5px] z-10 flex items-center justify-center w-10 h-10 bg-white bg-opacity-90 rounded-full shadow-lg transition-all duration-200 hover:bg-opacity-100 hover:scale-110 backdrop-blur-sm"
        >
          <Icon icon="mdi:close" className="text-xl text-[#666666]" />
        </button>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 价值主张 */}
          <div className="text-center mb-6">
            <div className="text-lg font-semibold text-[#333333] mb-3 leading-relaxed">
              您的每一份支持，都是对
              <span className="text-[#FF9800] mx-1">10000+ 行</span>
              代码的认可 🙏
            </div>
            <div className="text-sm text-[#666666] leading-relaxed space-y-1">
              <div>
                • 免费为 {supporterCount.toLocaleString()}+ 家庭提供专业育儿指导
              </div>
              <div>• 涵盖喂养、睡眠、发育等 50+ 个育儿场景</div>
              <div>• 基于 100+ 权威育儿资料精心打造</div>
            </div>
          </div>

          {/* 标签切换 */}
          <div className="flex bg-[#F8F9FA] rounded-2xl p-1.5 mb-6 shadow-inner">
            <button
              onClick={() => setActiveTab('donation')}
              className={`flex items-center justify-center flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'donation'
                  ? 'bg-white text-[#FF9800] shadow-lg transform scale-[1.02]'
                  : 'text-[#666666] hover:text-[#333333]'
              }`}
            >
              <Icon icon="mdi:heart" className="w-6 h-6 mr-2 text-base" />
              赞赏支持
            </button>
            <button
              onClick={() => setActiveTab('wechat')}
              className={`flex items-center justify-center flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'wechat'
                  ? 'bg-white text-[#FF9800] shadow-lg transform scale-[1.02]'
                  : 'text-[#666666] hover:text-[#333333]'
              }`}
            >
              <Icon icon="mdi:wechat" className="w-6 h-6 mr-2 text-base" />
              <span>联系作者</span>
            </button>
          </div>

          {/* 内容展示区域 */}
          {activeTab === 'donation' ? (
            <div>
              {/* 二维码展示 */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFFAF7] rounded-3xl p-6 mb-4 border border-[#FFE5CC]">
                  <div className="bg-white rounded-2xl p-6 shadow-xl inline-block border-4 border-[#FF9800] border-opacity-20">
                    <img
                      src={parseImg}
                      alt="支付二维码"
                      className="w-48 h-48 object-cover rounded-xl"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center text-sm text-[#FF9800] font-medium">
                    <Icon
                      icon="mdi:qrcode-scan"
                      className="mr-2 text-lg animate-pulse"
                    />
                    微信扫码支付
                  </div>
                </div>

                {/* 感谢文案 */}
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-[#333333]">
                    感谢您的每一份心意 ❤️
                  </div>
                  <div className="text-xs text-[#999999]">
                    您的支持是我持续优化的最大动力
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* 微信联系 */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-3xl p-6 mb-4 border border-[#BAE6FD]">
                  <div className="bg-white rounded-2xl p-6 shadow-xl inline-block border-4 border-[#0EA5E9] border-opacity-20">
                    <img
                      src={userQrcode}
                      alt="微信二维码"
                      className="w-48 h-48 object-cover rounded-xl"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center text-sm text-[#0EA5E9] font-medium">
                    <Icon icon="mdi:wechat" className="mr-2 text-lg" />
                    微信扫码添加好友
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-[#333333] flex items-center justify-center">
                    <Icon
                      icon="mdi:chat-outline"
                      className="mr-2 text-[#0EA5E9]"
                    />
                    欢迎交流育儿心得
                  </div>
                  <div className="text-xs text-[#666666] leading-relaxed space-y-1">
                    <div>• 分享您的使用体验和建议</div>
                    <div>• 获取最新功能预览和内测权限</div>
                    <div>• 加入育儿交流群，与千万家长互动</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(40px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-modal-enter {
          animation: modal-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DonationModal;
