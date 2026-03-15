'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { API } from '@/utils/api';
import Modal from '@/components/Modal/page';
import Button from '@/components/Button/page';
import EmptyState from '@/components/EmptyState/page';
import Icon from '@/components/Icon/page';
import ModImage from '@/components/ModImage/page';
import checkCircleIconRaw from '@/assets/icons/check-circle.svg';

const FALLBACK_ICON = 'https://cdn.modrinth.com/assets/unknown_server.png';

export default function SelectedModal() {
  const { selectedModalOpen, setSelectedModalOpen, selectedMods, removeMod, modDataMap, updateModDataMap } = useApp();
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!selectedModalOpen) return;
    const ids = Array.from(selectedMods);
    const missing = ids.filter(id => !modDataMap[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    setLoadingDetails(true);
    API.getProjects(missing)
      .then(data => {
        if (cancelled) return;
        const map: Record<string, unknown> = {};
        data.forEach((p: { id: string }) => { map[p.id] = p; });
        updateModDataMap(map as Record<string, Record<string, unknown>>);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModalOpen]);

  if (!selectedModalOpen) return null;

  const ids = Array.from(selectedMods);
  const onClose = () => setSelectedModalOpen(false);

  const title = (
    <>
      <Icon svg={checkCircleIconRaw} size={20} /> Selected Mods
    </>
  );

  const footer = (
    <Button onClick={onClose} variant="secondary">Close</Button>
  );

  return (
    <Modal onClose={onClose} title={title} footer={footer} large>
      {ids.length === 0 ? (
        <EmptyState>No mods selected.</EmptyState>
      ) : loadingDetails ? (
        <EmptyState style={{ color: 'var(--text-muted)' }}>Loading details...</EmptyState>
      ) : (
        <div className="selected-list">
          {ids.map(id => {
            const mod = modDataMap[id];
            const modTitle = mod?.title || id;
            const iconUrl = mod?.icon_url || FALLBACK_ICON;
            return (
              <div key={id} className="selected-item">
                <ModImage src={iconUrl as string} width={32} height={32} className="selected-item-icon" alt="icon" />
                <span className="selected-item-title">{modTitle as string}</span>
                <Button onClick={() => removeMod(id)} variant="small" color="red-outline">Remove</Button>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
