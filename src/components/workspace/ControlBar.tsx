// tslint:disable:no-console
import { Button, Classes, Intent, MenuItem, Popover, Text, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { externalLibraries } from '../../reducers/externalLibraries';
import { sourceChapters } from '../../reducers/states';
import { ExternalLibraryName } from '../assessment/assessmentShape';
import { controlButton } from '../commons';

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
export type ControlBarProps = {
  queryString?: string;
  questionProgress: [number, number] | null;
  sourceChapter: number;
  editorSessionId?: string;
  externalLibraryName?: string;
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleEditorEval: () => void;
  handleExternalSelect?: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGenerateLz?: () => void;
  handleInterruptEval: () => void;
  handleInvalidEditorSessionId?: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleSetEditorSessionId?: (editorSessionId: string) => void;
  handleToggleEditorAutorun?: () => void;
  hasChapterSelect: boolean;
  hasEditorAutorunButton: boolean;
  hasInviteButton: boolean;
  hasJoinButton: boolean;
  hasSaveButton: boolean;
  hasShareButton: boolean;
  hasUnsavedChanges?: boolean;
  isEditorAutorun?: boolean;
  isRunning: boolean;
  websocketStatus?: number;
  onClickNext?(): any;
  onClickPrevious?(): any;
  onClickReturn?(): any;
  onClickSave?(): any;
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

class ControlBar extends React.PureComponent<ControlBarProps, {}> {
  public static defaultProps: Partial<ControlBarProps> = {
    hasChapterSelect: false,
    hasSaveButton: false,
    hasShareButton: true,
    onClickNext: () => {},
    onClickPrevious: () => {},
    onClickSave: () => {}
  };

  private shareInputElem: HTMLInputElement;
  private joinInputElem: React.RefObject<HTMLInputElement>;
  private inviteInputElem: HTMLInputElement;

  constructor(props: ControlBarProps) {
    super(props);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.selectInviteInputText = this.selectInviteInputText.bind(this);
    this.joinInputElem = React.createRef();
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
    const handleStartInvite = () => {
      if (this.props.editorSessionId === '') {
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const id = JSON.parse(xmlhttp.responseText).id;
            this.props.handleSetEditorSessionId!(id);
          }
        };
        xmlhttp.open('GET', 'https://13.250.109.61/gists/latest', true);
        xmlhttp.send();
      }
    };
    const handleStartJoining = (e: React.FormEvent<HTMLFormElement>) => {
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          console.log('Reached server to verify ID');
          const state = JSON.parse(xmlhttp.responseText).state;
          if (state === true) {
            console.log('ID true');
            this.props.handleSetEditorSessionId!(this.joinInputElem.current!.value);
          } else {
            this.props.handleInvalidEditorSessionId!();
            this.props.handleSetEditorSessionId!('');
          }
        } else if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
          console.log('Cannot reach server');
          this.props.handleSetEditorSessionId!('');
        }
      };
      xmlhttp.open('GET', 'https://13.250.109.61/gists/' + this.joinInputElem.current!.value, true);
      xmlhttp.send();

      e.preventDefault();
    };
    const runButton = (
      <Tooltip content="...or press shift-enter in the editor">
        {controlButton('Run', IconNames.PLAY, this.props.handleEditorEval)}
      </Tooltip>
    );
    const stopButton = controlButton('Stop', IconNames.STOP, this.props.handleInterruptEval);
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
            <input
              defaultValue={shareUrl}
              readOnly={true}
              ref={e => (this.shareInputElem = e!)}
              onFocus={this.selectShareInputText}
            />
            <CopyToClipboard text={shareUrl}>
              {controlButton('', IconNames.DUPLICATE, this.selectShareInputText)}
            </CopyToClipboard>
          </>
        )}
      </Popover>
    ) : (
      undefined
    );
    const inviteButton = this.props.hasInviteButton ? (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Invite', IconNames.SHARE, handleStartInvite)}
        <>
          <input
            value={this.props.editorSessionId}
            readOnly={true}
            ref={e => (this.inviteInputElem = e!)}
            onFocus={this.selectInviteInputText}
          />
          <CopyToClipboard text={'' + this.props.editorSessionId}>
            {controlButton('', IconNames.DUPLICATE, this.selectInviteInputText)}
          </CopyToClipboard>
        </>
      </Popover>
    ) : (
      undefined
    );
    const joinButton = this.props.hasJoinButton ? (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Join', IconNames.CHAT)}
        <>
          <form onSubmit={handleStartJoining}>
            <input defaultValue="" ref={this.joinInputElem} />
            <span className={Classes.POPOVER_DISMISS}>
              {controlButton('', IconNames.KEY_ENTER, null, { type: 'submit' })}
            </span>
          </form>
        </>
      </Popover>
    ) : (
      undefined
    );
    const chapterSelectButton = this.props.hasChapterSelect
      ? chapterSelect(this.props.sourceChapter, this.props.handleChapterSelect)
      : undefined;
    const externalSelectButton =
      this.props.hasChapterSelect && this.props.externalLibraryName !== undefined
        ? externalSelect(this.props.externalLibraryName, this.props.handleExternalSelect!)
        : undefined;
    const startAutorunButton = this.props.hasEditorAutorunButton
      ? controlButton('Autorun', IconNames.PLAY, this.props.handleToggleEditorAutorun)
      : undefined;
    const stopAutorunButton = this.props.hasEditorAutorunButton
      ? controlButton('Autorun', IconNames.STOP, this.props.handleToggleEditorAutorun)
      : undefined;
    const indicatorButton = controlButton(
      this.props.websocketStatus === 1 ? 'Connected' : 'Disconnected',
      IconNames.AIRPLANE,
      null
    );
    console.log('Controbar rendering, ws status: ' + this.props.websocketStatus);
    return (
      <div className="ControlBar_editor pt-button-group">
        {this.props.isEditorAutorun ? undefined : this.props.isRunning ? stopButton : runButton}
        {saveButton}
        {shareButton} {chapterSelectButton} {externalSelectButton}
        {this.props.isEditorAutorun ? stopAutorunButton : startAutorunButton}
        {inviteButton} {joinButton} {indicatorButton}
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
    const evalButton = (
      <Tooltip content="...or press shift-enter in the REPL">
        {controlButton('Eval', IconNames.CODE, this.props.handleReplEval)}
      </Tooltip>
    );
    const clearButton = controlButton('Clear', IconNames.REMOVE, this.props.handleReplOutputClear);
    return (
      <div className="ControlBar_repl pt-button-group">
        {this.props.isRunning ? null : evalButton} {clearButton}
      </div>
    );
  }

  private selectShareInputText() {
    this.shareInputElem.focus();
    this.shareInputElem.select();
  }

  private selectInviteInputText() {
    this.inviteInputElem.focus();
    this.inviteInputElem.select();
  }

  private hasNextButton() {
    return (
      this.props.questionProgress && this.props.questionProgress[0] < this.props.questionProgress[1]
    );
  }

  private hasPreviousButton() {
    return this.props.questionProgress && this.props.questionProgress[0] > 0;
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
