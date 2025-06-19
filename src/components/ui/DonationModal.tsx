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
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

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

  // 保存二维码到相册
  const handleSaveQRCode = async () => {
    try {
      // 创建一个临时的a标签来下载图片
      const link = document.createElement('a');
      link.href = parseImg;
      link.download = '萌芽育儿-赞赏码.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 显示保存成功提示
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存图片失败:', error);
    }
  };

  // 长按保存处理
  const handleLongPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    handleSaveQRCode();
  };

  // 保存微信二维码到相册
  const handleSaveWeChatQR = async (
    e?: React.TouchEvent | React.MouseEvent,
  ) => {
    e?.preventDefault();
    try {
      // 创建一个临时的a标签来下载图片
      const link = document.createElement('a');
      link.href = userQrcode;
      link.download = '萌芽育儿-微信二维码.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 显示保存成功提示
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存图片失败:', error);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-md max-h-[90vh] overflow-hidden animate-modal-enter">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 bg-white bg-opacity-90 rounded-full shadow-md transition-all duration-200 hover:bg-opacity-100 hover:scale-110 backdrop-blur-sm"
        >
          <Icon icon="mdi:close" className="text-lg text-[#666666]" />
        </button>

        {/* 可滚动内容区域 */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* 内容区域 */}
          <div className="p-5">
            {/* 价值主张 - 简化版 */}
            <div className="text-center mb-5">
              <div className="text-lg font-semibold text-[#333333] mb-2 leading-relaxed">
                感谢您的支持 🙏
              </div>
              <div className="text-sm text-[#666666] leading-relaxed">
                已为 {supporterCount.toLocaleString()}+ 家庭提供育儿指导
              </div>
            </div>

            {/* 标签切换 */}
            <div className="flex bg-[#F8F9FA] rounded-2xl p-1 mb-5 shadow-inner">
              <button
                onClick={() => setActiveTab('donation')}
                className={`flex items-center justify-center flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'donation'
                    ? 'bg-white text-[#FF9800] shadow-md transform scale-[1.02]'
                    : 'text-[#666666] hover:text-[#333333]'
                }`}
              >
                <Icon icon="mdi:heart" className="w-5 h-5 mr-1.5" />
                赞赏支持
              </button>
              <button
                onClick={() => setActiveTab('wechat')}
                className={`flex items-center justify-center flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'wechat'
                    ? 'bg-white text-[#FF9800] shadow-md transform scale-[1.02]'
                    : 'text-[#666666] hover:text-[#333333]'
                }`}
              >
                <Icon icon="mdi:wechat" className="w-5 h-5 mr-1.5" />
                联系作者
              </button>
            </div>

            {/* 内容展示区域 */}
            {activeTab === 'donation' ? (
              <div>
                {/* 二维码展示 - 缩小尺寸 */}
                <div className="text-center">
                  <div className="w-full flex flex-col items-center bg-gradient-to-br from-[#FFF8F0] to-[#FFFAF7] rounded-2xl p-4 mb-4 border border-[#FFE5CC]">
                    <div className="bg-white rounded-xl p-4 shadow-lg inline-block border-2 border-[#FF9800] border-opacity-20">
                      <img
                        src={parseImg}
                        alt="支付二维码"
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer select-none"
                        onTouchStart={(e) => {
                          // 长按保存逻辑
                          const timeout = setTimeout(() => {
                            handleLongPress(e);
                          }, 800);
                          e.currentTarget.dataset.timeout = timeout.toString();
                        }}
                        onTouchEnd={(e) => {
                          const timeout = e.currentTarget.dataset.timeout;
                          if (timeout) {
                            clearTimeout(parseInt(timeout));
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleSaveQRCode();
                        }}
                      />
                    </div>

                    {/* 保存成功提示 */}
                    {showSaveSuccess && (
                      <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium animate-fade-in">
                        <Icon icon="mdi:check-circle" className="inline mr-1" />
                        已保存到下载文件夹
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="mt-4">
                      <button
                        onClick={handleSaveQRCode}
                        className="flex items-center justify-center px-10 py-2.5 bg-gradient-to-r from-[#FF9800] to-[#FFB74D] text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <Icon icon="mdi:download" className="mr-2" />
                        保存到相册
                      </button>
                    </div>
                  </div>

                  {/* 使用说明 */}
                  <div className="text-center mb-4">
                    <div className="text-sm text-[#666666] mb-3">
                      保存二维码，微信扫码支付
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-3 text-left">
                      <div className="space-y-2 text-xs text-[#666666] leading-relaxed">
                        <div className="flex items-center">
                          <span className="inline-block w-4 h-4 bg-[#FF9800] text-white rounded-full text-[10px] font-bold text-center leading-4 mr-3 flex-shrink-0">
                            1
                          </span>
                          <span>保存二维码</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-4 h-4 bg-[#FF9800] text-white rounded-full text-[10px] font-bold text-center leading-4 mr-3 flex-shrink-0">
                            2
                          </span>
                          <span>微信扫一扫</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-4 h-4 bg-[#FF9800] text-white rounded-full text-[10px] font-bold text-center leading-4 mr-3 flex-shrink-0">
                            3
                          </span>
                          <span>选择相册中的二维码</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 感谢文案 */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-[#333333]">
                      感谢您的每一份心意 ❤️
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* 微信联系 - 同样缩小尺寸 */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-2xl p-4 mb-4 border border-[#BAE6FD] w-full flex flex-col items-center">
                    <div className="bg-white rounded-xl p-4 shadow-lg inline-block border-2 border-[#0EA5E9] border-opacity-20">
                      <img
                        src={userQrcode}
                        alt="微信二维码"
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer select-none"
                        onTouchStart={(e) => {
                          // 长按保存逻辑
                          const timeout = setTimeout(() => {
                            handleSaveWeChatQR(e);
                          }, 800);
                          e.currentTarget.dataset.timeout = timeout.toString();
                        }}
                        onTouchEnd={(e) => {
                          const timeout = e.currentTarget.dataset.timeout;
                          if (timeout) {
                            clearTimeout(parseInt(timeout));
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleSaveWeChatQR(e);
                        }}
                      />
                    </div>

                    {/* 保存成功提示 */}
                    {showSaveSuccess && (
                      <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium animate-fade-in">
                        <Icon icon="mdi:check-circle" className="inline mr-1" />
                        已保存到下载文件夹
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="mt-4">
                      <button
                        onClick={handleSaveWeChatQR}
                        className="w-full flex items-center justify-center px-10 py-2.5 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <Icon icon="mdi:download" className="mr-2" />
                        保存到相册
                      </button>
                    </div>
                  </div>

                  {/* 使用说明 */}
                  <div className="text-center mb-4">
                    <div className="text-sm text-[#666666] mb-3">
                      保存二维码，微信添加好友
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-3 text-left">
                      <div className="space-y-2 text-xs text-[#666666] leading-relaxed">
                        <div className="flex items-center">
                          <span className="inline-block w-4 h-4 bg-[#0EA5E9] text-white rounded-full text-[10px] font-bold text-center leading-4 mr-3 flex-shrink-0">
                            1
                          </span>
                          <span>保存二维码</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-4 h-4 bg-[#0EA5E9] text-white rounded-full text-[10px] font-bold text-center leading-4 mr-3 flex-shrink-0">
                            2
                          </span>
                          <span>微信点击"+"</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-4 h-4 bg-[#0EA5E9] text-white rounded-full text-[10px] font-bold text-center leading-4 mr-3 flex-shrink-0">
                            3
                          </span>
                          <span>扫一扫选择二维码</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 联系说明 */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-[#333333] flex items-center justify-center mb-2">
                      <Icon
                        icon="mdi:chat-outline"
                        className="mr-2 text-[#0EA5E9]"
                      />
                      欢迎交流育儿心得
                    </div>
                    <div className="text-xs text-[#666666] leading-relaxed">
                      分享体验、获取内测权限、加入交流群
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DonationModal;
