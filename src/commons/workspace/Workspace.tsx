import { FocusStyleManager } from '@blueprintjs/core';
import { Resizable, ResizableProps, ResizeCallback } from 're-resizable';
import * as React from 'react';
import { Prompt } from 'react-router';

import ControlBar, { ControlBarProps } from '../controlBar/ControlBar';
import Editor, { EditorProps } from '../editor/Editor';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import Repl, { ReplProps } from '../repl/Repl';
import SideContent, { SideContentProps } from '../sideContent/SideContent';

export type WorkspaceProps = DispatchProps & StateProps;

type DispatchProps = {
  handleEditorHeightChange: (height: number) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleSideContentHeightChange: (height: number) => void;
};

type StateProps = {
  // Either editorProps or mcqProps must be provided
  controlBarProps: ControlBarProps;
  customEditor?: JSX.Element;
  editorProps?: EditorProps;
  editorHeight?: string | number;
  editorWidth: string;
  hasUnsavedChanges?: boolean;
  mcqProps?: McqChooserProps;
  replProps: ReplProps;
  sideContentHeight?: number;
  sideContentProps: SideContentProps;
  sideContentIsResizeable?: boolean;
};

const Workspace: React.FC<WorkspaceProps> = props => {
  const editorDividerDiv = React.useRef<HTMLDivElement | null>(null);
  const leftParentResizable = React.useRef<Resizable | null>(null);
  const maxDividerHeight = React.useRef<number | null>(null);
  const sideDividerDiv = React.useRef<HTMLDivElement | null>(null);

  FocusStyleManager.onlyShowFocusOnTabs();

  React.useEffect(() => {
    if (props.sideContentIsResizeable && maxDividerHeight.current === null) {
      maxDividerHeight.current = sideDividerDiv.current!.clientHeight;
    }
  });

  const controlBarProps = () => {
    return { ...props.controlBarProps };
  };

  const editorResizableProps = () => {
    const onResizeStop: ResizeCallback = (_a, _b, _c, diff) =>
      props.handleEditorWidthChange((diff.width * 100) / window.innerWidth);
    return {
      className: 'resize-editor left-parent',
      enable: rightResizeOnly,
      minWidth: 0,
      onResize: toggleEditorDividerDisplay,
      onResizeStop,
      ref: leftParentResizable,
      size: { width: props.editorWidth, height: '100%' },
      as: undefined as any // re-resizable bug - wrong typedef
    } as ResizableProps;
  };

  const sideContentResizableProps = () => {
    const onResizeStop: ResizeCallback = (_a, _b, ref, _c) =>
      props.handleSideContentHeightChange(ref.clientHeight);
    return {
      bounds: 'parent',
      className: 'resize-side-content',
      enable: bottomResizeOnly,
      onResize: toggleDividerDisplay,
      onResizeStop
    } as ResizableProps;
  };

  /**
   * Snaps the left-parent resizable to 100% or 0% when percentage width goes
   * above 95% or below 5% respectively. Also changes the editor divider width
   * in the case of < 5%.
   */
  const toggleEditorDividerDisplay: ResizeCallback = (_a, _b, ref) => {
    const leftThreshold = 5;
    const rightThreshold = 95;
    const editorWidthPercentage = ((ref as HTMLDivElement).clientWidth / window.innerWidth) * 100;
    // update resizable size
    if (editorWidthPercentage > rightThreshold) {
      leftParentResizable.current!.updateSize({ width: '100%', height: '100%' });
    } else if (editorWidthPercentage < leftThreshold) {
      leftParentResizable.current!.updateSize({ width: '0%', height: '100%' });
    }
    // Update divider margin
    if (editorWidthPercentage < leftThreshold) {
      editorDividerDiv.current!.style.marginRight = '0.5rem';
    } else {
      editorDividerDiv.current!.style.marginRight = '0';
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
    // TODO: trace missing MCQ bug
    if (props.customEditor) {
      return props.customEditor;
    } else if (props.editorProps) {
      return <Editor {...props.editorProps} />;
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

  return (
    <div className="workspace">
      {props.hasUnsavedChanges ? (
        <Prompt
          message={'You have changes that may not be saved. Are you sure you want to leave?'}
        />
      ) : null}
      <ControlBar {...controlBarProps()} />
      <div className="row workspace-parent">
        <div className="editor-divider" ref={editorDividerDiv} />
        <Resizable {...editorResizableProps()}>{createWorkspaceInput(props)}</Resizable>
        <div className="right-parent">
          {props.sideContentIsResizeable === undefined || props.sideContentIsResizeable
            ? resizableSideContent
            : sideContent}
          <Repl {...props.replProps} />
        </div>
      </div>
    </div>
  );
};

const rightResizeOnly = {
  top: false,
  right: true,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false
};

const bottomResizeOnly = {
  top: false,
  right: false,
  bottom: true,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false
};

export default Workspace;
