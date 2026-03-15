'use client';

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '@/contexts/AppContext';
import { API } from '@/utils/api';
import Button from '@/components/Button/page';
import EmptyState from '@/components/EmptyState/page';
import LoaderDots from '@/components/LoaderDots/page';
import Icon from '@/components/Icon/page';
import ModImage from '@/components/ModImage/page';
import externalLinkIconRaw from '@/assets/icons/arrow-up-right.svg';
import imageIconRaw from '@/assets/icons/images.svg';

const FALLBACK_ICON = 'https://cdn.modrinth.com/assets/unknown_server.png';
const MODRINTH_BASE = 'https://modrinth.com/mod/';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ModDetail() {
  const { activeModId, modDataMap, t } = useApp();
  const [state, setState] = useState<{ id: string | null; detail: any }>({ id: null, detail: null });
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeModId) return;
    let cancelled = false;
    API.getProject(activeModId)
      .then((data: any) => { if (!cancelled) setState({ id: activeModId, detail: data }); })
      .catch(() => { if (!cancelled) setState({ id: activeModId, detail: null }); });
    return () => { cancelled = true; };
  }, [activeModId]);

  const projectDetail = state.id === activeModId ? state.detail : null;
  const loading = activeModId !== null && state.id !== activeModId;

  if (!activeModId) {
    return (
      <EmptyState variant="mod-detail">
        <p>{t.rightPanel.noDescription}</p>
      </EmptyState>
    );
  }

  if (loading) {
    return (
      <EmptyState variant="mod-detail">
        <LoaderDots style={{ position: 'relative', width: '5rem', height: '1.25rem' }} />
      </EmptyState>
    );
  }

  if (!projectDetail) return null;

  const mod = modDataMap[activeModId] || {};
  const gallery = projectDetail.gallery || [];

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="mod-detail">
      <div className="mod-detail-header">
        <ModImage
          src={projectDetail.icon_url || (mod as any).icon_url || FALLBACK_ICON}
          width={64}
          height={64}
          className="mod-detail-icon"
          alt="icon"
        />
        <div className="mod-detail-header-info">
          <h2 className="mod-detail-title">{projectDetail.title || (mod as any).title}</h2>
          <p className="mod-detail-summary">{projectDetail.description}</p>
          <div className="mod-detail-actions">
            <a
              href={`${MODRINTH_BASE}${activeModId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-small green"
            >
              <Icon svg={externalLinkIconRaw} size={12} /> {t.rightPanel.openModrinth}
            </a>
            {gallery.length > 0 && (
              <Button onClick={scrollToGallery} variant="small">
                <Icon svg={imageIconRaw} size={12} /> {t.rightPanel.gallery} ({gallery.length})
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="mod-detail-body">
        {projectDetail.body ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ src, alt, ...props }) => (
                <img src={src} alt={alt} loading="lazy" style={{ maxWidth: '100%' }} {...props} />
              ),
              a: ({ href, children, ...props }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
              ),
            }}
          >
            {projectDetail.body}
          </ReactMarkdown>
        ) : (
          <p className="mod-detail-body-empty">No description available.</p>
        )}
      </div>
      {gallery.length > 0 && (
        <div ref={galleryRef} className="mod-detail-gallery">
          <h3 className="mod-detail-gallery-title">
            <Icon svg={imageIconRaw} size={16} /> {t.rightPanel.gallery}
          </h3>
          <div className="mod-gallery-grid">
            {gallery.map((item: any, i: number) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="mod-gallery-item">
                <ModImage src={item.url} width={320} height={180} alt={item.title || `Screenshot ${i + 1}`} className="mod-gallery-img" />
                {item.title && <span className="mod-gallery-caption">{item.title}</span>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
