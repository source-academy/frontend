import { FocusStyleManager } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Ace } from 'ace-builds';
import React from 'react';
import { DraggableEvent } from 'react-draggable';
import { useMediaQuery } from 'react-responsive';
import { Prompt } from 'react-router';

import ControlBar from '../controlBar/ControlBar';
import EditorContainer, { EditorContainerProps } from '../editor/EditorContainer';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import { ReplProps } from '../repl/Repl';
import { SideBarTab } from '../sideBar/SideBar';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import DraggableRepl from './DraggableRepl';
import MobileKeyboard from './MobileKeyboard';
import MobileSideContent, { MobileSideContentProps } from './mobileSideContent/MobileSideContent';

export type MobileWorkspaceProps = StateProps;

type StateProps = {
  editorContainerProps?: EditorContainerProps; // Either editorProps or mcqProps must be provided
  hasUnsavedChanges?: boolean; // Not used in Playground
  mcqProps?: McqChooserProps; // Not used in Playground
  replProps: ReplProps;
  sideBarProps: {
    tabs: SideBarTab[];
  };
  mobileSideContentProps: MobileSideContentProps;
};

const MobileWorkspace: React.FC<MobileWorkspaceProps> = props => {
  const isAndroid = /Android/.test(navigator.userAgent);
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
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

  const [targetKeyboardInput, setTargetKeyboardInput] = React.useState<Ace.Editor | null>(null);

  const clearTargetKeyboardInput = () => setTargetKeyboardInput(null);

  const enableMobileKeyboardForEditor = (props: EditorContainerProps): EditorContainerProps => {
    const onFocus = (event: any, editor?: Ace.Editor) => {
      if (props.onFocus) {
        props.onFocus(event, editor);
      }
      if (!editor) {
        return;
      }
      setTargetKeyboardInput(editor);
    };
    const onBlur = (event: any, editor?: Ace.Editor) => {
      if (props.onBlur) {
        props.onBlur(event, editor);
      }
      clearTargetKeyboardInput();
    };
    return {
      ...props,
      onFocus,
      onBlur
    };
  };

  const enableMobileKeyboardForRepl = (props: ReplProps): ReplProps => {
    const onFocus = (editor: Ace.Editor) => {
      if (props.onFocus) {
        props.onFocus(editor);
      }
      setTargetKeyboardInput(editor);
    };
    const onBlur = () => {
      if (props.onBlur) {
        props.onBlur();
      }
      clearTargetKeyboardInput();
    };
    return {
      ...props,
      onFocus,
      onBlur
    };
  };

  const createWorkspaceInput = () => {
    if (props.editorContainerProps) {
      const editorContainerProps = {
        ...props.editorContainerProps
      };
      if (editorContainerProps.editorVariant === 'sourcecast') {
        editorContainerProps.setDraggableReplPosition = () => handleShowRepl(-100);
      }
      return <EditorContainer {...enableMobileKeyboardForEditor(props.editorContainerProps)} />;
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

  const handleShowRepl = (offset: number) => {
    document.documentElement.style.setProperty('--mobile-repl-height', Math.max(-offset, 0) + 'px');
    setDraggableReplPosition({ x: 0, y: offset });
  };

  const handleHideRepl = () => {
    setDraggableReplPosition({ x: 0, y: 0 });
    document.documentElement.style.setProperty('--mobile-repl-height', '0px');
  };

  const handleEditorEval = props.editorContainerProps?.handleEditorEval;
  const handleTabChangeForRepl = React.useCallback(
    (newTabId: SideContentType, prevTabId: SideContentType) => {
      // Evaluate program upon pressing the run tab.
      if (newTabId === SideContentType.mobileEditorRun) {
        if (handleEditorEval) {
          handleEditorEval();
        }
      }

      // Show the REPL upon pressing the run tab if the previous tab is not listed below.
      if (
        newTabId === SideContentType.mobileEditorRun &&
        !(
          prevTabId === SideContentType.substVisualizer ||
          prevTabId === SideContentType.autograder ||
          prevTabId === SideContentType.testcases
        )
      ) {
        handleShowRepl(-300);
      } else {
        handleHideRepl();
      }

      // Disable draggable REPL when on the files & stepper tab.
      if (
        newTabId === SideContentType.folder ||
        newTabId === SideContentType.substVisualizer ||
        (prevTabId === SideContentType.substVisualizer &&
          newTabId === SideContentType.mobileEditorRun)
      ) {
        setIsDraggableReplDisabled(true);
      } else {
        setIsDraggableReplDisabled(false);
      }
    },
    [handleEditorEval]
  );

  const onChange = props.mobileSideContentProps.onChange;
  const onSideContentTabChange = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      onChange(newTabId, prevTabId, event);
      handleTabChangeForRepl(newTabId, prevTabId);
    },
    [handleTabChangeForRepl, onChange]
  );

  // Convert sidebar tabs with a side content tab ID into side content tabs.
  const sideBarTabs: SideContentTab[] = props.sideBarProps.tabs.filter(tab => tab.id !== undefined);

  const mobileEditorTab: SideContentTab = React.useMemo(
    () => ({
      label: 'Editor',
      iconName: IconNames.EDIT,
      body: null,
      id: SideContentType.mobileEditor
    }),
    []
  );

  const mobileRunTab: SideContentTab = React.useMemo(
    () => ({
      label: 'Run',
      iconName: IconNames.PLAY,
      body: null,
      id: SideContentType.mobileEditorRun
    }),
    []
  );

  const updatedMobileSideContentProps = React.useCallback(() => {
    return {
      ...props.mobileSideContentProps,
      onChange: onSideContentTabChange,
      tabs: {
        beforeDynamicTabs: [
          ...sideBarTabs,
          mobileEditorTab,
          ...props.mobileSideContentProps.tabs.beforeDynamicTabs
        ],
        afterDynamicTabs: [...props.mobileSideContentProps.tabs.afterDynamicTabs, mobileRunTab]
      }
    };
  }, [
    onSideContentTabChange,
    mobileEditorTab,
    mobileRunTab,
    props.mobileSideContentProps,
    sideBarTabs
  ]);

  const inAssessmentWorkspace =
    props.mobileSideContentProps.workspaceLocation === 'assessment' ||
    props.mobileSideContentProps.workspaceLocation === 'githubAssessment';

  return (
    <div className="workspace mobile-workspace">
      {props.hasUnsavedChanges ? (
        <Prompt
          message={'You have changes that may not be saved. Are you sure you want to leave?'}
        />
      ) : null}

      {/* Render the top ControlBar when it is the Assessment Workspace */}
      {inAssessmentWorkspace && (
        <ControlBar {...props.mobileSideContentProps.mobileControlBarProps} />
      )}

      <div>
        <div className="mobile-editor-panel">{createWorkspaceInput()}</div>
        <MobileSideContent {...updatedMobileSideContentProps()} />
      </div>

      <DraggableRepl
        key="repl"
        position={draggableReplPosition}
        onDrag={onDrag}
        disabled={isDraggableReplDisabled}
        replProps={enableMobileKeyboardForRepl(props.replProps)}
      />

      <MobileKeyboard targetKeyboardInput={targetKeyboardInput} />
    </div>
  );
};

export default MobileWorkspace;
