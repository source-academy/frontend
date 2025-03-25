import { Button } from '@blueprintjs/core';
import { useState } from 'react';
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

  const changeActivePage = (index: number) => {
    setActivePage(pages[index]);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: '10px'
        }}
      >
        {pages.map((page, index) => (
          <Button
            style={{ margin: '0px 5px 0px 5px' }}
            text={page.name}
            minimal={true}
            onClick={() => changeActivePage(index)}
          />
        ))}
      </div>
      {activePage.src === 'https://sicp.sourceacademy.org' ? (
        <Sicp />
      ) : (
        <iframe style={{ border: 'none', width: '100%', height: '60vh' }} src={activePage.src} />
      )}
    </div>
  );
};

export default SideContentDocumentation;
