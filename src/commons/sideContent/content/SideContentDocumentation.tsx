import { Button } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sicp from 'src/commons/documentation/Sicp';
import { Links } from 'src/commons/utils/Constants';
import { SICP_INDEX } from 'src/features/textbook/hooks/useTextbookSectionQuery';

const MODULES_DOCUMENTATION_URL =
  'https://source-academy.github.io/modules/documentation/index.html';

const documentationPages = [
  { id: 'modules', src: MODULES_DOCUMENTATION_URL },
  { id: 'sourceDocs', src: Links.sourceDocs },
  { id: 'sicpJs' },
] as const;

type DocumentationPage = (typeof documentationPages)[number];
type DocumentationPageId = DocumentationPage['id'];

function SideContentDocumentation() {
  const { t } = useTranslation('sideContent', { keyPrefix: 'documentation' });
  const [activePageId, setActivePageId] = useState<DocumentationPageId>('modules');
  const [sicpSection, setSicpSection] = useState(SICP_INDEX);
  const iframeRefs = useRef<Partial<Record<DocumentationPageId, HTMLIFrameElement>>>({});
  const documentationRef = useRef<HTMLDivElement>(null);

  // Give the documentation enough room to be useful the first time its tab becomes visible.
  useEffect(() => {
    const documentationElement = documentationRef.current;
    if (!documentationElement) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) {
          return;
        }

        const sideContentElement = document.querySelector<HTMLDivElement>('.resize-side-content');
        if (sideContentElement) {
          sideContentElement.style.height = '500px';
        }
        observer.unobserve(documentationElement);
      },
      { threshold: 0.1 },
    );

    observer.observe(documentationElement);
    return () => observer.disconnect();
  }, []);

  const handleHome = () => {
    if (activePageId === 'sicpJs') {
      setSicpSection(SICP_INDEX);
      return;
    }

    const activeIframe = iframeRefs.current[activePageId];
    const activePage = documentationPages.find(page => page.id === activePageId);
    if (activeIframe && activePage && 'src' in activePage) {
      activeIframe.src = activePage.src;
    }
  };

  const getPageLabel = (pageId: DocumentationPageId) => {
    switch (pageId) {
      case 'modules':
        return t($ => $.modules);
      case 'sourceDocs':
        return t($ => $.sourceDocs);
      case 'sicpJs':
        return t($ => $.sicpJs);
    }
  };

  return (
    <div className="documentation-side-content" ref={documentationRef}>
      <div className="documentation-side-content-controls">
        <Button
          className="documentation-side-content-button"
          size="small"
          text={t($ => $.home)}
          variant="minimal"
          onClick={handleHome}
        />
        <div className="documentation-side-content-spacer" />
        {documentationPages.map(page => (
          <Button
            active={page.id === activePageId}
            className="documentation-side-content-button"
            key={page.id}
            text={getPageLabel(page.id)}
            variant="minimal"
            size="small"
            onClick={() => setActivePageId(page.id)}
          />
        ))}
      </div>
      <div className="documentation-side-content-pages">
        {documentationPages.map(page =>
          page.id === 'sicpJs' ? (
            <div
              className="documentation-side-content-page"
              hidden={page.id !== activePageId}
              key={page.id}
            >
              <Sicp section={sicpSection} onNavigate={setSicpSection} />
            </div>
          ) : (
            <iframe
              className="documentation-side-content-iframe"
              hidden={page.id !== activePageId}
              key={page.id}
              src={page.src}
              title={getPageLabel(page.id)}
              ref={ref => {
                iframeRefs.current[page.id] = ref ?? undefined;
              }}
              sandbox="allow-scripts allow-same-origin"
            />
          ),
        )}
      </div>
    </div>
  );
}

export default SideContentDocumentation;
