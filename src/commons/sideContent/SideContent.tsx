import React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { MapStateToProps } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import { propsAreEqual } from '../utils/MemoizeHelper';
import { visitSideContent } from './SideContentActions';
import SideContentContainer, {
  mapDispatchToProps as containerMapDispatchToProps,
  mapStateToProps as containerMapStateToProps,
  SideContentContainerDispatchProps,
  SideContentContainerOwnProps,
  SideContentContainerStateProps
} from './SideContentContainer';

export type SideContentProps = SideContentContainerOwnProps;

export const mapStateToProps: MapStateToProps<
  SideContentContainerStateProps,
  SideContentProps,
  OverallState
> = (state, { workspaceLocation, ...props }) =>
  workspaceLocation
    ? containerMapStateToProps(state.workspaces[workspaceLocation].sideContent, props)
    : {
        tabs: [],
        alerts: []
      };

export const mapDispatchToProps: MapDispatchToProps<
  SideContentContainerDispatchProps,
  SideContentProps
> = (dispatch, { workspaceLocation, ...props }) =>
  containerMapDispatchToProps(newId => {
    if (workspaceLocation) dispatch(visitSideContent(newId, workspaceLocation));
  }, props);

const SideContent = connect(mapStateToProps, mapDispatchToProps)(SideContentContainer);
export default React.memo(SideContent, propsAreEqual);
