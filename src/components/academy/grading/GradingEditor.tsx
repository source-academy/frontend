import { Icon, Intent, NumericInput, Position, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import ReactMde, { ReactMdeTypes } from 'react-mde';
import { Prompt } from 'react-router';
import * as Showdown from 'showdown';

import { showWarningMessage } from '../../../utils/notification';
import { stringParamToInt } from '../../../utils/paramParseHelpers';
import { controlButton } from '../../commons';

type GradingEditorProps = DispatchProps & OwnProps;

export type DispatchProps = {
  handleGradingSave: (
    submissionId: number,
    questionId: number,
    comment: string,
    gradeAdjustment: number | undefined,
    xpAdjustment: number | undefined
  ) => void;
};

export type OwnProps = {
  comment: string;
  solution: number | string | null;
  questionId: number;
  submissionId: number;
  initialGrade: number;
  gradeAdjustment: number;
  maxGrade: number;
  initialXp: number;
  xpAdjustment: number;
  maxXp: number;
  studentName: string;
};

/**
 * Keeps track of the current editor state,
 * as well as the grade adjustment in the numeric input.
 *
 * @prop gradeAdjustmentInput a potentially null string which defines the
 *   result for the number grade input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 * @prop xpAdjustmentInput a potentially null string which defines the
 *   result for the number grade input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 */
type State = {
  mdeState: ReactMdeTypes.MdeState;
  gradeAdjustmentInput: string | null;
  xpAdjustmentInput: string | null;
};

class GradingEditor extends React.Component<GradingEditorProps, State> {
  private converter: Showdown.Converter;

  constructor(props: GradingEditorProps) {
    super(props);
    this.state = {
      mdeState: {
        markdown: props.comment
      },
      gradeAdjustmentInput: props.gradeAdjustment.toString(),
      xpAdjustmentInput: props.xpAdjustment.toString()
    };
    /**
     * The markdown-to-html converter for the editor.
     */
    this.converter = new Showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
      openLinksInNewWindow: true
    });
  }

  public render() {
    const hasUnsavedChanges = this.hasUnsavedChanges();
    const saveButtonOpts = {
      intent: hasUnsavedChanges ? Intent.WARNING : Intent.NONE,
      minimal: !hasUnsavedChanges,
      fullWidth: true,
      className: 'grading-editor-save-button'
    };
    return (
      <div className="GradingEditor">
        {hasUnsavedChanges ? (
          <Prompt
            message={'You have changes that may not be saved. Are you sure you want to leave?'}
          />
        ) : null}

        <div className="grading-editor-student-name">
          <h3>Currently Grading: {this.props.studentName}</h3>
        </div>
        {this.props.solution !== null ? (
          <div className="grading-editor-solution">
            <pre> {this.props.solution.toString()} </pre>
          </div>
        ) : null}
        <div className="grading-editor-input-parent">
          <table>
            <tbody>
              <tr>
                <th> {`Auto-grader's grade:`} </th>
                <td>
                  <Text>
                    {this.props.initialGrade} / {this.props.maxGrade}
                  </Text>
                </td>
                <th> {`Auto-grader's XP:`} </th>
                <td>
                  <Text>
                    {this.props.initialXp} / {this.props.maxXp}
                  </Text>
                </td>
              </tr>
              <tr>
                <th> {`Your adjustment:`} </th>
                <td>
                  <NumericInput
                    className="grading-adjustment-input"
                    onValueChange={this.onGradeAdjustmentInputChange}
                    value={this.state.gradeAdjustmentInput || ''}
                    buttonPosition={Position.RIGHT}
                    fill={true}
                    placeholder="Adjust grades relatively here"
                    min={0 - this.props.initialGrade}
                    max={
                      this.props.maxGrade > this.props.initialGrade
                        ? this.props.maxGrade - this.props.initialGrade
                        : undefined
                    }
                  />
                </td>
                <th> {`Your adjustment:`} </th>
                <td>
                  <NumericInput
                    className="grading-adjustment-input"
                    onValueChange={this.onXpAdjustmentInputChange}
                    value={this.state.xpAdjustmentInput || ''}
                    buttonPosition={Position.RIGHT}
                    fill={true}
                    placeholder="Adjust XP relatively here"
                    min={0 - this.props.initialXp}
                    max={
                      this.props.maxXp > this.props.initialXp
                        ? this.props.maxXp - this.props.initialXp
                        : undefined
                    }
                  />
                </td>
              </tr>
              <tr>
                <th> {`Final grade:`} </th>
                <td>
                  <Text>
                    {this.props.initialGrade +
                      (stringParamToInt(this.state.gradeAdjustmentInput || undefined) || 0)}{' '}
                    / {this.props.maxGrade}
                  </Text>
                </td>
                <th> {`Final XP:`} </th>
                <td>
                  <Text>
                    {this.props.initialXp +
                      (stringParamToInt(this.state.xpAdjustmentInput || undefined) || 0)}{' '}
                    / {this.props.maxXp}
                  </Text>
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
        {controlButton('Save', IconNames.FLOPPY_DISK, this.onClickSaveButton, saveButtonOpts)}
      </div>
    );
  }

  /**
   * A custom icons provider. It uses a bulky mapping function
   * defined below.
   *
   * See {@link https://github.com/andrerpena/react-mde}
   */
  private blueprintIconProvider(name: string) {
    return <Icon icon={faToBlueprintIconMapping(name)} />;
  }

  private onClickSaveButton = () => {
    const gradeAdjustmentInput =
      stringParamToInt(this.state.gradeAdjustmentInput || undefined) || undefined;
    const grade = this.props.initialGrade + (gradeAdjustmentInput || 0);
    const xpAdjustmentInput =
      stringParamToInt(this.state.xpAdjustmentInput || undefined) || undefined;
    const xp = this.props.initialXp + (xpAdjustmentInput || 0);
    if (grade < 0 || grade > this.props.maxGrade) {
      showWarningMessage(
        `Grade ${grade.toString()} is out of bounds. Maximum grade is ${this.props.maxGrade.toString()}.`
      );
    } else if (xp < 0 || xp > this.props.maxXp) {
      showWarningMessage(
        `XP ${xp.toString()} is out of bounds. Maximum xp is ${this.props.maxXp.toString()}.`
      );
    } else {
      this.props.handleGradingSave(
        this.props.submissionId,
        this.props.questionId,
        this.state.mdeState.markdown!,
        gradeAdjustmentInput,
        xpAdjustmentInput
      );
    }
  };

  /**
   * Handles changes in the grade NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  private onGradeAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    this.setState({
      ...this.state,
      gradeAdjustmentInput: valueAsString,
      xpAdjustmentInput: String(
        Math.round(valueAsNumber / this.props.maxGrade * this.props.maxXp) || 0
      )
    });
  };

  /**
   * Handles changes in the XP NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  private onXpAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    this.setState({
      ...this.state,
      xpAdjustmentInput: valueAsString
    });
  };

  private handleValueChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({
      ...this.state,
      mdeState
    });
  };

  private hasUnsavedChanges = () => {
    const gradeAdjustmentInput = stringParamToInt(this.state.gradeAdjustmentInput || undefined);
    const xpAdjustmentInput = stringParamToInt(this.state.xpAdjustmentInput || undefined);
    return (
      this.props.comment !== this.state.mdeState.markdown ||
      this.props.gradeAdjustment !== gradeAdjustmentInput ||
      this.props.xpAdjustment !== xpAdjustmentInput
    );
  };

  private generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(this.converter.makeHtml(markdown));
}

/**
 * Maps FontAwesome5 icon names to blueprintjs counterparts.
 * This is to reduce the number of dependencies on icons, and
 * keep a more consistent look.
 */
const faToBlueprintIconMapping = (name: string) => {
  switch (name) {
    case 'heading':
      return IconNames.HEADER;
    case 'bold':
      return IconNames.BOLD;
    case 'italic':
      return IconNames.ITALIC;
    case 'strikethrough':
      return IconNames.STRIKETHROUGH;
    case 'link':
      return IconNames.LINK;
    case 'quote-right':
      return IconNames.CITATION;
    case 'code':
      return IconNames.CODE;
    case 'image':
      return IconNames.MEDIA;
    case 'list-ul':
      return IconNames.PROPERTIES;
    case 'list-ol':
      return IconNames.NUMBERED_LIST;
    case 'tasks':
      return IconNames.TICK;
    default:
      return IconNames.HELP;
  }
};

export default GradingEditor;
