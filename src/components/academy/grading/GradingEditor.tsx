import { Icon, Intent, NumericInput, Position, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import ReactMde, { ReactMdeTypes } from 'react-mde'
import { Prompt } from 'react-router'
import * as Showdown from 'showdown'

import { showWarningMessage } from '../../../utils/notification'
import { stringParamToInt } from '../../../utils/paramParseHelpers'
import { controlButton } from '../../commons'

type GradingEditorProps = DispatchProps & OwnProps

export type DispatchProps = {
  handleGradingSave: (
    submissionId: number,
    questionId: number,
    comments: string,
    adjustment: number | undefined
  ) => void
}

export type OwnProps = {
  adjustment: number
  comments: string
  initialGrade: number
  maximumGrade: number
  questionId: number
  submissionId: number
}

/**
 * Keeps track of the current editor state,
 * as well as the grade adjustment in the numeric input.
 *
 * @prop adjustmentInput a potentially null string. this property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 */
type State = {
  mdeState: ReactMdeTypes.MdeState
  adjustmentInput: string | null
}

class GradingEditor extends React.Component<GradingEditorProps, State> {
  private converter: Showdown.Converter

  constructor(props: GradingEditorProps) {
    super(props)
    this.state = {
      mdeState: {
        markdown: props.comments
      },
      adjustmentInput: props.adjustment.toString()
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

  public render() {
    const hasUnsavedChanges = this.hasUnsavedChanges()
    const saveButtonOpts = hasUnsavedChanges ? { intent: Intent.WARNING, minimal: true } : {}
    return (
      <div className="GradingEditor">
        {hasUnsavedChanges ? (
          <Prompt
            message={'You have changes that may not be saved. Are you sure you want to leave?'}
          />
        ) : null}
        <div className="grading-editor-input-parent">
          <table>
              <tbody>
              <tr>
                <th> {`Auto-grader's grade:`} </th>
                <td>
                  <Text>{this.props.initialGrade} / {this.props.maximumGrade}</Text>
                </td>
              </tr>
              <tr>
                <th> {`Your adjustment:`} </th>
                <td>
                  <NumericInput
                    className="grading-adjustment-input"
                    onValueChange={this.onAdjustmentInputChange}
                    value={this.state.adjustmentInput || ''}
                    buttonPosition={Position.LEFT}
                    fill={true}
                    placeholder="Adjust grades relatively here"
                    min={0 - this.props.initialGrade}
                    max={this.props.maximumGrade - this.props.initialGrade}
                  />
                </td>
              </tr>
              <tr>
                <th> {`Final grade:`} </th>
                <td>
                    <Text>{
                      this.props.initialGrade + 
                      (stringParamToInt(this.state.adjustmentInput || undefined) || 0)
                    } / {this.props.maximumGrade}</Text>
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  {controlButton('Save', IconNames.FLOPPY_DISK, this.onClickSaveButton, saveButtonOpts)}
                </td>
              </tr>
              </tbody>
            </table>
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
      </div>
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
    const adjustmentInput = stringParamToInt(this.state.adjustmentInput || undefined) || undefined
    const grade = this.props.initialGrade + (adjustmentInput || 0)
    if (grade < 0 || grade > this.props.maximumGrade) {
      showWarningMessage(
        `Grade ${grade.toString()} is out of bounds. Maximum grade is ${this.props.maximumGrade.toString()}.`
      )
    } else {
      this.props.handleGradingSave(
        this.props.submissionId,
        this.props.questionId,
        this.state.mdeState.markdown!,
        adjustmentInput
      )
    }
  }

  /**
   * Handles changes in the NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  private onAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    this.setState({
      ...this.state,
      adjustmentInput: valueAsString
    })
  }

  private handleValueChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({
      ...this.state,
      mdeState
    })
  }

  private hasUnsavedChanges = () => {
    const adjustmentInput = stringParamToInt(this.state.adjustmentInput || undefined)
    return (
      this.props.comments !== this.state.mdeState.markdown ||
      this.props.adjustment !== adjustmentInput
    )
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
