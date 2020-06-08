import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import { DebuggerContext } from '../workspace/WorkspaceTypes';
import { isCurrentlyActive } from './SideContentHelper';
import { SideContentTab } from './SideContentTypes';

const SideContentSampleTab = (props: any) => {
  let workspaces = useSelector((state: OverallState) => state.workspaces);

  // Require workspace location
  if (!props.workspaceLocation) {
    return <></>;
  }

  let replOutput = 'Your output is ';
  const debuggerContext = workspaces[props.workspaceLocation].debuggerContext;

  if (Object.keys(debuggerContext).length === 0) {
    replOutput = '';
  } else {
    replOutput = replOutput.concat(debuggerContext.result.value);
  }

  return (
    <div>
      <p id="env-visualizer-default-text" className={Classes.RUNNING_TEXT}>
        {replOutput}
      </p>
    </div>
  );
};

const toSpawnSampleTab = (debuggerContext: DebuggerContext) => {
  if (debuggerContext.result.value === 'unsample') {
    return false;
  }
  return (
    isCurrentlyActive('Sample', debuggerContext.workspaceLocation) ||
    debuggerContext.result.value === 'sample'
  );
};

export const sampleTab: SideContentTab = {
  label: 'Sample',
  iconName: IconNames.ASTERISK,
  body: <SideContentSampleTab />,
  toSpawn: toSpawnSampleTab
};

export default SideContentSampleTab;
