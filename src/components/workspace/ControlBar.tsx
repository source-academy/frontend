import { Button, Intent, MenuItem, Popover, Text, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ItemRenderer, Select } from '@blueprintjs/select'
import * as React from 'react'
import * as CopyToClipboard from 'react-copy-to-clipboard'
import { GOOGLE_CLIENT_ID } from '../../utils/constants'

import { externalLibraries } from '../../reducers/externalLibraries'
import { sourceChapters } from '../../reducers/states'
import { ExternalLibraryName } from '../assessment/assessmentShape'
import { controlButton } from '../commons'

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
export type ControlBarProps = {
  queryString?: string
  questionProgress: [number, number] | null
  sourceChapter: number
  externalLibraryName?: string
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void
  handleEditorEval: () => void
  handleExternalSelect?: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void
  handleGenerateLz?: () => void
  handleInterruptEval: () => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
  hasChapterSelect: boolean
  hasSaveButton: boolean
  hasShareButton: boolean
  hasOpenButton: boolean
  hasUnsavedChanges?: boolean
  isRunning: boolean
  onClickNext?(): any
  onClickPrevious?(): any
  onClickReturn?(): any
  onClickSave?(): any
  onClickOpen?(): any
}

interface IChapter {
  chapter: number
  displayName: string
}

/**
 * Defined for displaying an external library.
 * @see Library under assessmentShape.ts for
 *   the definition of a Library in an assessment.
 */
interface IExternal {
  key: number
  name: ExternalLibraryName
  symbols: string[]
}

class ControlBar extends React.PureComponent<ControlBarProps, {}> {
  public static defaultProps: Partial<ControlBarProps> = {
    hasChapterSelect: false,
    hasSaveButton: false,
    hasShareButton: true,
    hasOpenButton: false,
    onClickNext: () => {},
    onClickPrevious: () => {},
    onClickSave: () => {}
  }

  private shareInputElem: HTMLInputElement

  constructor(props: ControlBarProps) {
    super(props)
    this.selectShareInputText = this.selectShareInputText.bind(this)
  }

  public render() {
    return (
      <div className="ControlBar">
        {this.editorControl()}
        {this.flowControl()}
        {this.replControl()}
      </div>
    )
  }

  private editorControl() {
    const runButton = (
      <Tooltip content="...or press shift-enter in the editor">
        {controlButton('Run', IconNames.PLAY, this.props.handleEditorEval)}
      </Tooltip>
    )
    const stopButton = controlButton('Stop', IconNames.STOP, this.props.handleInterruptEval)
    const saveButtonOpts = this.props.hasUnsavedChanges
      ? { intent: Intent.WARNING, minimal: false }
      : {}
    const saveButton = this.props.hasSaveButton
      ? controlButton('Save', IconNames.FLOPPY_DISK, this.props.onClickSave, saveButtonOpts)
      : undefined
    const shareUrl = `${window.location.protocol}//${window.location.hostname}/playground#${
      this.props.queryString
    }`
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
    )
    const chapterSelectButton = this.props.hasChapterSelect
      ? chapterSelect(this.props.sourceChapter, this.props.handleChapterSelect)
      : undefined
    const externalSelectButton =
      this.props.hasChapterSelect && this.props.externalLibraryName !== undefined
        ? externalSelect(this.props.externalLibraryName, this.props.handleExternalSelect!)
        : undefined

    const saveAsButton = this.props.hasOpenButton
      ? controlButton('Save As', IconNames.FLOPPY_DISK, this.props.onClickSave, saveButtonOpts)
      : saveButton

    const linkButton = this.props.hasSaveButton
      ? undefined
      : controlButton(
          'Link to Google Drive',
          IconNames.DOCUMENT_SHARE,
          () => {
            const redirectUrl = `${window.location.protocol}//${
              window.location.hostname
            }/playground`
            window.location.assign(
              `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=token&scope=profile+email+https://www.googleapis.com/auth/drive.file`
            )
          },
          {}
        )

    const openButton = this.props.hasOpenButton
      ? controlButton('Open', IconNames.DOCUMENT_OPEN, this.props.onClickOpen, {})
      : undefined

    return (
      <div className="ControlBar_editor pt-button-group">
        {this.props.isRunning ? stopButton : runButton} {saveAsButton}
        {shareButton} {chapterSelectButton} {externalSelectButton}
        {linkButton} {openButton}
      </div>
    )
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
      : undefined
    const previousButton = this.hasPreviousButton()
      ? controlButton('Previous', IconNames.ARROW_LEFT, this.props.onClickPrevious)
      : undefined
    const nextButton = this.hasNextButton()
      ? controlButton('Next', IconNames.ARROW_RIGHT, this.props.onClickNext, { iconOnRight: true })
      : undefined
    const returnButton = this.hasReturnButton()
      ? controlButton('Return to Academy', IconNames.ARROW_RIGHT, this.props.onClickReturn, {
          iconOnRight: true
        })
      : undefined

    return (
      <div className="ControlBar_flow pt-button-group">
        {previousButton} {questionView} {nextButton} {returnButton}
      </div>
    )
  }

  private replControl() {
    const evalButton = (
      <Tooltip content="...or press shift-enter in the REPL">
        {controlButton('Eval', IconNames.CODE, this.props.handleReplEval)}
      </Tooltip>
    )
    const clearButton = controlButton('Clear', IconNames.REMOVE, this.props.handleReplOutputClear)
    return (
      <div className="ControlBar_repl pt-button-group">
        {this.props.isRunning ? null : evalButton} {clearButton}
      </div>
    )
  }

  private selectShareInputText() {
    this.shareInputElem.focus()
    this.shareInputElem.select()
  }

  private hasNextButton() {
    return (
      this.props.questionProgress && this.props.questionProgress[0] < this.props.questionProgress[1]
    )
  }

  private hasPreviousButton() {
    return this.props.questionProgress && this.props.questionProgress[0] > 0
  }

  private hasReturnButton() {
    return (
      this.props.questionProgress &&
      this.props.questionProgress[0] === this.props.questionProgress[1]
    )
  }
}

function styliseChapter(chap: number) {
  return `Source \xa7${chap}`
}

const chapters = sourceChapters.map(chap => ({ displayName: styliseChapter(chap), chapter: chap }))

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
)

const ChapterSelectComponent = Select.ofType<IChapter>()

const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
)

const iExternals = Array.from(externalLibraries.entries()).map((entry, index) => ({
  name: entry[0] as ExternalLibraryName,
  key: index,
  symbols: entry[1]
}))

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
)

const ExternalSelectComponent = Select.ofType<IExternal>()

const externalRenderer: ItemRenderer<IExternal> = (external, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />
)

export default ControlBar
