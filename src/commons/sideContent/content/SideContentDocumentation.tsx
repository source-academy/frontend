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
    }
  ];

  const [activePage, setActivePage] = useState(pages[0]);
  const activeIframeRef = useRef<HTMLIFrameElement>(null);
  let sicpHomeCallbackFn: () => void = () => {};

  const changeActivePage = (index: number) => {
    setActivePage(pages[index]);
  };

  const handleDocsHome = useCallback(() => {
    if (sicpHomeCallbackFn !== null) {
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
    component: <Sicp setSicpHomeCallBackFn={sicpHomeCallbackSetter} />
  });

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
          onClick={() => handleDocsHome()}
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
        {pages.map(page =>
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
            />
          )
        )}
      </div>
    </div>
  );
};

export default SideContentDocumentation;
