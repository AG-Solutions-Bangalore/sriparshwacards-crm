import React from 'react';

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Do you really want to delete this item? This action cannot be undone.',
  submitting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-xl border border-[#E2DDD5] bg-white p-6 shadow-xl text-center">
        {/* Warning Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="font-serif text-xl font-normal text-[#1A1817]">{title}</h3>
        <p className="mt-2 text-xs text-[#8C857B] leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="rounded-full bg-rose-600 hover:bg-rose-700 px-6 py-1.5 font-serif text-xs font-normal text-white shadow-xs transition cursor-pointer disabled:opacity-50 min-w-[90px]"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#E2DDD5] bg-white hover:bg-[#F7F5F0] px-6 py-1.5 font-serif text-xs font-normal text-[#1A1817] shadow-xs transition cursor-pointer min-w-[90px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
