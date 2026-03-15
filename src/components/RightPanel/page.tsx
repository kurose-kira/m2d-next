'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModDetail from '@/components/ModDetail/page';
import Button from '@/components/Button/page';
import EmptyState from '@/components/EmptyState/page';
import LogEntry from '@/components/LogEntry/page';
import Badge from '@/components/Badge/page';
import RightPanelModItem from '@/components/RightPanelModItem/page';
import { Panel, PanelTabs, PanelBody, PanelList, LogContainer } from '@/components/PanelComponents/page';
import Icon from '@/components/Icon/page';
import { API } from '@/utils/api';

import fileTextIconRaw from '@/assets/icons/file-text.svg';
import historyIconRaw from '@/assets/icons/history.svg';
import settingsIconRaw from '@/assets/icons/settings.svg';
import checkCircleIconRaw from '@/assets/icons/check-circle.svg';
import starIconRaw from '@/assets/icons/star.svg';
import terminalIconRaw from '@/assets/icons/terminal-square.svg';
import xIconRaw from '@/assets/icons/x.svg';
import trashIconRaw from '@/assets/icons/trash.svg';
import plusIconRaw from '@/assets/icons/package-plus.svg';

const FALLBACK_ICON = 'https://cdn.modrinth.com/assets/unknown_server.png';
const LEVEL_COLORS: Record<string, string> = { log: '#cbd5e1', info: '#7dd3fc', warn: '#facc15', error: '#f87171' };

/* ─── Upper panel ─── */
function UpperPanel({ onSettingsClick, onHistorySearch }: { onSettingsClick: () => void; onHistorySearch: (q: string) => void }) {
  const { t, searchHistory, removeSearchHistory, clearSearchHistory } = useApp();
  const [tab, setTab] = useState('description');

  const tabs = [
    { id: 'description', label: t.rightPanel.description, icon: fileTextIconRaw },
    { id: 'history',     label: t.rightPanel.history,     icon: historyIconRaw },
    { id: 'settings',   label: t.rightPanel.settings,    icon: settingsIconRaw },
  ];

  return (
    <Panel>
      <PanelTabs>
        {tabs.map(tb => (
          <button
            key={tb.id}
            className={`rp-tab-btn ${tab === tb.id ? 'active' : ''}`}
            onClick={() => {
              if (tb.id === 'settings') { onSettingsClick(); return; }
              setTab(tb.id);
            }}
          >
            <Icon svg={tb.icon} size={14} />
            <span>{tb.label}</span>
          </button>
        ))}
      </PanelTabs>
      <PanelBody>
        {tab === 'description' && <ModDetail />}
        {tab === 'history' && (
          <div className="rp-history">
            {searchHistory.length === 0 ? (
              <EmptyState variant="right-panel">{t.history.noHistory}</EmptyState>
            ) : (
              <>
                <div className="rp-history-header">
                  <Button variant="small" color="red-outline" onClick={clearSearchHistory}>
                    <Icon svg={trashIconRaw} size={12} /> {t.history.clear}
                  </Button>
                </div>
                <div className="rp-history-list">
                  {searchHistory.map((q, i) => (
                    <div key={i} className="rp-history-item">
                      <button className="rp-history-query" onClick={() => onHistorySearch(q)}>{q}</button>
                      <button className="rp-history-del" onClick={() => removeSearchHistory(q)}>
                        <Icon svg={xIconRaw} size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ─── Lower panel ─── */
function LowerPanel() {
  const {
    t, debugMode, debugLogs, clearDebugLogs,
    selectedMods, removeMod, modDataMap, updateModDataMap,
    favorites, toggleFavorite, addMod,
  } = useApp();
  const [tab, setTab] = useState('selected');
  const [filterLevel, setFilterLevel] = useState('all');
  const logsRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'selected',  label: t.rightPanel.selected,  icon: checkCircleIconRaw },
    { id: 'favorites', label: t.rightPanel.favorites, icon: starIconRaw },
    ...(debugMode ? [{ id: 'console', label: t.rightPanel.console, icon: terminalIconRaw }] : []),
  ];

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [debugLogs, filterLevel]);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const favIds = Array.from(favorites);
    const missing = favIds.filter(id => !modDataMap[id]);
    if (missing.length === 0) return;
    API.getProjects(missing)
      .then((data: Array<{ id: string; [k: string]: unknown }>) => {
        const map: Record<string, Record<string, unknown>> = {};
        data.forEach(p => { map[p.id] = p; });
        updateModDataMap(map);
        forceUpdate(n => n + 1);
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);

  const selectedIds = Array.from(selectedMods);
  const favIds = Array.from(favorites);
  const LEVELS = ['all', 'log', 'info', 'warn', 'error'];
  const filteredLogs = filterLevel === 'all' ? debugLogs : debugLogs.filter(e => e.level === filterLevel);
  const counts = debugLogs.reduce<Record<string, number>>((acc, e) => { acc[e.level] = (acc[e.level] || 0) + 1; return acc; }, {});

  return (
    <Panel>
      <PanelTabs>
        {tabs.map(tb => (
          <button key={tb.id} className={`rp-tab-btn ${tab === tb.id ? 'active' : ''}`} onClick={() => setTab(tb.id)}>
            <Icon svg={tb.icon} size={14} />
            <span>{tb.label}</span>
            {tb.id === 'selected' && selectedMods.size > 0 && (
              <Badge variant="rp">{selectedMods.size}</Badge>
            )}
            {tb.id === 'favorites' && favorites.size > 0 && (
              <Badge variant="rp">{favorites.size}</Badge>
            )}
          </button>
        ))}
      </PanelTabs>
      <PanelBody>
        {tab === 'selected' && (
          <PanelList>
            {selectedIds.length === 0 ? (
              <EmptyState variant="right-panel">No mods selected.</EmptyState>
            ) : (
              selectedIds.map(id => {
                const mod = modDataMap[id];
                return (
                  <RightPanelModItem key={id} iconUrl={(mod?.icon_url as string) || FALLBACK_ICON} title={(mod?.title as string) || id}>
                    <Button onClick={() => removeMod(id)} variant="small" color="red-outline">
                      <Icon svg={xIconRaw} size={10} />
                    </Button>
                  </RightPanelModItem>
                );
              })
            )}
          </PanelList>
        )}
        {tab === 'favorites' && (
          <PanelList>
            {favIds.length === 0 ? (
              <EmptyState variant="right-panel">{t.favorites.noFavorites}</EmptyState>
            ) : (
              favIds.map(id => {
                const mod = modDataMap[id];
                const isSel = selectedMods.has(id);
                return (
                  <RightPanelModItem key={id} iconUrl={(mod?.icon_url as string) || FALLBACK_ICON} title={(mod?.title as string) || id}>
                    <Button
                      variant="small"
                      color={isSel ? 'red-outline' : 'green'}
                      onClick={() => isSel ? removeMod(id) : addMod(id)}
                      title={isSel ? t.favorites.removeFromSelected : t.favorites.addToSelected}
                    >
                      <Icon svg={isSel ? xIconRaw : plusIconRaw} size={10} />
                    </Button>
                    <Button variant="small" className="rp-fav-mod-star" onClick={() => toggleFavorite(id)} title="Remove from favorites">
                      <Icon svg={starIconRaw} size={10} />
                    </Button>
                  </RightPanelModItem>
                );
              })
            )}
          </PanelList>
        )}
        {tab === 'console' && debugMode && (
          <div className="rp-console">
            <div className="rp-console-toolbar">
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {LEVELS.map(lvl => (
                  <Button
                    key={lvl}
                    className={`debug-filter-btn ${filterLevel === lvl ? 'active' : ''}`}
                    style={filterLevel === lvl && lvl !== 'all' ? { borderColor: LEVEL_COLORS[lvl], color: LEVEL_COLORS[lvl] } : {}}
                    onClick={() => setFilterLevel(lvl)}
                  >
                    {lvl === 'all' ? 'All' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    {lvl !== 'all' && counts[lvl] ? <Badge variant="debug">{counts[lvl]}</Badge> : null}
                  </Button>
                ))}
              </div>
              <Button onClick={clearDebugLogs} className="debug-action-btn" title="Clear">
                <Icon svg={trashIconRaw} size={12} />
              </Button>
            </div>
            <LogContainer refObj={logsRef} className="rp-console-logs">
              {filteredLogs.length === 0 ? (
                <EmptyState variant="debug">No logs.</EmptyState>
              ) : filteredLogs.map((entry, i) => (
                <LogEntry key={i} time={entry.time} level={entry.level} msg={entry.msg} />
              ))}
            </LogContainer>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ─── RightPanel with resizer ─── */
export default function RightPanel({ onSettingsClick, onHistorySearch }: { onSettingsClick: () => void; onHistorySearch: (q: string) => void }) {
  const [upperHeight, setUpperHeight] = useState(55);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const pct = Math.min(80, Math.max(20, (y / rect.height) * 100));
      setUpperHeight(pct);
    };
    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="right-panel">
      <div className="rp-upper" style={{ height: `${upperHeight}%` }}>
        <UpperPanel onSettingsClick={onSettingsClick} onHistorySearch={onHistorySearch} />
      </div>
      <div className="rp-resizer" onMouseDown={onMouseDown} />
      <div className="rp-lower" style={{ height: `${100 - upperHeight}%` }}>
        <LowerPanel />
      </div>
    </div>
  );
}
