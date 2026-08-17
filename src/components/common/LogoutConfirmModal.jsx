import React from 'react';

function LogoutConfirmModal({ isOpen, onClose, onConfirm, submitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-xl border border-[#E2DDD5] bg-white p-6 shadow-xl text-center">
        {/* Warning / Logout Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>

        <h3 className="font-serif text-xl font-normal text-[#1A1817]">Confirm Logout</h3>
        <p className="mt-2 text-xs text-[#8C857B] leading-relaxed">
          Do you really want to log out of Sri Parshwa Cards management system?
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="rounded-full bg-red-600 hover:bg-red-700 px-6 py-1.5 font-serif text-xs font-normal text-white shadow-xs transition cursor-pointer disabled:opacity-50 min-w-[90px]"
          >
            {submitting ? 'Logging out...' : 'Logout'}
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

export default LogoutConfirmModal;
