import { Classes, Icon, Tab, TabId, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import { useSelector } from 'react-redux';

import { OverallState } from '../../application/ApplicationTypes';
import { ControlBarProps } from '../../controlBar/ControlBar';
import { SideContentTab, SideContentType } from '../../sideContent/SideContentTypes';
import { DebuggerContext, WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import { getDynamicTabs } from './../../sideContent/SideContentHelper';
import MobileControlBar from './MobileControlBar';

export type MobileSideContentProps = DispatchProps & StateProps & MobileControlBarProps;

type DispatchProps = {
  onChange: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;

  handleEditorEval: () => void;
};

type StateProps = {
  animate?: boolean;
  selectedTabId: SideContentType;
  renderActiveTabPanelOnly?: boolean;
  tabs: SideContentTab[];
  workspaceLocation?: WorkspaceLocation;
};

type MobileControlBarProps = {
  mobileControlBarProps: ControlBarProps;
};

type OwnProps = {
  handleShowRepl: () => void;
  handleHideRepl: () => void;
  disableRepl: (newState: boolean) => void;
  editorRef: React.RefObject<ReactAce>;
};

const MobileSideContent: React.FC<MobileSideContentProps & OwnProps> = props => {
  const { tabs, selectedTabId, onChange } = props;
  const [dynamicTabs, setDynamicTabs] = React.useState(tabs);
  const isIOS = /iPhone|iPod/.test(navigator.platform);

  // Fetch debuggerContext from store
  const debuggerContext = useSelector(
    (state: OverallState) =>
      props.workspaceLocation && state.workspaces[props.workspaceLocation].debuggerContext
  );

  React.useEffect(() => {
    // Ensures that the 'Run' tab is at the end of the resulting array
    const copy = [...tabs];
    const runTab = copy.pop();

    const allActiveTabs = copy.concat(getDynamicTabs(debuggerContext || ({} as DebuggerContext)));
    allActiveTabs.push(runTab!);
    setDynamicTabs(allActiveTabs);
  }, [tabs, debuggerContext]);

  /**
   * Generates an icon id given a TabId.
   * Used to set and remove the 'side-content-tab-alert' style to the tabs.
   */
  const generateIconId = (tabId: TabId) => `${tabId}-icon`;

  /**
   * renderedPanels is not memoized since a change in selectedTabId (when changing tabs)
   * would force React.useMemo to recompute the nullary function anyway
   */
  const renderedPanels = () => {
    // TODO: Fix the CSS of all the panels (e.g. subst_visualizer)
    const renderPanel = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
      const tabBody: JSX.Element = workspaceLocation
        ? {
            ...tab.body,
            props: {
              ...tab.body.props,
              workspaceLocation
            }
          }
        : tab.body;

      if (tab.id === SideContentType.mobileEditorRun) {
        return;
      }

      return tab.id === SideContentType.mobileEditor ? (
        // Render the Editor Panel when the selected tab is 'Editor' or 'Run'
        selectedTabId === SideContentType.mobileEditor ||
        selectedTabId === SideContentType.mobileEditorRun ? (
          <div className="mobile-editor-panel" key={'editor'}>
            {tabBody}
          </div>
        ) : (
          <div className="mobile-unselected-panel" key={'editor'}>
            {tabBody}
          </div>
        )
      ) : tab.id === selectedTabId ? (
        // Render the other panels only when their corresponding tab is selected
        <div className="mobile-selected-panel" key={tab.id}>
          {tabBody}
        </div>
      ) : (
        <div className="mobile-unselected-panel" key={tab.id}>
          {tabBody}
        </div>
      );
    };

    return [...dynamicTabs.map(tab => renderPanel(tab, props.workspaceLocation))];
  };

  const renderedTabs = React.useMemo(() => {
    const renderTab = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
      const iconSize = 20;
      const tabId = tab.id === undefined ? tab.label : tab.id;
      const tabTitle: JSX.Element = (
        <Tooltip2
          content={tab.label}
          onOpening={() => {
            // Handles iOS hover requiring double taps to press the button
            if (isIOS) {
              document.getElementById(generateIconId(tabId))?.click();
            }
          }}
        >
          <div className="side-content-tooltip" id={generateIconId(tabId)}>
            <Icon icon={tab.iconName} iconSize={iconSize} />
          </div>
        </Tooltip2>
      );

      return (
        <Tab
          key={tabId}
          id={tabId}
          title={tabTitle}
          disabled={tab.disabled}
          className="side-content-tab"
        />
      );
    };

    return dynamicTabs.map(tab => renderTab(tab, props.workspaceLocation));
  }, [dynamicTabs, props.workspaceLocation, isIOS]);

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

      /**
       * ReactAce's editor value is not updated visually despite state change
       * when the component is 'hidden'. We have to manually trigger the editor
       * to update the visible value when switching to the mobile editor tab.
       */
      if (newTabId === SideContentType.mobileEditor) {
        // props.editorRef.current is null when MCQ is rendered instead of the editor
        props.editorRef.current?.editor.renderer.updateFull();
      }

      // Evaluate program upon pressing the 'Run' tab on mobile
      if (
        (prevTabId === SideContentType.substVisualizer ||
          prevTabId === SideContentType.autograder ||
          prevTabId === SideContentType.testcases) &&
        newTabId === SideContentType.mobileEditorRun
      ) {
        props.handleEditorEval();
      } else if (newTabId === SideContentType.mobileEditorRun) {
        props.handleEditorEval();
        props.handleShowRepl();
      } else {
        props.handleHideRepl();
      }

      // Disable draggable Repl when on stepper tab
      if (
        newTabId === SideContentType.substVisualizer ||
        (prevTabId === SideContentType.substVisualizer &&
          newTabId === SideContentType.mobileEditorRun)
      ) {
        props.disableRepl(true);
      } else {
        props.disableRepl(false);
      }
    },
    [onChange, props]
  );

  return (
    <>
      {renderedPanels()}
      <div className="mobile-tabs-container">
        <Tabs
          id="mobile-side-content"
          onChange={changeTabsCallback}
          renderActiveTabPanelOnly={props.renderActiveTabPanelOnly}
          selectedTabId={props.selectedTabId}
          className={classNames(Classes.DARK, 'mobile-side-content')}
        >
          {renderedTabs}

          {/* Render the bottom ControlBar 'Cog' button only in the Playground or Sicp Workspace */}
          {(props.workspaceLocation === 'playground' || props.workspaceLocation === 'sicp') && (
            <MobileControlBar {...props.mobileControlBarProps} />
          )}
        </Tabs>
      </div>
    </>
  );
};

export default MobileSideContent;
