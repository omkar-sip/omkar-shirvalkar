import React from "react";

interface MobileAppViewProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MobileAppView({
  title,
  onClose,
  children
}: MobileAppViewProps) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-white dark:bg-gray-900">
      {/* Title bar */}
      <div className="h-6 flex items-center justify-between px-3 bg-c-200 border-b border-c-300">
        <span className="font-semibold text-c-700 text-sm">{title}</span>
        <button
          className="text-c-700 hover:text-red-500 text-xl leading-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Content area - full height minus title bar and top bar */}
      <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 2rem - 1.5rem)' }}>
        {children}
      </div>
    </div>
  );
}
