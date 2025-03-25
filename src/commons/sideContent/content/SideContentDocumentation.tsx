import { Button } from '@blueprintjs/core';
import { useCallback, useRef, useState } from 'react';
import Sicp from 'src/commons/documentation/Sicp';

const SideContentDocumentation: React.FC = () => {
  const pages = [
    {
      name: 'Modules',
      src: 'https://source-academy.github.io/modules/documentation/modules/curve.html'
    },
    {
      name: 'Docs',
      src: 'https://docs.sourceacademy.org/'
    },
    {
      name: 'SICP JS',
      src: 'https://sicp.sourceacademy.org'
    }
  ];

  const [activePage, setActivePage] = useState(pages[0]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const changeActivePage = (index: number) => {
    setActivePage(pages[index]);
  };

  const handleIframeBack = useCallback(() => {
    if (iframeRef.current !== null) {
      iframeRef.current.src = activePage.src;
    };
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
      {activePage.src === 'https://sicp.sourceacademy.org' ? (
        <Sicp />
      ) : (
        <iframe
          style={{ border: 'none', width: '100%', height: '60vh' }}
          src={activePage.src}
          ref={iframeRef}
        />
      )}
    </div>
  );
};

export default SideContentDocumentation;
