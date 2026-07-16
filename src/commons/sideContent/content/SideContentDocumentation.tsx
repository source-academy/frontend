import { Button } from '@blueprintjs/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import Sicp from 'src/commons/documentation/Sicp';

function SideContentDocumentation() {
  const pages: {
    name: string;
    src: string;
    component: React.ReactElement | null;
  }[] = [
    {
      name: 'Modules',
      src: 'https://source-academy.github.io/modules/documentation/index.html',
      component: null,
    },
    {
      name: 'Docs',
      src: 'https://docs.sourceacademy.org/',
      component: null,
    },
  ];

  const [activePage, setActivePage] = useState(pages[0]);
  const activeIframeRef = useRef<HTMLIFrameElement>(null);
  const documentationDivRef = useRef<HTMLDivElement>(null);

  // Used to resize the docs tab to an initial height only once
  useEffect(() => {
    const ref = documentationDivRef.current as HTMLDivElement;
    const visibilityCallback = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver,
    ) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const resizableSideContentElement = document
            .getElementsByClassName('resize-side-content')
            .item(0) as HTMLDivElement;
          if (resizableSideContentElement !== null) {
            resizableSideContentElement.style.height = '500px';
          }

          observer.unobserve(ref);
        }
      });
    };

    const observer = new IntersectionObserver(visibilityCallback, {
      root: null,
      threshold: 0.1,
    });

    observer.observe(ref);
    return () => {
      observer.unobserve(ref);
    };
  }, []);

  let sicpHomeCallbackFn: () => void = () => {};

  const changeActivePage = (index: number) => {
    setActivePage(pages[index]);
  };

  const handleDocsHome = useCallback(() => {
    if (sicpHomeCallbackFn !== null && activePage.src === 'https://sicp.sourceacademy.org') {
      sicpHomeCallbackFn();
    }

    if (activeIframeRef.current !== null) {
      activeIframeRef.current.src = activePage.src;
    }
  }, [activePage.src]);

  const sicpHomeCallbackSetter = (fn: () => void) => {
    sicpHomeCallbackFn = fn;
  };

  pages.push({
    name: 'SICP JS',
    src: 'https://sicp.sourceacademy.org',
    component: <Sicp setSicpHomeCallBackFn={sicpHomeCallbackSetter} />,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
      }}
      ref={documentationDivRef}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: '5px',
        }}
      >
        <Button
          style={{ padding: '0 2ch 0 2ch', margin: '0px 5px 0px 5px', textWrap: 'nowrap' }}
          size="small"
          text={'Home'}
          variant="minimal"
          onClick={() => handleDocsHome()}
        />
        <div style={{ width: '100%' }} />
        {pages.map((page, index) => (
          <Button
            active={page.name === activePage.name}
            style={{ padding: '0 2ch 0 2ch', margin: '0px 5px 0px 5px', textWrap: 'nowrap' }}
            text={page.name}
            variant="minimal"
            size="small"
            onClick={() => changeActivePage(index)}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexGrow: 1,
          marginBottom: '0.25em',
        }}
      >
        {pages.map(page =>
          page.component ? (
            <div
              style={{ display: page.src === activePage.src ? 'block' : 'none', height: '100%' }}
            >
              {page.component}
            </div>
          ) : (
            <iframe
              style={{
                border: 'none',
                width: '100%',
                height: '100%',
                display: page.src === activePage.src ? 'flex' : 'none',
                flexGrow: 1,
              }}
              src={page.src}
              ref={page.src === activePage.src ? activeIframeRef : null}
              sandbox="allow-scripts allow-same-origin"
            />
          ),
        )}
      </div>
    </div>
  );
}

export default SideContentDocumentation;
