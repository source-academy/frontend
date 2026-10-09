import { Button, Checkbox } from '@blueprintjs/core';
import { useState } from 'react';

import CseMachine from './CseMachine';
import type { ArrowOriginFilterKey } from './CseMachineTypes';

const FILTERS: { key: ArrowOriginFilterKey; label: string }[] = [
  { key: 'text', label: 'From text' },
  { key: 'frame', label: 'From frames' },
  { key: 'function', label: 'From function objects' },
  { key: 'array', label: 'From arrays' },
  { key: 'control', label: 'From control' },
  { key: 'stash', label: 'From stash' },
];

type Props = {
  /** Called after a filter changes, to redraw the diagram. */
  onChange: () => void;
  /** Filter keys not offered (e.g. control and stash, for a diagram without them). */
  exclude?: ArrowOriginFilterKey[];
};

/**
 * The CSE machine diagram's "Filter Arrows" menu: which kinds of arrows are drawn. Shared by the
 * CSE Machine tab and the environment view the frontend lends to web plugins.
 */
function CseArrowFilterMenu({ onChange, exclude = [] }: Props) {
  // The filters live in CseMachine's static state; re-render this menu itself when they change.
  const [, setVersion] = useState(0);
  const changed = () => {
    setVersion(v => v + 1);
    onChange();
  };
  const filters = CseMachine.getArrowOriginFilters();
  const shown = FILTERS.filter(f => !exclude.includes(f.key));
  const allSelected = shown.every(f => filters[f.key]);
  return (
    <div style={{ padding: '8px 10px', minWidth: '210px' }}>
      <div style={{ marginBottom: '8px', fontWeight: 600 }}>Filter Arrows</div>
      <Button
        size="small"
        variant="minimal"
        onClick={() => {
          for (const f of shown) {
            CseMachine.setArrowOriginVisible(f.key, !allSelected);
          }
          changed();
        }}
        style={{ marginBottom: '8px' }}
      >
        {allSelected ? 'Deselect all' : 'Select all'}
      </Button>
      {shown.map(f => (
        <Checkbox
          key={f.key}
          checked={filters[f.key]}
          label={f.label}
          onChange={() => {
            CseMachine.setArrowOriginVisible(f.key, !filters[f.key]);
            changed();
          }}
        />
      ))}
    </div>
  );
}

export default CseArrowFilterMenu;
