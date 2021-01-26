import { Dialog } from '@blueprintjs/core';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import { useMediaQuery } from 'react-responsive';
import { Prompt } from 'react-router';

import Editor, { EditorProps } from '../editor/Editor';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import Repl, { ReplProps } from '../repl/Repl';
import MobileSideContent, { MobileSideContentProps } from './mobileSideContent/MobileSideContent';

export type MobileWorkspaceProps = StateProps;

type StateProps = {
  // Either editorProps or mcqProps must be provided

  // TODO: Check what is editorProps and mcqChooserProps doing
  // ControlBar props
  editorProps?: EditorProps;
  customEditor?: JSX.Element; // NOTE: So far only used in Sourcecast and Sourcereel
  hasUnsavedChanges?: boolean; // Not used in Playground - check in the future
  mcqProps?: McqChooserProps; // Not used in Playground - check in the future
  replProps: ReplProps;
  mobileSideContentProps: MobileSideContentProps;
};

const MobileWorkspace: React.FC<MobileWorkspaceProps> = props => {
  const isIOS = /iPhone|iPod/.test(navigator.platform);

  /**
   * Boolean to track if Android browser viewheight has been handled.
   * (Reason: Android soft keyboard results in change in mobile browser viewheight, causing UI distortions)
   */
  const handledAndroidViewheight = React.useRef(false);

  /**
   * Callback for isPortrait useMediaQuery()
   */
  const orientationChangeCallback = (isPortrait: boolean) => {
    // Triggers when Android user loaded page in landscape mode and viewheight has not been handled
    if (isPortrait && !isIOS && !handledAndroidViewheight.current) {
      document.documentElement.style.setProperty('overflow', 'auto');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'height=' + window.innerHeight + 'px, width=device-width'
      );

      handledAndroidViewheight.current = true;
    }

    // Whenever orientation changes to landscape, force the soft keyboard down
    if (!isPortrait) {
      editorRef.current!.editor.blur();
    }
  };

  const isPortrait = useMediaQuery(
    { orientation: 'portrait' },
    undefined,
    orientationChangeCallback
  );

  /**
   * If Android user loads page in portrait, handle the web browser viewheight
   */
  React.useEffect(() => {
    if (isPortrait && !isIOS) {
      document.documentElement.style.setProperty('overflow', 'auto');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'height=' + window.innerHeight + 'px, width=device-width'
      );

      handledAndroidViewheight.current = true;
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

  const createReplOutput = () => {
    return <Repl {...props.replProps} />;
  };

  const createEditorProps = {
    createWorkspaceInput: createWorkspaceInput,
    createReplOutput: createReplOutput
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

      {/* TODO: Update CSS for mobile workspace-parent remove flex: row, overflow:hidden, etc. */}

      <MobileSideContent {...props.mobileSideContentProps} {...createEditorProps} />
    </div>
  );
};

export default MobileWorkspace;
