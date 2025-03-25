import { Button } from '@blueprintjs/core';
import React, { useCallback, useRef, useState } from 'react';
import Sicp from 'src/commons/documentation/Sicp';

const SideContentDocumentation: React.FC = () => {
  const pages: {
    name: string;
    src: string;
    component: JSX.Element | null;
  }[] = [
    {
      name: 'Modules',
      src: 'https://source-academy.github.io/modules/documentation/index.html',
      component: null
    },
    {
      name: 'Docs',
      src: 'https://docs.sourceacademy.org/',
      component: null
    },
    {
      name: 'SICP JS',
      src: 'https://sicp.sourceacademy.org',
      component: <Sicp />
    }
  ];

  const [activePage, setActivePage] = useState(pages[0]);
  const activeIframeRef = useRef<HTMLIFrameElement>(null);

  const changeActivePage = (index: number) => {
    setActivePage(pages[index]);
  };

  const handleIframeBack = useCallback(() => {
    if (activeIframeRef.current !== null) {
      activeIframeRef.current.src = activePage.src;
    }
  }, [activePage.src]);

  // const handleIframeForward = useCallback(() => {
  //   iframeRef.current?.contentWindow?.history.forward();
  // }, [iframeRef]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}
      >
        <Button
          style={{ margin: '0px 5px 0px 5px', textWrap: 'nowrap' }}
          text={'Home'}
          minimal={true}
          onClick={() => handleIframeBack()}
        />
        <div style={{ width: '100%' }}></div>
        {pages.map((page, index) => (
          <Button
            style={{ margin: '0px 5px 0px 5px', textWrap: 'nowrap' }}
            text={page.name}
            minimal={true}
            onClick={() => changeActivePage(index)}
          />
        ))}
      </div>
      <div>
        {pages.map((page, index) =>
          page.component ? (
            <div style={{ display: page.src === activePage.src ? 'block' : 'none' }}>
              {page.component}
            </div>
          ) : (
            <iframe
              style={{
                border: 'none',
                width: '100%',
                height: '60vh',
                display: page.src === activePage.src ? 'block' : 'none'
              }}
              src={page.src}
              ref={page.src === activePage.src ? activeIframeRef : null}
              // sandbox='allow-scripts allow-same-origin'
            />
          )
        )}
      </div>
    </div>
  );
};

export default SideContentDocumentation;
