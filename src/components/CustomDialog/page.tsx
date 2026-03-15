'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import Modal from '@/components/Modal/page';
import Button from '@/components/Button/page';
import Icon from '@/components/Icon/page';
import circleAlertIconRaw from '@/assets/icons/circle-alert.svg';
import infoIconRaw from '@/assets/icons/info.svg';

export default function CustomDialog() {
  const { dialog, closeDialog } = useApp();
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dialog) {
      okRef.current?.focus();
    }
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeDialog(dialog.type === 'confirm' ? true : undefined);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(dialog.type === 'confirm' ? false : undefined);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dialog, closeDialog]);

  if (!dialog) return null;

  const isConfirm = dialog.type === 'confirm';

  const title = isConfirm
    ? <><Icon svg={infoIconRaw} size={20} style={{ color: 'var(--accent-color)' }} /> Confirm</>
    : <><Icon svg={circleAlertIconRaw} size={20} style={{ color: 'var(--primary-color)' }} /> Notice</>;

  const footer = (
    <>
      {isConfirm && (
        <Button onClick={() => closeDialog(false)} variant="secondary">
          Cancel
        </Button>
      )}
      <Button
        ref={okRef}
        onClick={() => closeDialog(isConfirm ? true : undefined)}
        variant="primary"
        className="dialog-ok-btn"
      >
        OK
      </Button>
    </>
  );

  return (
    <Modal
      onClose={() => closeDialog(isConfirm ? false : undefined)}
      title={title}
      footer={footer}
      className="dialog-container"
      style={{ zIndex: 200 }}
    >
      <p className="dialog-message">{dialog.message}</p>
    </Modal>
  );
}
