import { ButtonGroup, Icon, NumericInput, Position } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import ReactMde, { ReactMdeTypes } from 'react-mde'
import * as Showdown from 'showdown'
import { controlButton } from '../../commons'

type GradingEditorProps = DispatchProps & OwnProps & StateProps

export type DispatchProps = {
  handleCommentsChange: (s: string) => void
  handleGradeAdjustmentChange: (i: number | undefined) => void
  handleGradingInputSave: (s: string, i: number | undefined) => void
}

export type OwnProps = {
  maximumGrade: number
  initialGrade: number
}

export type StateProps = {
  comments: string
  adjustment: number | undefined
}

/**
 * Keeps track of the current editor state,
 * as well as the grade adjustment in the numeric input.
 *
 * adjustment can be undefined to show the hint text.
 */
type State = {
  mdeState: ReactMdeTypes.MdeState
  adjustmentInput: number | undefined
}

class GradingEditor extends React.Component<GradingEditorProps, State> {
  private converter: Showdown.Converter

  constructor(props: GradingEditorProps) {
    super(props)
    this.state = {
      mdeState: {
        markdown: this.props.comments
      },
      adjustmentInput: this.props.adjustment
    }
    /**
     * The markdown-to-html converter for the editor.
     */
    this.converter = new Showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
      openLinksInNewWindow: true
    })
  }

  /**
   * Update the redux state's grading comments value, using the latest
   * value in the local state.
   */
  public componentWillUnmount() {
    this.props.handleCommentsChange(this.state.mdeState.markdown!)
    this.props.handleGradeAdjustmentChange(this.state.adjustmentInput)
  }

  public render() {
    return (
      <>
        <div className="grading-editor-input-parent">
          <ButtonGroup fill={true}>
            <NumericInput
              onValueChange={this.onAdjustmentInputChange}
              value={this.state.adjustmentInput}
              buttonPosition={Position.LEFT}
              placeholder="Adjust grades relatively here"
              min={ 0 - this.props.initialGrade }
              max={ this.props.maximumGrade - this.props.initialGrade }
            />
            {controlButton('Save', IconNames.FLOPPY_DISK, this.onClickSaveButton)}
          </ButtonGroup>
        </div>
        <div className="react-mde-parent">
          <ReactMde
            buttonContentOptions={{
              iconProvider: this.blueprintIconProvider
            }}
            layout={'vertical'}
            onChange={this.handleValueChange}
            editorState={this.state.mdeState}
            generateMarkdownPreview={this.generateMarkdownPreview}
          />
        </div>
      </>
    )
  }

  /**
   * A custom icons provider. It uses a bulky mapping function
   * defined below.
   *
   * See {@link https://github.com/andrerpena/react-mde}
   */
  private blueprintIconProvider(name: string) {
    return <Icon icon={faToBlueprintIconMapping(name)} />
  }

  private onClickSaveButton = () => {
    this.props.handleGradingInputSave(this.state.mdeState.markdown!, this.state.adjustmentInput)
  }

  private onAdjustmentInputChange = (newValue: number) => {
    this.setState({
      ...this.state,
      adjustmentInput: newValue
    })
  }

  private handleValueChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({
      ...this.state,
      mdeState 
    })
  }

  private generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(this.converter.makeHtml(markdown))
}

/**
 * Maps FontAwesome5 icon names to blueprintjs counterparts.
 * This is to reduce the number of dependencies on icons, and
 * keep a more consistent look.
 */
const faToBlueprintIconMapping = (name: string) => {
  switch (name) {
    case 'heading':
      return IconNames.HEADER
    case 'bold':
      return IconNames.BOLD
    case 'italic':
      return IconNames.ITALIC
    case 'strikethrough':
      return IconNames.STRIKETHROUGH
    case 'link':
      return IconNames.LINK
    case 'quote-right':
      return IconNames.CITATION
    case 'code':
      return IconNames.CODE
    case 'image':
      return IconNames.MEDIA
    case 'list-ul':
      return IconNames.PROPERTIES
    case 'list-ol':
      return IconNames.NUMBERED_LIST
    case 'tasks':
      return IconNames.TICK
    default:
      return IconNames.HELP
  }
}

export default GradingEditor
