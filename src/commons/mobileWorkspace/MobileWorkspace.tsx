import { Dialog, FocusStyleManager } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import { DraggableEvent } from 'react-draggable';
import { useMediaQuery } from 'react-responsive';
import { Prompt } from 'react-router';

import ControlBar from '../controlBar/ControlBar';
import Editor, { EditorProps } from '../editor/Editor';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import { ReplProps } from '../repl/Repl';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import DraggableRepl from './DraggableRepl';
import MobileKeyboard from './MobileKeyboard';
import MobileSideContent, { MobileSideContentProps } from './mobileSideContent/MobileSideContent';

export type MobileWorkspaceProps = StateProps;

type StateProps = {
  editorProps?: EditorProps; // Either editorProps or mcqProps must be provided
  /**
   * The customEditor prop is only used in Sourcecast and Sourcereel thus far.
   * The component is wrapped in a lambda function in order to pass the editorRef
   * created in MobileWorkspace.tsx into the customEditor component's Ace Editor child.
   * This is to allow for the MobileKeyboard component to work with custom editors.
   * A handler for showing the draggable repl is also passed into the customEditor.
   */
  customEditor?: (
    ref: React.RefObject<ReactAce>,
    handleShowDraggableRepl: () => void
  ) => JSX.Element;
  hasUnsavedChanges?: boolean; // Not used in Playground
  mcqProps?: McqChooserProps; // Not used in Playground
  replProps: ReplProps;
  mobileSideContentProps: MobileSideContentProps;
};

const MobileWorkspace: React.FC<MobileWorkspaceProps> = props => {
  const isAndroid = /Android/.test(navigator.platform);
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  const isMobile = /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
  const [draggableReplPosition, setDraggableReplPosition] = React.useState({ x: 0, y: 0 });

  // For disabling draggable Repl when in stepper tab
  const [isDraggableReplDisabled, setIsDraggableReplDisabled] = React.useState(false);

  // Get rid of the focus border on blueprint components
  FocusStyleManager.onlyShowFocusOnTabs();

  // Handles the panel height when the mobile top controlbar is rendered in the Assessment Workspace
  React.useEffect(() => {
    if (props.mobileSideContentProps.workspaceLocation === 'assessment') {
      document.documentElement.style.setProperty(
        '--mobile-panel-height',
        'calc(100% - 100px - 1.1rem)'
      );
    }

    return () => {
      document.documentElement.style.setProperty('--mobile-panel-height', 'calc(100% - 70px)');
    };
    // This effect should only trigger once during the initial rendering of the workspace
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The following effect prevents the bottom MobileSideContent tabs from floating above the
   * soft keyboard on Android devices. This is due to the viewport height changing when the soft
   * keyboard is up on Android devices. IOS devices are not affected.
   */
  React.useEffect(() => {
    if (isPortrait && isAndroid) {
      document.documentElement.style.setProperty('overflow', 'auto');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'height=' + window.innerHeight + ', width=device-width'
      );
    }

    // Reset above CSS and hides draggable Repl on orientation change
    return () => {
      if (isAndroid) {
        document.documentElement.style.setProperty('overflow', 'hidden');
        const metaViewport = document.querySelector('meta[name=viewport]');
        metaViewport!.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
        );
      }
      handleHideRepl();
    };
  }, [isPortrait, isAndroid]);

  // Handle custom keyboard input into AceEditor (Editor and Repl Components)
  const editorRef = React.useRef<ReactAce>(null);
  const replRef = React.useRef<ReactAce>(null);
  const emptyRef = React.useRef<ReactAce>(null);
  const [keyboardInputRef, setKeyboardInputRef] = React.useState<React.RefObject<ReactAce>>(
    emptyRef
  );

  React.useEffect(() => {
    editorRef.current?.editor.on('focus', () => {
      setKeyboardInputRef(editorRef);
    });
    replRef.current?.editor.on('focus', () => {
      setKeyboardInputRef(replRef);
    });
    const clearRef = () => setKeyboardInputRef(emptyRef);
    editorRef.current?.editor.on('blur', clearRef);
    replRef.current?.editor.on('blur', clearRef);
  }, []);

  const createWorkspaceInput = () => {
    if (props.customEditor) {
      return props.customEditor(editorRef, handleShowRepl(-100));
    } else if (props.editorProps) {
      return <Editor {...props.editorProps} ref={editorRef} />;
    } else {
      return <McqChooser {...props.mcqProps!} />;
    }
  };

  /**
   * The following 3 'react-draggable' handlers include the updating of CSS variable:
   * '--mobile-repl-height'.
   *
   * 'position: absolute' for the 'react-draggable' component is used in conjunction with the
   * modification of the mobile browser's meta viewport height to ensure that the draggable
   * component (and bottom MobileSideContentTabs) remain at the bottom of the screen when the
   * keyboard is up on Android devices. This is because viewport height changes by default when
   * the keyboard is up on Android devices, causing unexpected UI distortions. IOS devices do
   * not have this problem.
   * ('position: fixed' does not work as the element would then be positioned relative to the
   * browser window, and would still be 'pushed up' by the keyboard)
   *
   * Since 'position: absolute' elements take up 'full space', we have to dynamically update the
   * height of the entire draggable component ('--mobile-repl-height') to ensure that the draggable
   * component is 'properly closed' and does not continue to display content underneath the
   * MobileSideContentTabs.
   *
   * This also ensures proper scrolling of overflowing Repl outputs inside the dynamically resizing
   * draggable component.
   */
  const onDrag = (e: DraggableEvent, position: { x: number; y: number }): void => {
    document.documentElement.style.setProperty(
      '--mobile-repl-height',
      Math.max(-position.y, 0) + 'px'
    );
    setDraggableReplPosition(position);
  };

  const handleShowRepl = (offset: number) => () => {
    document.documentElement.style.setProperty('--mobile-repl-height', Math.max(-offset, 0) + 'px');
    setDraggableReplPosition({ x: 0, y: offset });
  };

  const handleHideRepl = () => {
    setDraggableReplPosition({ x: 0, y: 0 });
    document.documentElement.style.setProperty('--mobile-repl-height', '0px');
  };

  const draggableReplProps = {
    handleShowRepl: handleShowRepl(-300),
    handleHideRepl: handleHideRepl,
    disableRepl: setIsDraggableReplDisabled
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
      body: <div></div>, // placeholder div since run tab does not have a specific panel body
      id: SideContentType.mobileEditorRun,
      toSpawn: () => true
    }),
    []
  );

  const updatedMobileSideContentProps = () => {
    return {
      ...props.mobileSideContentProps,
      tabs: [mobileEditorTab, ...props.mobileSideContentProps.tabs, mobileRunTab]
    };
  };

  return (
    <div className="workspace mobile-workspace">
      {props.hasUnsavedChanges ? (
        <Prompt
          message={'You have changes that may not be saved. Are you sure you want to leave?'}
        />
      ) : null}

      <Dialog
        isOpen={!isPortrait && isMobile}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        isCloseButtonShown={false}
        title="Please turn back to portrait orientation!"
      />

      {/* Render the top ControlBar when it is the Assessment Workspace */}
      {props.mobileSideContentProps.workspaceLocation === 'assessment' && (
        <ControlBar {...props.mobileSideContentProps.mobileControlBarProps} />
      )}

      <MobileSideContent
        {...updatedMobileSideContentProps()}
        {...draggableReplProps}
        editorRef={editorRef}
      />

      <DraggableRepl
        key={'repl'}
        position={draggableReplPosition}
        onDrag={onDrag}
        disabled={isDraggableReplDisabled}
        replProps={props.replProps}
        ref={replRef}
      />

      <MobileKeyboard editorRef={keyboardInputRef} />
    </div>
  );
};

export default MobileWorkspace;
