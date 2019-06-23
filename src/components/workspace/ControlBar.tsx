import {
  Button,
  Classes,
  Colors,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Switch,
  Text,
  Tooltip
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { externalLibraries } from '../../reducers/externalLibraries';
import { sourceChapters } from '../../reducers/states';

import { ExternalLibraryName } from '../assessment/assessmentShape';
import { controlButton } from '../commons';
import { checkSessionIdExists, createNewSession } from './collabEditing/helper';
import Editor from './Editor';

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
export type ControlBarProps = {
  queryString?: string;
  questionProgress: [number, number] | null;
  sourceChapter: number;
  editorRef?: React.RefObject<Editor>;
  editorSessionId?: string;
  editorValue?: string | null;
  externalLibraryName?: string;
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleEditorEval: () => void;
  handleEditorValueChange?: (newCode: string) => void;
  handleExternalSelect?: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGenerateLz?: () => void;
  handleInterruptEval: () => void;
  handleInvalidEditorSessionId?: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleSetEditorSessionId?: (editorSessionId: string) => void;
  handleToggleEditorAutorun?: () => void;
  hasChapterSelect: boolean;
  hasCollabEditing: boolean;
  hasEditorAutorunButton: boolean;
  hasSaveButton: boolean;
  hasShareButton: boolean;
  hasUnsavedChanges?: boolean;
  isEditorAutorun?: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  editingMode?: string;
  websocketStatus?: number;
  onClickNext?(): any;
  onClickPrevious?(): any;
  onClickReturn?(): any;
  onClickSave?(): any;
  onClickResetTemplate?(): any;
  toggleEditMode?(): void;
};

interface IChapter {
  chapter: number;
  displayName: string;
}

/**
 * Defined for displaying an external library.
 * @see Library under assessmentShape.ts for
 *   the definition of a Library in an assessment.
 */
interface IExternal {
  key: number;
  name: ExternalLibraryName;
  symbols: string[];
}

class ControlBar extends React.PureComponent<ControlBarProps, { joinElemValue: string }> {
  public static defaultProps: Partial<ControlBarProps> = {
    hasChapterSelect: false,
    hasSaveButton: false,
    hasShareButton: true,
    onClickNext: () => {},
    onClickPrevious: () => {},
    onClickSave: () => {},
    onClickResetTemplate: () => {}
  };

  private inviteInputElem: React.RefObject<HTMLInputElement>;
  private shareInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ControlBarProps) {
    super(props);
    this.state = { joinElemValue: '' };
    this.handleChange = this.handleChange.bind(this);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.selectInviteInputText = this.selectInviteInputText.bind(this);
    this.inviteInputElem = React.createRef();
    this.shareInputElem = React.createRef();
  }

  public render() {
    return (
      <div className="ControlBar">
        {this.editorControl()}
        {this.flowControl()}
        {this.replControl()}
      </div>
    );
  }

  private editorControl() {
    const runButton = (
      <Tooltip content="...or press shift-enter in the editor">
        {controlButton('Run', IconNames.PLAY, this.props.handleEditorEval)}
      </Tooltip>
    );
    const autoRunButton = controlButton('Auto', IconNames.AUTOMATIC_UPDATES);
    const stopButton = controlButton('Stop', IconNames.STOP, this.props.handleInterruptEval);
    const debuggerResetButton = controlButton(
      'Stop Debugger',
      IconNames.STOP,
      this.props.handleDebuggerReset
    );
    const pauseButton = controlButton('Pause', IconNames.STOP, this.props.handleDebuggerPause);
    const resumeButton = controlButton(
      'Resume',
      IconNames.CHEVRON_RIGHT,
      this.props.handleDebuggerResume
    );
    const saveButtonOpts = this.props.hasUnsavedChanges
      ? { intent: Intent.WARNING, minimal: false }
      : {};
    const saveButton = this.props.hasSaveButton
      ? controlButton('Save', IconNames.FLOPPY_DISK, this.props.onClickSave, saveButtonOpts)
      : undefined;
    const shareUrl = `${window.location.protocol}//${window.location.hostname}/playground#${
      this.props.queryString
    }`;
    const shareButton = this.props.hasShareButton ? (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Share', IconNames.SHARE, this.props.handleGenerateLz)}
        {this.props.queryString === undefined ? (
          <Text>
            Share your programs! Type something into the editor (left), then click on this button
            again.
          </Text>
        ) : (
          <>
            <input defaultValue={shareUrl} readOnly={true} ref={this.shareInputElem} />
            <CopyToClipboard text={shareUrl}>
              {controlButton('', IconNames.DUPLICATE, this.selectShareInputText)}
            </CopyToClipboard>
          </>
        )}
      </Popover>
    ) : (
      undefined
    );
    const handleStartInvite = () => {
      if (this.props.editorSessionId === '') {
        const onSessionCreated = (sessionId: string) => {
          this.props.handleSetEditorSessionId!(sessionId);
          const code = this.props.editorValue
            ? this.props.editorValue
            : '// Collaborative Editing Mode!';
          this.props.editorRef!.current!.ShareAce.on('ready', () =>
            this.props.handleEditorValueChange!(code)
          );
        };
        createNewSession(onSessionCreated);
      }
    };

    const handleStartJoining = (event: React.FormEvent<HTMLFormElement>) => {
      const onSessionIdExists = () =>
        this.props.handleSetEditorSessionId!(this.state!.joinElemValue);
      const onSessionIdNotExist = () => {
        this.props.handleInvalidEditorSessionId!();
        this.props.handleSetEditorSessionId!('');
      };
      const onServerUnreachable = () => this.props.handleSetEditorSessionId!('');
      checkSessionIdExists(
        this.state.joinElemValue,
        onSessionIdExists,
        onSessionIdNotExist,
        onServerUnreachable
      );
      event.preventDefault();
    };

    const inviteButton = this.props.hasCollabEditing ? (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Invite', IconNames.GRAPH, handleStartInvite)}
        <>
          <input value={this.props.editorSessionId} readOnly={true} ref={this.inviteInputElem} />
          <CopyToClipboard text={'' + this.props.editorSessionId}>
            {controlButton('', IconNames.DUPLICATE, this.selectInviteInputText)}
          </CopyToClipboard>
        </>
      </Popover>
    ) : (
      undefined
    );

    const joinButton = this.props.hasCollabEditing ? (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Join', IconNames.LOG_IN)}
        <>
          <form onSubmit={handleStartJoining}>
            <input type="text" value={this.state.joinElemValue} onChange={this.handleChange} />
            <span className={Classes.POPOVER_DISMISS}>
              {controlButton('', IconNames.KEY_ENTER, null, { type: 'submit' })}
            </span>
          </form>
        </>
      </Popover>
    ) : (
      undefined
    );
    const leaveButton = this.props.hasCollabEditing
      ? controlButton(
          'Leave',
          IconNames.FEED,
          () => {
            this.props.handleSetEditorSessionId!('');
            this.setState({ joinElemValue: '' });
          },
          {
            iconColor: this.props.websocketStatus === 0 ? Colors.RED3 : Colors.GREEN3
          }
        )
      : undefined;
    const chapterSelectButton = this.props.hasChapterSelect
      ? chapterSelect(this.props.sourceChapter, this.props.handleChapterSelect)
      : undefined;
    const externalSelectButton =
      this.props.hasChapterSelect && this.props.externalLibraryName !== undefined
        ? externalSelect(this.props.externalLibraryName, this.props.handleExternalSelect!)
        : undefined;
    const resetTemplateButton = this.props.hasSaveButton
      ? controlButton('Reset', IconNames.REPEAT, this.props.onClickResetTemplate)
      : undefined;
    const toggleAutorunButton = this.props.hasEditorAutorunButton ? (
      <div className="Switch">
        <Switch
          label=""
          checked={this.props.isEditorAutorun}
          onChange={this.props.handleToggleEditorAutorun}
        />
      </div>
    ) : (
      undefined
    );

    const sessionMenuButton = this.props.hasCollabEditing ? (
      <Popover
        content={
          <Menu large={true}>
            {inviteButton}
            {this.props.editorSessionId === '' ? joinButton : leaveButton}
          </Menu>
        }
      >
        {controlButton('Session', IconNames.SOCIAL_MEDIA)}
      </Popover>
    ) : (
      undefined
    );

    return (
      <div className="ControlBar_editor pt-button-group">
        {toggleAutorunButton}
        {this.props.isEditorAutorun
          ? autoRunButton
          : this.props.isRunning
            ? stopButton
            : this.props.isDebugging
              ? null
              : runButton}
        {this.props.isRunning
          ? this.props.isDebugging
            ? null
            : pauseButton
          : this.props.isDebugging
            ? resumeButton
            : null}
        {this.props.isDebugging ? debuggerResetButton : null}
        {saveButton}
        {shareButton} {chapterSelectButton} {externalSelectButton} {resetTemplateButton}
        {sessionMenuButton}
      </div>
    );
  }

  private flowControl() {
    const questionView = this.props.questionProgress
      ? controlButton(
          `Question ${this.props.questionProgress[0]} of ${this.props.questionProgress[1]}  `,
          null,
          null,
          {},
          true
        )
      : undefined;
    const previousButton = this.hasPreviousButton()
      ? controlButton('Previous', IconNames.ARROW_LEFT, this.props.onClickPrevious)
      : undefined;
    const nextButton = this.hasNextButton()
      ? controlButton('Next', IconNames.ARROW_RIGHT, this.props.onClickNext, { iconOnRight: true })
      : undefined;
    const returnButton = this.hasReturnButton()
      ? controlButton('Return to Academy', IconNames.ARROW_RIGHT, this.props.onClickReturn, {
          iconOnRight: true
        })
      : undefined;

    return (
      <div className="ControlBar_flow pt-button-group">
        {previousButton} {questionView} {nextButton} {returnButton}
      </div>
    );
  }

  private replControl() {
    const toggleEditModeButton = this.props.toggleEditMode ? (
      <Tooltip
        content={
          'Switch to ' +
          (this.props.editingMode === 'question' ? 'global' : 'question specific') +
          ' editing mode.'
        }
      >
        {controlButton(
          this.props.editingMode + ' editing mode',
          IconNames.REFRESH,
          this.props.toggleEditMode
        )}
      </Tooltip>
    ) : (
      undefined
    );
    const evalButton = (
      <Tooltip content="...or press shift-enter in the REPL">
        {controlButton('Eval', IconNames.CODE, this.props.handleReplEval)}
      </Tooltip>
    );
    const clearButton = controlButton('Clear', IconNames.REMOVE, this.props.handleReplOutputClear);

    return (
      <div className="ControlBar_repl pt-button-group">
        {this.props.isRunning ? null : evalButton} {clearButton} {toggleEditModeButton}
      </div>
    );
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ joinElemValue: event.target.value });
  }

  private selectShareInputText() {
    if (this.shareInputElem.current !== null) {
      this.shareInputElem.current.focus();
      this.shareInputElem.current.select();
    }
  }

  private selectInviteInputText() {
    if (this.inviteInputElem.current !== null) {
      this.inviteInputElem.current.focus();
      this.inviteInputElem.current.select();
    }
  }

  private hasNextButton() {
    return (
      this.props.questionProgress && this.props.questionProgress[0] < this.props.questionProgress[1]
    );
  }

  private hasPreviousButton() {
    return this.props.questionProgress && this.props.questionProgress[0] > 1;
  }

  private hasReturnButton() {
    return (
      this.props.questionProgress &&
      this.props.questionProgress[0] === this.props.questionProgress[1]
    );
  }
}

function styliseChapter(chap: number) {
  return `Source \xa7${chap}`;
}

const chapters = sourceChapters.map(chap => ({ displayName: styliseChapter(chap), chapter: chap }));

const chapterSelect = (
  currentChap: number,
  handleSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {}
) => (
  <ChapterSelectComponent
    className="pt-minimal"
    items={chapters}
    onItemSelect={handleSelect}
    itemRenderer={chapterRenderer}
    filterable={false}
  >
    <Button
      className="pt-minimal"
      text={styliseChapter(currentChap)}
      rightIcon="double-caret-vertical"
    />
  </ChapterSelectComponent>
);

const ChapterSelectComponent = Select.ofType<IChapter>();

const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
);

const iExternals = Array.from(externalLibraries.entries()).map((entry, index) => ({
  name: entry[0] as ExternalLibraryName,
  key: index,
  symbols: entry[1]
}));

const externalSelect = (
  currentExternal: string,
  handleSelect: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void
) => (
  <ExternalSelectComponent
    className="pt-minimal"
    items={iExternals}
    onItemSelect={handleSelect}
    itemRenderer={externalRenderer}
    filterable={false}
  >
    <Button className="pt-minimal" text={currentExternal} rightIcon="double-caret-vertical" />
  </ExternalSelectComponent>
);

const ExternalSelectComponent = Select.ofType<IExternal>();

const externalRenderer: ItemRenderer<IExternal> = (external, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />
);

export default ControlBar;
