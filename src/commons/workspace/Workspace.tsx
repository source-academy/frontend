import { Button, FocusStyleManager, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useFullscreen } from '@mantine/hooks';
import { Enable, NumberSize, Resizable, ResizableProps, ResizeCallback } from 're-resizable';
import { Direction } from 're-resizable/lib/resizer';
import React, { useEffect, useRef, useState } from 'react';

import ControlBar, { ControlBarProps } from '../controlBar/ControlBar';
import EditorContainer, { EditorContainerProps } from '../editor/EditorContainer';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import { Prompt } from '../ReactRouterPrompt';
import Repl, { ReplProps } from '../repl/Repl';
import SideBar, { SideBarTab } from '../sideBar/SideBar';
import SideContent, { SideContentProps } from '../sideContent/SideContent';
import { useDimensions } from '../utils/Hooks';

export type WorkspaceProps = DispatchProps & StateProps;

type DispatchProps = {
  handleSideContentHeightChange: (height: number) => void;
};

type StateProps = {
  // Either editorProps or mcqProps must be provided
  controlBarProps: ControlBarProps;
  editorContainerProps?: EditorContainerProps;
  hasUnsavedChanges?: boolean;
  mcqProps?: McqChooserProps;
  replProps: ReplProps;
  sideBarProps: {
    tabs: SideBarTab[];
  };
  sideContentProps: SideContentProps;
  sideContentIsResizeable?: boolean;
};

const Workspace: React.FC<WorkspaceProps> = props => {
  const sideBarResizable = useRef<Resizable | null>(null);
  const contentContainerDiv = useRef<HTMLDivElement>(null);
  const editorDividerDiv = useRef<HTMLDivElement>(null);
  const leftParentResizable = useRef<Resizable | null>(null);
  const maxDividerHeight = useRef<number | null>(null);
  const sideDividerDiv = useRef<HTMLDivElement>(null);
  const [contentContainerWidth] = useDimensions(contentContainerDiv);
  const [expandedSideBarWidth, setExpandedSideBarWidth] = useState(200);
  const [isSideBarExpanded, setIsSideBarExpanded] = useState(true);

  const sideBarCollapsedWidth = 40;

  const expandSideBar = () => setIsSideBarExpanded(true);
  const collapseSideBar = () => setIsSideBarExpanded(false);

  FocusStyleManager.onlyShowFocusOnTabs();

  useEffect(() => {
    if (props.sideContentIsResizeable && maxDividerHeight.current === null) {
      maxDividerHeight.current = sideDividerDiv.current!.clientHeight;
    }
  });

  const sideBarResizableProps = (): ResizableProps & {
    ref: React.MutableRefObject<Resizable | null>;
  } => {
    const onResizeStop: ResizeCallback = (
      event: MouseEvent | TouchEvent,
      direction: Direction,
      elementRef: HTMLElement,
      delta: NumberSize
    ) => {
      const sideBarWidth = elementRef.clientWidth;
      if (sideBarWidth !== sideBarCollapsedWidth) {
        setExpandedSideBarWidth(sideBarWidth);
      }
    };
    const isSideBarRendered = props.sideBarProps.tabs.length !== 0;
    const minWidth = isSideBarRendered ? sideBarCollapsedWidth : 'auto';
    return {
      enable: isSideBarRendered ? rightResizeOnly : noResize,
      minWidth,
      maxWidth: '50%',
      onResize: toggleSideBarDividerDisplay,
      onResizeStop,
      ref: sideBarResizable,
      size: {
        width: isSideBarRendered && isSideBarExpanded ? expandedSideBarWidth : minWidth,
        height: '100%'
      },
      defaultSize: { width: minWidth, height: '100%' }
    };
  };

  const editorResizableProps = () => {
    return {
      className: 'resize-editor left-parent',
      enable: rightResizeOnly,
      minWidth: 0,
      onResize: toggleEditorDividerDisplay,
      ref: leftParentResizable,
      defaultSize: { width: '50%', height: '100%' },
      as: undefined as any // re-resizable bug - wrong typedef
    } as ResizableProps;
  };

  const sideContentResizableProps = () => {
    const onResizeStop: ResizeCallback = (_a, _b, ref) =>
      props.handleSideContentHeightChange(ref.clientHeight);
    return {
      bounds: 'parent',
      className: 'resize-side-content',
      enable: bottomResizeOnly,
      onResize: toggleDividerDisplay,
      onResizeStop
    } as ResizableProps;
  };

  const toggleSideBarDividerDisplay: ResizeCallback = (
    event: MouseEvent | TouchEvent,
    direction: Direction,
    elementRef: HTMLElement,
    delta: NumberSize
  ) => {
    const minWidthThreshold = 100;
    const sideBarWidth = elementRef.clientWidth;
    if (sideBarWidth < minWidthThreshold) {
      const sideBar = sideBarResizable.current;
      if (sideBar === null) {
        throw Error('Reference to SideBar not found when resizing.');
      }
      sideBar.updateSize({ width: sideBarCollapsedWidth, height: '100%' });
      setIsSideBarExpanded(false);
    } else {
      setIsSideBarExpanded(true);
    }
  };

  /**
   * Snaps the left-parent resizable to 100% or 0% when percentage width goes
   * above 95% or below 5% respectively. Also changes the editor divider width
   * in the case of < 5%.
   */
  const toggleEditorDividerDisplay: ResizeCallback = (_a, _b, ref) => {
    const leftThreshold = 5;
    const rightThreshold = 95;
    const editorWidthPercentage =
      ((ref as HTMLDivElement).clientWidth / contentContainerWidth) * 100;
    // update resizable size
    if (editorWidthPercentage > rightThreshold) {
      leftParentResizable.current!.updateSize({ width: '100%', height: '100%' });
    } else if (editorWidthPercentage < leftThreshold) {
      leftParentResizable.current!.updateSize({ width: '0%', height: '100%' });
    }
  };

  /**
   * Hides the side-content-divider div when side-content is resized downwards
   * so that it's bottom border snaps flush with editor's bottom border
   */
  const toggleDividerDisplay: ResizeCallback = (_a, _b, ref) => {
    maxDividerHeight.current =
      sideDividerDiv.current!.clientHeight > maxDividerHeight.current!
        ? sideDividerDiv.current!.clientHeight
        : maxDividerHeight.current;
    const resizableHeight = (ref as HTMLDivElement).clientHeight;
    const rightParentHeight = (ref.parentNode as HTMLDivElement).clientHeight;
    if (resizableHeight + maxDividerHeight.current! + 2 > rightParentHeight) {
      sideDividerDiv.current!.style.display = 'none';
    } else {
      sideDividerDiv.current!.style.display = 'initial';
    }
  };

  /**
   * Pre-condition: `props.editorProps`
   * XOR `props.mcq` are defined.
   */
  const createWorkspaceInput = (props: WorkspaceProps) => {
    if (props.editorContainerProps) {
      return <EditorContainer {...props.editorContainerProps} />;
    } else {
      return <McqChooser {...props.mcqProps!} />;
    }
  };

  const sideContent = <SideContent {...props.sideContentProps} />;
  const resizableSideContent = (
    <Resizable {...sideContentResizableProps()}>
      {sideContent}
      <div className="side-content-divider" ref={sideDividerDiv} />
    </Resizable>
  );

  const {
    ref: fullscreenRef,
    toggle: toggleFullscreen,
    fullscreen: isFullscreen
  } = useFullscreen<HTMLDivElement>();

  const fullscreenContainerRef = React.useRef<HTMLDivElement | null>(null);
  const setFullscreenRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      fullscreenContainerRef.current = node;
      fullscreenRef(node);
    },
    [fullscreenRef]
  );

  return (
    <div className="workspace">
      <Prompt
        when={!!props.hasUnsavedChanges}
        message={'You have changes that may not be saved. Are you sure you want to leave?'}
      />
      <ControlBar {...props.controlBarProps} />
      <div className="workspace-parent">
        <Resizable {...sideBarResizableProps()}>
          <SideBar
            {...props.sideBarProps}
            isExpanded={isSideBarExpanded}
            expandSideBar={expandSideBar}
            collapseSideBar={collapseSideBar}
          />
        </Resizable>
        <div className="row content-parent" ref={contentContainerDiv}>
          <div className="editor-divider" ref={editorDividerDiv} />
          <Resizable {...editorResizableProps()}>{createWorkspaceInput(props)}</Resizable>
          <div className="right-parent" ref={setFullscreenRefs}>
            <Tooltip
              className="fullscreen-button"
              content={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              portalContainer={fullscreenContainerRef.current || undefined}
            >
              <Button
                minimal
                icon={isFullscreen ? IconNames.MINIMIZE : IconNames.MAXIMIZE}
                onClick={toggleFullscreen}
              />
            </Tooltip>
            {props.sideContentIsResizeable === undefined || props.sideContentIsResizeable
              ? resizableSideContent
              : sideContent}
            <Repl {...props.replProps} />
          </div>
        </div>
      </div>
    </div>
  );
};

const rightResizeOnly: Enable = { right: true };
const bottomResizeOnly: Enable = { bottom: true };
const noResize: Enable = {};

export default Workspace;
