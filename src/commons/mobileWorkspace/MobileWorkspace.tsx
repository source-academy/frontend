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
  editorProps?: EditorProps;
  customEditor?: JSX.Element; // Only used in Sourcecast and Sourcereel - to test in the future
  hasUnsavedChanges?: boolean; // Not used in Playground - to test in the future in other Workspaces
  mcqProps?: McqChooserProps; // Not used in Playground - to test in the future in other Workspaces
  replProps: ReplProps;
  mobileSideContentProps: MobileSideContentProps;
};

const MobileWorkspace: React.FC<MobileWorkspaceProps> = props => {
  const isIOS = /iPhone|iPod/.test(navigator.platform);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches; // Checks if user is accessing from the PWA
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
   * If user is accessing the app from the mobile browser (and not PWA), the effect forces the browser
   * interface to not hide on scroll by setting the application height to be equal to the browser's
   * inner height. This ensures that UI does not break due to hiding of the browser interface (when user
   * is not on the Progressive Web App).
   *
   * This effect fires on every re-render to ensure that the app UI does not break (e.g. during
   * orientation changes, toggling between mobile and desktop Workspaces, etc.)
   *
   * NOTE: Vertical resizing on the desktop browser while in the mobile workspace is not handled.
   * Adding a resize event listener is not feasible as it fires when the Android keyboard is up,
   * causing the app UI to break on Android devices.
   */
  React.useEffect(() => {
    if (!isPWA) {
      document.documentElement.style.setProperty('--application-height', window.innerHeight + 'px');
    }

    // Needed when toggling from mobile to desktop Workspace
    return () => {
      if (!isPWA) {
        document.documentElement.style.setProperty('--application-height', '100vh');
      }
    };
  });

  /**
   * Handle Android users' viewport height to prevent UI distortions when soft keyboard is up
   */
  React.useEffect(() => {
    // Force mobile soft keyboard down when toggling from portrait to landscape.
    if (!isPortrait) {
      if (editorRef.current) {
        editorRef.current.editor.blur();
      }
    }

    if (isPortrait && !isIOS) {
      document.documentElement.style.setProperty('overflow', 'auto');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'height=' + window.innerHeight + ', width=device-width'
      );
    }

    // Reset above CSS and hides draggable Repl on orientation change
    return () => {
      if (!isIOS) {
        document.documentElement.style.setProperty('overflow', 'hidden');
        const metaViewport = document.querySelector('meta[name=viewport]');
        metaViewport!.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
        );
      }
      handleHideRepl();
    };
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

  /**
   * The following 3 'react-draggable' handlers include the updating of 2 CSS variables
   * '--mobile-repl-height' and '--mobile-repl-inner-height'.
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
   * To ensure proper scrolling of overflowing Repl outputs inside the dynamically resizing
   * draggable component, '--mobile-repl-inner-height' is also dynamically updated.
   */
  const onDrag = (e: DraggableEvent, position: { x: number; y: number }): void => {
    document.documentElement.style.setProperty(
      '--mobile-repl-height',
      Math.max(-position.y, 0) + 'px'
    );
    document.documentElement.style.setProperty(
      '--mobile-repl-inner-height',
      Math.max(-position.y - 10, 0) + 'px'
    );
    setDraggableReplPosition(position);
  };

  const handleShowRepl = () => {
    const offset = -300;
    document.documentElement.style.setProperty('--mobile-repl-height', Math.max(-offset, 0) + 'px');
    document.documentElement.style.setProperty(
      '--mobile-repl-inner-height',
      Math.max(-offset - 10, 0) + 'px'
    );
    setDraggableReplPosition({ x: 0, y: offset });
  };

  const handleHideRepl = () => {
    document.documentElement.style.setProperty('--mobile-repl-height', '0px');
    document.documentElement.style.setProperty('--mobile-repl-inner-height', '0px');
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
