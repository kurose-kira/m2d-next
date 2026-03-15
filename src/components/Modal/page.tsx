'use client';

import { createPortal } from 'react-dom';
import Icon from '@/components/Icon/page';
import xIconRaw from '@/assets/icons/x.svg';

interface ModalProps {
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  large?: boolean;
  className?: string;
  style?: React.CSSProperties;
  portal?: boolean;
}

export default function Modal({
  onClose,
  title,
  children,
  footer,
  large = false,
  className,
  style,
  portal = false,
}: ModalProps) {
  const containerClass = ['modal-container', large && 'large', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <div
      className="modal-overlay"
      style={style}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={containerClass}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="btn-close-modal">
            <Icon svg={xIconRaw} size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  return portal ? createPortal(content, document.body) : content;
}
