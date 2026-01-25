import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

/**
 * 新用户引导覆盖层
 * 首次启动时引导用户关注右侧的连接设置面板
 */
export function OnboardingOverlay() {
  const { t } = useTranslation();
  const {
    onboardingCompleted,
    setOnboardingCompleted,
    instanceConnectionStatus,
    instanceResourceLoaded,
    activeInstanceId,
    rightPanelWidth,
  } = useAppStore();

  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 检查是否应该显示引导
  useEffect(() => {
    // 已完成引导，不显示
    if (onboardingCompleted) return;

    // 延迟显示，等待界面渲染完成
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onboardingCompleted]);

  // 监听连接状态，一旦用户成功连接设备并加载资源，自动完成引导
  useEffect(() => {
    if (!isVisible || onboardingCompleted) return;

    const currentInstanceId = activeInstanceId;
    if (!currentInstanceId) return;

    const isConnected = instanceConnectionStatus[currentInstanceId] === 'Connected';
    const isResourceLoaded = instanceResourceLoaded[currentInstanceId];

    if (isConnected && isResourceLoaded) {
      handleDismiss();
    }
  }, [
    isVisible,
    onboardingCompleted,
    activeInstanceId,
    instanceConnectionStatus,
    instanceResourceLoaded,
  ]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setOnboardingCompleted(true);
    }, 200);
  };

  if (!isVisible) return null;

  // 连接设置卡片的位置参数
  const cardTop = 79; // 标签栏高度 + padding
  const cardHeight = 222; // 连接设置卡片的大致高度
  const cardRight = 5; // 右侧 padding
  const cardWidth = rightPanelWidth - 12; // 卡片宽度（减去一些边距）

  // 遮罩区域宽度（绿框左边缘到视口右边的距离）
  const rightMaskWidth = cardRight + cardWidth; // = rightPanelWidth - 7

  return (
    <div
      className={`fixed inset-0 z-40 pointer-events-none ${isExiting ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-300'}`}
    >
      {/* 半透明遮罩，只露出连接设置卡片 */}
      <div className="absolute inset-0 pointer-events-auto">
        {/* 左侧遮罩 - 从左边铺到绿框左边缘 */}
        <div
          className="absolute top-0 left-0 bottom-0 bg-black/40 backdrop-blur-[1px]"
          style={{ right: `${rightMaskWidth}px` }}
          onClick={handleDismiss}
        />
        {/* 右上遮罩（标签栏 + 连接设置上方） */}
        <div
          className="absolute top-0 right-0 bg-black/40 backdrop-blur-[1px]"
          style={{
            width: `${rightMaskWidth}px`,
            height: `${cardTop}px`,
          }}
          onClick={handleDismiss}
        />
        {/* 右下遮罩（连接设置下方） */}
        <div
          className="absolute right-0 bottom-0 bg-black/40 backdrop-blur-[1px]"
          style={{
            width: `${rightMaskWidth}px`,
            top: `${cardTop + cardHeight}px`,
          }}
          onClick={handleDismiss}
        />
      </div>

      {/* 引导提示气泡 - 指向连接设置卡片 */}
      <div
        className={`absolute pointer-events-auto ${isExiting ? 'animate-out slide-out-to-right-4 fade-out duration-200' : 'animate-in slide-in-from-right-4 fade-in duration-300 delay-150'}`}
        style={{
          top: `${cardTop + 40}px`,
          right: `calc(${rightPanelWidth}px + 20px)`,
        }}
      >
        <div className="relative bg-accent text-white rounded-xl shadow-2xl p-4 max-w-[280px]">
          {/* 箭头指向右侧 */}
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-accent" />

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">{t('onboarding.title')}</h3>
              <p className="text-xs text-white/90 leading-relaxed">{t('onboarding.message')}</p>
            </div>
          </div>

          {/* 按钮 */}
          <button
            onClick={handleDismiss}
            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            <span>{t('onboarding.gotIt')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 连接设置卡片高亮边框效果 */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: `${cardTop}px`,
          right: `${cardRight}px`,
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
        }}
      >
        <div className="w-full h-full rounded-lg ring-2 ring-accent ring-offset-2 ring-offset-transparent animate-pulse" />
      </div>
    </div>
  );
}
