import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ open, title, onClose, children, footer, size = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${size} bg-white dark:bg-gray-dark shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-[#2C303B]">
          <h3 className="text-lg font-bold text-black dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="h-10 w-10 bg-gray2 dark:bg-[#2C303B] flex items-center justify-center text-dark dark:text-white hover:text-primary transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-stroke dark:border-[#2C303B] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}