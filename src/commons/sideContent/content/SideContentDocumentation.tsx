import { Button, ButtonGroup } from '@blueprintjs/core';
import { useState } from 'react';

import { Links } from '../../utils/Constants';

const DOCS = { python: Links.pythonDocs, modules: Links.moduleDocs } as const;
type DocKey = keyof typeof DOCS;

const buttonClass = 'px-4 py-1.5 text-[15px]';

function SideContentDocumentation() {
  const [selected, setSelected] = useState<DocKey>('python');

  return (
    <div className="flex h-[75vh] w-full flex-col">
      <ButtonGroup className="mb-2 self-start">
        <Button
          className={buttonClass}
          active={selected === 'python'}
          onClick={() => setSelected('python')}
          text="Python"
        />
        <Button
          className={buttonClass}
          active={selected === 'modules'}
          onClick={() => setSelected('modules')}
          text="Modules"
        />
      </ButtonGroup>
      {(Object.keys(DOCS) as DocKey[]).map(key => (
        // Both stay mounted so each keeps its scroll position when toggled.
        <iframe
          key={key}
          title={key}
          src={DOCS[key]}
          className={`w-full flex-1 border-none bg-white ${key === selected ? '' : 'hidden'}`}
        />
      ))}
    </div>
  );
}

export default SideContentDocumentation;
