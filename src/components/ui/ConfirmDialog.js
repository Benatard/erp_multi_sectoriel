import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmDialog({ open, title = 'Confirmer la suppression', message, onConfirm, onClose, loading }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="max-w-md"
      footer={
        <>
          <button onClick={onClose} className="btn-outline-root !px-5 !py-2.5">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Suppression…' : 'Supprimer'}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span className="h-12 w-12 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
          <FiAlertTriangle className="w-5 h-5" />
        </span>
        <p className="text-sm text-body dark:text-body-dark leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}