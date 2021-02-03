import { Dialog, FocusStyleManager } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import { DraggableEvent } from 'react-draggable';
import { useMediaQuery } from 'react-responsive';
import { Prompt } from 'react-router';

import Editor, { EditorProps } from '../editor/Editor';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import Repl, { ReplProps } from '../repl/Repl';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import DraggableRepl from './mobileSideContent/DraggableRepl';
import MobileSideContent, { MobileSideContentProps } from './mobileSideContent/MobileSideContent';

export type MobileWorkspaceProps = StateProps;

type StateProps = {
  // Either editorProps or mcqProps must be provided

  // TODO: ControlBar props
  editorProps?: EditorProps;
  customEditor?: JSX.Element; // Only used in Sourcecast and Sourcereel - to test in the future
  hasUnsavedChanges?: boolean; // Not used in Playground - to test in the future in other Workspaces
  mcqProps?: McqChooserProps; // Not used in Playground - to test in the future in other Workspaces
  replProps: ReplProps;
  mobileSideContentProps: MobileSideContentProps;
};

// TODO: Setting editor breakpoint and running program causes app to break

// TODO: Handle Envt Visualizer panel overflowing on mobile

// TODO: Add the hiding of SideContentTab panel description paragraph as state -> so that it will be consistent
// between desktop and mobile workspaces (note that the current hiding logic breaks on iOS after orientation change)

const MobileWorkspace: React.FC<MobileWorkspaceProps> = props => {
  const isIOS = /iPhone|iPod/.test(navigator.platform);
  const [draggableReplPosition, setDraggableReplPosition] = React.useState({ x: 0, y: 0 });

  // For disabling draggable Repl when in stepper tab
  const [isDraggableReplDisabled, setIsDraggableReplDisabled] = React.useState(false);

  // TODO: Orientation change detection is buggy at certain browser dimensions
  // Reason: We changed the meta viewport, which somehow affected react-responsive's calculation of orientation change
  const isPortrait = useMediaQuery({ orientation: 'portrait' });

  React.useEffect(() => {
    // Get rid of the focus border
    FocusStyleManager.onlyShowFocusOnTabs();
  }, []);

  /**
   * Handle Android users' viewport height to prevent UI distortions when soft keyboard is up
   */
  React.useEffect(() => {
    if (!isPortrait) {
      editorRef.current!.editor.blur();
    }

    if (isPortrait && !isIOS) {
      document.documentElement.style.setProperty('overflow', 'auto');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'height=' + window.innerHeight + ', width=device-width'
      );
    } else if (!isPortrait && !isIOS) {
      // Reset the above CSS when browser is in landscape
      document.documentElement.style.setProperty('overflow', 'hidden');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
      );
    }
  }, [isPortrait, isIOS]);

  const editorRef = React.useRef<ReactAce>(null);

  const createWorkspaceInput = () => {
    if (props.customEditor) {
      return props.customEditor;
    } else if (props.editorProps) {
      return <Editor {...props.editorProps} ref={editorRef} />;
    } else {
      return <McqChooser {...props.mcqProps!} />;
    }
  };

  const onDrag = (e: DraggableEvent, position: { x: number; y: number }): void => {
    setDraggableReplPosition(position);
  };

  const handleShowRepl = () => {
    setDraggableReplPosition({ x: 0, y: -300 });
  };

  const handleHideRepl = () => {
    setDraggableReplPosition({ x: 0, y: 0 });
  };

  const mobileEditorTab: SideContentTab = React.useMemo(
    () => ({
      label: 'Editor',
      iconName: IconNames.EDIT,
      body: createWorkspaceInput(),
      id: SideContentType.mobileEditor,
      toSpawn: () => true
    }),
    // eslint-disable-next-line
    [props.customEditor, props.editorProps, props.mcqProps]
  );

  const mobileRunTab: SideContentTab = React.useMemo(
    () => ({
      label: 'Run',
      iconName: IconNames.PLAY,
      body: (
        <DraggableRepl
          key={'repl'}
          position={draggableReplPosition}
          onDrag={onDrag}
          body={<Repl {...props.replProps} />}
          disabled={isDraggableReplDisabled}
        />
      ),
      id: SideContentType.mobileEditorRun,
      toSpawn: () => true
    }),
    [props.replProps, draggableReplPosition, isDraggableReplDisabled]
  );

  const updatedMobileSideContentProps = () => {
    return {
      ...props.mobileSideContentProps,
      mobileTabs: [mobileEditorTab, ...props.mobileSideContentProps.mobileTabs, mobileRunTab]
    };
  };

  const draggableReplProps = {
    handleShowRepl: handleShowRepl,
    handleHideRepl: handleHideRepl,
    disableRepl: setIsDraggableReplDisabled
  };

  return (
    <div className="workspace">
      {props.hasUnsavedChanges ? (
        <Prompt
          message={'You have changes that may not be saved. Are you sure you want to leave?'}
        />
      ) : null}

      <Dialog
        isOpen={!isPortrait}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        isCloseButtonShown={false}
        title="Please turn back to portrait orientation!"
      />

      <MobileSideContent {...updatedMobileSideContentProps()} {...draggableReplProps} />
    </div>
  );
};

export default MobileWorkspace;
