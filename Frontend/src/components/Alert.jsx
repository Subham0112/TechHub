import React, { useEffect } from 'react';

const Alert = ({ alert, onDismiss }) => {
  const styles = {
    info:    { bg: 'bg-blue-50',   border: 'border-blue-400',  text: 'text-blue-800',  icon: '●' },
    success: { bg: 'bg-green-50',  border: 'border-green-400', text: 'text-green-800', icon: '✓' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-400',text: 'text-yellow-800',icon: '!' },
    danger:  { bg: 'bg-red-50',    border: 'border-red-400',   text: 'text-red-800',   icon: '✕' },
  };

  const { bg, border, text, icon } = styles[alert?.type] || styles.info;

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [alert]);

  if (!alert) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-start gap-2 px-4 py-3 rounded-lg border-l-4 shadow-md ${bg} ${border} ${text}`}
      style={{ maxWidth: '520px', minWidth: '320px' }}
    >
      <span className="text-base font-bold mt-0.5">{icon}</span>
      <div className="flex-1">
        {alert?.title && <p className="font-semibold text-sm leading-tight">{alert.title}</p>}
        {alert?.description && <p className="text-xs opacity-80 mt-0.5">{alert.description}</p>}
      </div>
      <button onClick={onDismiss} className={`text-xs opacity-60 hover:opacity-100 ml-1 ${text}`}>✕</button>
    </div>
  );
};

export default Alert;