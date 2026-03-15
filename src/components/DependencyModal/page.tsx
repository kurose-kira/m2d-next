'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Modal from '@/components/Modal/page';
import Button from '@/components/Button/page';
import EmptyState from '@/components/EmptyState/page';
import Icon from '@/components/Icon/page';
import ModImage from '@/components/ModImage/page';
import gitGraphIconRaw from '@/assets/icons/git-graph.svg';
import checkCircleIconRaw from '@/assets/icons/check-circle.svg';
import infoIconRaw from '@/assets/icons/info.svg';

const FALLBACK_ICON = 'https://cdn.modrinth.com/assets/unknown_server.png';

interface DepIssue {
  source: string;
  targetId: string;
}

interface DepIssues {
  required: DepIssue[];
  optional: DepIssue[];
  conflict: DepIssue[];
  [key: string]: DepIssue[];
}

interface DependencyModalProps {
  issues: DepIssues;
  onClose: () => void;
}

export default function DependencyModal({ issues, onClose }: DependencyModalProps) {
  const { selectedMods, addMod, removeMod, modDataMap } = useApp();
  const [activeTab, setActiveTab] = useState<string>('required');

  if (!issues) return null;

  const list = issues[activeTab] || [];

  const renderEmptyState = () => {
    const msgs: Record<string, string> = { required: 'All good! 🎉', optional: 'No optional deps.', conflict: 'No conflicts! ✅' };
    const iconSvg = activeTab === 'conflict' ? checkCircleIconRaw : infoIconRaw;
    return (
      <EmptyState>
        <Icon svg={iconSvg} size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
        <p>{msgs[activeTab]}</p>
      </EmptyState>
    );
  };

  const title = (
    <>
      <Icon svg={gitGraphIconRaw} size={20} /> Dependency Report
    </>
  );

  const footer = (
    <Button onClick={onClose} variant="secondary">Close</Button>
  );

  return (
    <Modal onClose={onClose} title={title} footer={footer} large>
      <div className="tabs">
        {['required', 'optional', 'conflict'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn ${activeTab === tab ? `active-${tab}` : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {list.length === 0 ? renderEmptyState() : (
        <div className="dep-list">
          {list.map((item, i) => {
            const isSelected = selectedMods.has(item.targetId);
            const targetMod = modDataMap[item.targetId];
            const targetTitle = (targetMod?.title as string) || item.targetId;
            const iconUrl = (targetMod?.icon_url as string) || FALLBACK_ICON;

            let actionBtn: React.ReactNode;
            if (activeTab === 'conflict') {
              actionBtn = !isSelected
                ? <Button variant="small" className="disabled" disabled>Removed</Button>
                : <Button onClick={() => removeMod(item.targetId)} variant="small" color="red-outline">Remove</Button>;
            } else {
              actionBtn = isSelected
                ? <Button variant="small" className="disabled" disabled>Added</Button>
                : <Button onClick={() => addMod(item.targetId)} variant="small" color="green">Add</Button>;
            }

            return (
              <div key={i} className="dep-item">
                <ModImage src={iconUrl} width={40} height={40} className="dep-icon" alt="icon" />
                <div className="dep-info">
                  <p className="dep-source">
                    {activeTab === 'conflict' ? 'Conflict w/' : 'Source:'}{' '}
                    <span>{item.source}</span>
                  </p>
                  <p className="dep-target">{targetTitle}</p>
                </div>
                <div>{actionBtn}</div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
