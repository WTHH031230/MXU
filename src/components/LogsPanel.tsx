import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { ContextMenu, useContextMenu, type MenuItem } from './ContextMenu';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export function LogsPanel() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { sidePanelExpanded, toggleSidePanelExpanded } = useAppStore();
  const { state: menuState, show: showMenu, hide: hideMenu } = useContextMenu();

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleClear = () => {
    setLogs([]);
  };

  const handleCopyAll = () => {
    const text = logs
      .map((log) => `[${log.timestamp.toLocaleTimeString()}] ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  // 右键菜单处理
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const menuItems: MenuItem[] = [
        {
          id: 'copy',
          label: t('logs.copyAll'),
          icon: Copy,
          disabled: logs.length === 0,
          onClick: handleCopyAll,
        },
        {
          id: 'clear',
          label: t('logs.clear'),
          icon: Trash2,
          disabled: logs.length === 0,
          danger: true,
          onClick: handleClear,
        },
        { id: 'divider-1', label: '', divider: true },
        {
          id: 'toggle-panel',
          label: sidePanelExpanded ? t('logs.collapse') : t('logs.expand'),
          icon: sidePanelExpanded ? ChevronUp : ChevronDown,
          onClick: toggleSidePanelExpanded,
        },
      ];

      showMenu(e, menuItems);
    },
    [t, logs.length, sidePanelExpanded, handleCopyAll, handleClear, toggleSidePanelExpanded, showMenu]
  );

  return (
    <div className="flex-1 flex flex-col bg-bg-secondary rounded-lg border border-border overflow-hidden">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium text-text-primary">
          {t('logs.title')}
        </span>
        <div className="flex items-center gap-1">
          {/* 展开/折叠上方面板 */}
          <button
            onClick={toggleSidePanelExpanded}
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              !sidePanelExpanded
                ? 'text-accent bg-accent-light'
                : 'text-text-secondary hover:bg-bg-hover'
            )}
            title={sidePanelExpanded ? t('logs.collapse') : t('logs.expand')}
          >
            {sidePanelExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {/* 复制全部 */}
          <button
            onClick={handleCopyAll}
            disabled={logs.length === 0}
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              logs.length === 0
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            )}
            title={t('logs.copyAll')}
          >
            <Copy className="w-4 h-4" />
          </button>
          {/* 清空 */}
          <button
            onClick={handleClear}
            disabled={logs.length === 0}
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              logs.length === 0
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            )}
            title={t('logs.clear')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 日志内容 */}
      <div
        className="flex-1 overflow-y-auto p-2 font-mono text-xs bg-bg-tertiary"
        onContextMenu={handleContextMenu}
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted">
            {t('logs.noLogs')}
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <div
                key={log.id}
                className={clsx('py-0.5 flex gap-2', getLogColor(log.type))}
              >
                <span className="text-text-muted flex-shrink-0">
                  [{log.timestamp.toLocaleTimeString()}]
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>

      {/* 右键菜单 */}
      {menuState.isOpen && (
        <ContextMenu
          items={menuState.items}
          position={menuState.position}
          onClose={hideMenu}
        />
      )}
    </div>
  );
}
