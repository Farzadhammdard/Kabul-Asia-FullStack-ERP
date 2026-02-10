"use client";
import { useEffect } from "react";

export default function Toast({ message, onClose, className = "" }) {
  useEffect(() => {
    const id = setTimeout(() => onClose?.(), 2600);
    return () => clearTimeout(id);
  }, [onClose]);

  if (!message) return null;

  return (
    <div
      id="toast-success"
      className={`flex items-center w-full max-w-sm p-4 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default ${className}`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center shrink-0 w-7 h-7 text-fg-success bg-success-soft rounded">
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
        </svg>
        <span className="sr-only">Check icon</span>
      </div>
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ms-auto flex items-center justify-center text-body hover:text-heading bg-transparent box-border border border-transparent hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded text-sm h-8 w-8 focus:outline-none"
        aria-label="Close"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
        </svg>
      </button>
    </div>
  );
}
