import { useDispatch } from 'react-redux';
import { storiesVisitSideContent } from 'src/features/stories/StoriesActions';

import { useTypedSelector } from '../utils/Hooks';
import { visitSideContent } from './SideContentActions';
import type { ChangeTabsCallback, SideContentLocation, SideContentTab } from './SideContentTypes';

type SideContentProviderProps = {
  tabs?: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  onChange?: ChangeTabsCallback;
  children: (
    tabs: SideContentTab[],
    alerts: string[],
    callback: ChangeTabsCallback,
    height?: number
  ) => JSX.Element;
} & SideContentLocation;

/**
 * Wrapper that manages how SideContent events are handled.\
 * When a tab is visited, `visitSideContent` is dispatched for regular workspaces, but `storiesVisitSideContent` is dispatched for the stories workspace
 * Similarly, 'alertSideContent` and `storiesAlertSideContent` are dispatched when the alert context's `alertSideContent` function is called
 */
export default function SideContentProvider({
  tabs,
  children,
  onChange,
  ...props
}: SideContentProviderProps) {
  const dispatch = useDispatch();

  const { dynamicTabs, alerts, height } = useTypedSelector(state => {
    if (!props.workspaceLocation) {
      return {
        dynamicTabs: [],
        alerts: []
      };
    }
    return props.workspaceLocation !== 'stories'
      ? state.workspaces[props.workspaceLocation].sideContent
      : state.stories.envs[props.storiesEnv].sideContent;
  });

  const allTabs = tabs
    ? [...tabs.beforeDynamicTabs, ...dynamicTabs, ...tabs.afterDynamicTabs]
    : dynamicTabs;

  const changeTabsCallback: ChangeTabsCallback = (newId, oldId, event) => {
    if (onChange) onChange(newId, oldId, event);
    if (props.workspaceLocation === 'stories') {
      // If in stories workspace, dispatch different event
      dispatch(storiesVisitSideContent(newId, props.storiesEnv));
    } else if (props.workspaceLocation) {
      dispatch(visitSideContent(newId, props.workspaceLocation));
    }
  };

  return children(allTabs, alerts, changeTabsCallback, height);
}
