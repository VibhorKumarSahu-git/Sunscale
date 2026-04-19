import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'icon-glow-red text-red-400',
      button: 'bg-red-500 hover:bg-red-400 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
    },
    warning: {
      icon: 'icon-glow-amber text-amber-300',
      button: 'bg-amber-500 hover:bg-amber-400 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
    },
    info: {
      icon: 'icon-glow-cyan text-cyan-400',
      button: 'bg-cyan-500 hover:bg-cyan-400 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with fade animation */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onCancel}
      />
      
      {/* Dialog with scale and fade animation */}
      <div className="relative glass-card border-cyan-500/20 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.1)]">
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 animate-shimmer" />
        
        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`w-14 h-14 rounded-full ${styles.icon} flex items-center justify-center mb-4 animate-bounce-gentle`}>
            <AlertTriangle className="w-7 h-7" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-extrabold text-white mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-slate-300 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/[0.05] hover:bg-white/10 text-white rounded-xl font-semibold transition-all duration-200 active:scale-95 border border-cyan-500/15 hover:border-cyan-500/30"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 ${styles.button} text-white rounded-xl font-semibold transition-all duration-200`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
