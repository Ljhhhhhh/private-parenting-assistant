import React from 'react';
// import logoImage from '@/assets/logo.png';
import LogoImage from '@/assets/logo.svg?react';

interface WelcomeScreenProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-full">
      <div className="w-36 h-36 mb-4 animate-float flex items-center justify-center text-[#FFB38A]">
        <LogoImage className="w-full h-full" />
      </div>
      <p className="mb-6 text-lg font-medium text-center text-[#666666]">
        有什么育儿问题，请随时向我提问
      </p>

      {/* 智能建议卡片 */}
      <div className="overflow-x-auto pb-4 w-full hide-scrollbar">
        <div className="flex gap-3 px-1 pb-2 w-max">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="p-4 min-w-[180px] max-w-[220px] bg-gradient-to-br from-white to-[#FFF8F5] rounded-xl shadow-sm border border-[#FFE5D6] transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95 text-left"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <div className="text-base text-[#333333]">{suggestion}</div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        /* 隐藏滚动条但保持功能 */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
