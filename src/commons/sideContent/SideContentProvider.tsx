import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { getDynamicTabs, SideContentContext } from './SideContentHelper';
import { SideContentState, SideContentTab, SideContentType } from './SideContentTypes';

type Props = {
  children?: (tabInfo: SideContentState) => JSX.Element;
  workspaceLocation?: WorkspaceLocation;
  selectedTabId?: SideContentType;
};

// Retrieve debuggerContext straight from the store
const connector = connect(
  (state: OverallState, { workspaceLocation }: Props) => ({
    debuggerContext: workspaceLocation && state.workspaces[workspaceLocation].debuggerContext
  }),
  null
);

const SideContentProvider = ({
  children,
  selectedTabId,
  debuggerContext
}: Props & ConnectedProps<typeof connector>) => {
  // List of tab IDs that should have the alert effect applied
  const [alertedTabs, setAlertedTabs] = React.useState<string[]>([]);

  // Tabs spawned by debuggerContext
  const [moduleTabs, setModuleTabs] = React.useState<SideContentTab[]>([]);

  React.useEffect(() => {
    // Every time debugger context changes, we reset moduleTabs
    // and set all of them to 'alerted', except for the current tab
    // if it is a module tab
    let ignore = false;
    (async () => {
      if (ignore) return;
      ignore = true;

      const tabs = await getDynamicTabs(debuggerContext);
      setModuleTabs(tabs);
      setAlertedTabs(moduleTabs.map(({ label }) => label).filter(id => id !== selectedTabId));
    })();

    return () => {
      ignore = false;
    };
  }, [debuggerContext]);

  const dynTabs = {
    moduleTabs,
    alertedTabs,
    addAlert: (tab: string) => setAlertedTabs([...alertedTabs, tab]),
    visitTab: (id: string) => setAlertedTabs(alertedTabs.filter(tabId => tabId !== id))
  };

  return (
    <SideContentContext.Provider value={dynTabs}>
      {children && children(dynTabs)}
    </SideContentContext.Provider>
  );
};
/**
 * This component abstracts loading module tabs from the debugger context. It keeps track of which
 * tabs require the alert status to be shown.
 * 
 * SideContent components can use the `SideContentContext` to access the side content state from anywhere
 * in the component tree:
 * 
 * ```ts
 * const { addAlert } = React.useContext(SideContextContext);
 * // Cause the environment viualizer's icon to display the alert when the tab is spawned
 * React.useEffect(() => addAlert(SideContentType.envVisualizer), []);
 * ```
 */
export default connector(SideContentProvider);
