import { Classes, Icon, Tab, Tabs, Tooltip } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import React from 'react';

// TODO: Relook at whether there is a need to create separate SideContent stuff for mobile
// Else, reorganise the stuff to clearly demarcate desktop vs mobile vs common stuff
import { SideContentTab, SideContentType } from '../../sideContent/SideContentTypes';
import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';

export type MobileSideContentProps = DispatchProps & StateProps;

type DispatchProps = {
  // Removing handleActiveTabChange as it updates Redux store...
  // handleActiveTabChange: (activeTab: SideContentType) => void;

  // TODO: Check if onChange prop is optional, as it is currently optional in desktop version
  onChange?: (
    // TODO: this uses the current desktop SideContentType for now
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;
};

type StateProps = {
  animate?: boolean;
  selectedTabId?: SideContentType;
  defaultSelectedTabId?: SideContentType;
  renderActiveTabPanelOnly?: boolean;
  tabs?: SideContentTab[]; // TODO: Remove optional tag once tags prop is implemented for mobile
  workspaceLocation?: WorkspaceLocation;
};

const MobileSideContent: React.FC<MobileSideContentProps> = props => {
  // TODO: To be removed
  const generateIcon = (icon: IconName, label: string) => (
    <Tooltip content={label}>
      <div className="side-content-tooltip">
        <Icon icon={icon} iconSize={20} style={{}} />
      </div>
    </Tooltip>
  );

  // TODO: Temporarily hardcoding tabs here.
  // To be passed in as props (tabs), and mapped to generate JSX (see SideContent.tsx)
  // id mobile-side-content is not styled yet
  // TODO: Add onChangeTabs callback like in SideContent.tsx
  return (
    <Tabs id="mobile-side-content" className={Classes.DARK}>
      <Tab
        id="editor"
        title={generateIcon(IconNames.EDIT, 'EDITOR')}
        className="side-content-tab"
      />
      <Tab
        id="datavisualizer"
        title={generateIcon(IconNames.EYE_OPEN, 'DATA VISUALIZER')}
        className="side-content-tab"
      />
      <Tab
        id="inspector"
        title={generateIcon(IconNames.SEARCH, 'INSPECTOR')}
        className="side-content-tab"
      />
      <Tab
        id="envtvisualizer"
        title={generateIcon(IconNames.GLOBE, 'ENVIRONMENT VISUALIZER')}
        className="side-content-tab"
      />
      <Tab id="run" title={generateIcon(IconNames.PLAY, 'RUN')} className="side-content-tab" />
    </Tabs>
  );
};

export default MobileSideContent;
