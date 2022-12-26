import { TabId } from '@blueprintjs/core';
import React from 'react';

import { useTypedSelector } from '../utils/Hooks';
import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { getDynamicTabs } from './SideContentHelper';
import { SideContentTab, SideContentType } from './SideContentTypes';

/**
 * Generates an icon id given a TabId.
 * Used to set and remove the 'side-content-tab-alert' style to the tabs.
 */
export const generateIconId = (tabId: TabId) => `${tabId}-icon`;

/**
 * @property onChange A function that is called whenever the
 * active tab is changed by the user.
 *
 * @property tabs An array of SideContentTabs.
 *  The tabs will be rendered in order of the array.
 *  If this array is empty, no tabs will be rendered.
 */
export type GenericSideContentProps = DispatchProps &
  StateProps & {
    renderFunction: (
      dynamicTabs: SideContentTab[],
      changeTabsCallback: (
        newTabId: SideContentType,
        prevTabId: SideContentType,
        event: React.MouseEvent<HTMLElement>
      ) => void
    ) => React.ReactElement;
  };

type DispatchProps = {
  // Optional due to uncontrolled tab component in EditingWorkspace
  onChange?: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;
};

type StateProps = {
  tabs: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  workspaceLocation?: WorkspaceLocation;
};

const GenericSideContent = (props: GenericSideContentProps) => {
  const { tabs, onChange } = props;
  const [dynamicTabs, setDynamicTabs] = React.useState(
    tabs.beforeDynamicTabs.concat(tabs.afterDynamicTabs)
  );

  // Fetch debuggerContext from store
  const debuggerContext = useTypedSelector(
    state => props.workspaceLocation && state.workspaces[props.workspaceLocation].debuggerContext
  );
  React.useEffect(() => {
    const allActiveTabs = tabs.beforeDynamicTabs
      .concat(getDynamicTabs(debuggerContext || ({} as DebuggerContext)))
      .concat(tabs.afterDynamicTabs);
    setDynamicTabs(allActiveTabs);
  }, [tabs, debuggerContext]);

  const changeTabsCallback = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ): void => {
      /**
       * Remove the 'side-content-tab-alert' class that causes tabs flash.
       * To be run when tabs are changed.
       * Currently this style is only used for the "Env Visualizer" tab.
       */
      const resetAlert = (prevTabId: TabId) => {
        const iconId = generateIconId(prevTabId);
        const icon = document.getElementById(iconId);

        // The new selected tab will still have the "side-content-tab-alert" class, but the CSS hides it
        if (icon) {
          icon.classList.remove('side-content-tab-alert');
        }
      };

      if (onChange === undefined) {
        resetAlert(prevTabId);
      } else {
        onChange(newTabId, prevTabId, event);
        resetAlert(prevTabId);
      }
    },
    [onChange]
  );

  return props.renderFunction(dynamicTabs, changeTabsCallback);
};

export default GenericSideContent;
