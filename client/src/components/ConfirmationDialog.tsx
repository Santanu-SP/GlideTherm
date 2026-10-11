import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-sm animate-fade-in">
      <div className="gt-card max-w-md w-full p-6 shadow-xl border-charcoal-200" role="dialog" aria-modal="true">
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-full shrink-0 ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-forest-100 text-forest-700'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-charcoal-900 mb-1.5">
              {title}
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed mb-5">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="gt-btn-secondary px-3.5 py-1.5 text-xs"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-1.5 text-xs font-semibold rounded-xl text-white transition-all shadow-sm ${
                  isDestructive 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-forest-800 hover:bg-forest-900'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
