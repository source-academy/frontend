import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { DebuggerContext } from '../workspace/WorkspaceTypes';
import { SideContentTab } from './SideContentTypes';

const SideContentSampleTab = (props: any) => {
  return (
    <div>
      <p id="env-visualizer-default-text" className={Classes.RUNNING_TEXT}>
        The environmental visualizer generates the environmental model diagram based on breakpoints
        set in the editor.
      </p>
    </div>
  );
};

const toSpawnSampleTab = (debuggerContext: DebuggerContext) => {
  return true;
};

export const sampleTab: SideContentTab = {
  label: 'Sample',
  iconName: IconNames.ASTERISK,
  body: <SideContentSampleTab />,
  toSpawn: toSpawnSampleTab
};

export default SideContentSampleTab;
