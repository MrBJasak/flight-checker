'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 overflow-hidden'>
      <div className='fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in' onClick={onClose} />

      <div className='modal-container'>
        <div className='modal-content bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl animate-slide-up select-none overflow-hidden'>
          <div className='flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 cursor-default'>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate pr-4'>{title}</h2>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0'
              aria-label='Zamknij modal'
            >
              <HiX className='w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400' />
            </button>
          </div>

          <div className='flex-1 overflow-y-auto overflow-x-hidden' style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
