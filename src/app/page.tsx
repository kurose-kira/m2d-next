'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { API } from '@/utils/api';
import { asyncPool, CONCURRENCY_LIMIT } from '@/utils/helpers';

import Header from '@/components/Header/page';
import SideMenu from '@/components/SideMenu/page';
import SearchSection from '@/components/SearchSection/page';
import ModList from '@/components/ModList/page';
import ActionBar from '@/components/ActionBar/page';
import SettingsModal from '@/components/SettingsModal/page';
import DependencyModal from '@/components/DependencyModal/page';
import SelectedModal from '@/components/SelectedModal/page';
import LoadingOverlay from '@/components/LoadingOverlay/page';
import DebugPanel from '@/components/DebugPanel/page';
import CustomDialog from '@/components/CustomDialog/page';
import LeftPanel from '@/components/LeftPanel/page';
import RightPanel from '@/components/RightPanel/page';
import ThreeBackground from '@/components/ThreeBackground/page';

interface SearchParams {
  query: string;
  sort: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: any;
}

function AppContent() {
  const {
    selectedMods, modDataMap, updateModDataMap,
    modLoader, modVersion,
    setSettingsOpen,
    showLoading, updateLoading, showProgress, updateProgress, hideLoading,
    addDebugLog, showAlert,
    addSearchHistory,
  } = useApp();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    sort: 'relevance',
    filters: {},
  });
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [depIssues, setDepIssues] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const searchRef = useRef<{ doSearch: (q: string) => void } | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
    if (params.query.trim()) addSearchHistory(params.query.trim());
  }, [addSearchHistory]);

  const handleHistorySearch = useCallback((q: string) => {
    setSearchParams(prev => ({ ...prev, query: q }));
    searchRef.current?.doSearch(q);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLeftPanelFilterChange = useCallback((filters: any) => {
    setSearchParams(prev => ({
      ...prev,
      filters,
    }));
  }, []);

  const checkDeps = useCallback(async () => {
    const ids = Array.from(selectedMods);
    if (ids.length === 0) return;

    addDebugLog('info', `Checking dependencies for ${ids.length} mods...`);
    showLoading('Checking dependencies...');
    showProgress(ids.length);
    const startTime = Date.now();
    let processed = 0;

    const required: any[] = [];
    const optional: any[] = [];
    const conflict: any[] = [];

    try {
      await asyncPool(CONCURRENCY_LIMIT, ids, async (id) => {
        try {
          const versions = await API.getVersions(id, modLoader || undefined, modVersion || undefined);
          const ver = versions?.[0];
          if (!ver?.dependencies) return;

          for (const dep of ver.dependencies) {
            const entry = { source: modDataMap[id]?.title || id, targetId: dep.project_id };
            if (dep.dependency_type === 'required' && !selectedMods.has(dep.project_id)) {
              required.push(entry);
            } else if (dep.dependency_type === 'optional' && !selectedMods.has(dep.project_id)) {
              optional.push(entry);
            } else if (dep.dependency_type === 'incompatible' && selectedMods.has(dep.project_id)) {
              conflict.push(entry);
            }
          }
        } catch (err) {
          addDebugLog('error', `Dep check failed for ${id}: ${err}`);
        } finally {
          processed++;
          updateProgress(processed, ids.length, startTime);
          updateLoading(`Checking... (${processed}/${ids.length})`);
        }
      });

      // Fetch missing mod data for dependency targets
      const allTargetIds = [...required, ...optional, ...conflict].map(d => d.targetId);
      const missingIds = allTargetIds.filter(id => !modDataMap[id]);
      if (missingIds.length > 0) {
        updateLoading('Loading dependency details...');
        try {
          const data = await API.getProjects([...new Set(missingIds)]);
          const map: Record<string, any> = {};
          data.forEach((p: any) => { map[p.id] = p; });
          updateModDataMap(map);
        } catch { /* ignore */ }
      }

      setDepIssues({ required, optional, conflict });
      addDebugLog('info', `Dep check done: ${required.length} required, ${optional.length} optional, ${conflict.length} conflicts`);
    } finally {
      hideLoading();
    }
  }, [selectedMods, modDataMap, modLoader, modVersion, addDebugLog, showLoading, showProgress, updateProgress, updateLoading, hideLoading, updateModDataMap]);

  const handleDownload = useCallback(async () => {
    const ids = Array.from(selectedMods);
    if (ids.length === 0) return;

    addDebugLog('info', `Starting download for ${ids.length} mods...`);
    showLoading('Preparing download...');
    showProgress(ids.length);
    const startTime = Date.now();
    let processed = 0;

    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    const zip = new JSZip();
    let successCount = 0;

    await asyncPool(CONCURRENCY_LIMIT, ids, async (id) => {
      try {
        const versions = await API.getVersions(id, modLoader || undefined, modVersion || undefined);
        const ver = versions?.[0];
        if (!ver?.files?.[0]) {
          addDebugLog('warn', `No file found for ${id}`);
          return;
        }
        const file = ver.files[0];
        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        zip.file(file.filename, blob);
        successCount++;
        addDebugLog('log', `Downloaded: ${file.filename}`);
      } catch (err) {
        addDebugLog('error', `Download failed for ${id}: ${err}`);
      } finally {
        processed++;
        updateProgress(processed, ids.length, startTime);
        updateLoading(`Downloading... (${processed}/${ids.length})`);
      }
    });

    if (successCount > 0) {
      updateLoading('Creating ZIP...');
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `mods_${new Date().toISOString().slice(0, 10)}.zip`);
      addDebugLog('info', `ZIP created with ${successCount} mods`);
    } else {
      await showAlert('No mods could be downloaded.');
    }

    hideLoading();
  }, [selectedMods, modLoader, modVersion, addDebugLog, showLoading, showProgress, updateProgress, updateLoading, hideLoading, showAlert]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Desktop 3-column layout
  if (isDesktop) {
    return (
      <>
        <ThreeBackground />
        <Header />
        <div className="pc-layout" style={{ marginTop: 'var(--header-height)' }}>
          <div className="pc-left-panel">
            <LeftPanel onFilterChange={handleLeftPanelFilterChange} />
          </div>
          <div className="pc-center-panel">
            <SearchSection onSearch={handleSearch} />
            <ModList searchParams={searchParams} isDesktop={isDesktop} />
            <div className="pc-action-bar">
              <ActionBar onCheckDeps={checkDeps} onDownload={handleDownload} />
            </div>
          </div>
          <div className="pc-right-panel">
            <RightPanel onSettingsClick={() => setSettingsOpen(true)} onHistorySearch={handleHistorySearch} />
          </div>
        </div>
        <SideMenu />
        <SettingsModal />
        {depIssues && <DependencyModal issues={depIssues} onClose={() => setDepIssues(null)} />}
        <SelectedModal />
        <LoadingOverlay />
        <CustomDialog />
      </>
    );
  }

  // Mobile layout
  return (
    <>
      <ThreeBackground />
      <Header />
      <SearchSection onSearch={handleSearch} />
      <ModList searchParams={searchParams} isDesktop={isDesktop} />
      <div className="mobile-action-bar">
        <ActionBar onCheckDeps={checkDeps} onDownload={handleDownload} />
      </div>
      <SideMenu />
      <SettingsModal />
      {depIssues && <DependencyModal issues={depIssues} onClose={() => setDepIssues(null)} />}
      <SelectedModal />
      <LoadingOverlay />
      <DebugPanel />
      <CustomDialog />
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
