import {
  Button,
  Divider,
  H3,
  Icon,
  IconName,
  Intent,
  NumericInput,
  Position,
  Pre
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import ReactMde, { ReactMdeProps } from 'react-mde';
import { Prompt } from 'react-router';

import controlButton from '../../../../commons/ControlButton';
import Markdown from '../../../../commons/Markdown';
import { getPrettyDate } from '../../../../commons/utils/DateHelper';
import { showSimpleConfirmDialog } from '../../../../commons/utils/DialogHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../../../commons/utils/NotificationsHelper';
import { stringParamToInt } from '../../../../commons/utils/ParamParseHelper';

type GradingEditorProps = DispatchProps & OwnProps;

type GradingSaveFunction = (
  submissionId: number,
  questionId: number,
  xpAdjustment: number | undefined,
  comments?: string
) => void;

export type DispatchProps = {
  handleGradingSave: GradingSaveFunction;
  handleGradingSaveAndContinue: GradingSaveFunction;
  handleReautogradeAnswer: (submissionId: number, questionId: number) => void;
};

type OwnProps = {
  solution: number | string | null;
  questionId: number;
  submissionId: number;
  initialXp: number;
  xpAdjustment: number;
  maxXp: number;
  studentName: string;
  comments?: string;
  graderName?: string;
  gradedAt?: string;
};

/**
 * Keeps track of the current editor state
 *
 * @prop xpAdjustmentInput a potentially null string which defines the
 *   result for the number XP input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 *
 * @prop editorValue the text in the react-mde editor, that will be saved
 *   to a comment displayed below the numerical XP
 *
 * @prop selectedTab the selected tab for the react-mde editor
 *   (either 'write' or 'preview')
 *
 * @prop currentlySaving determines whether the 'You have unsaved changes'
 *   prompt should appear on page navigation, to prevent the
 *   'Save and Continue' button from activating the prompt
 *   in cases where navigation occurs before Redux has
 *   updated the props of the Editor component
 *
 *   This may pose a problem if the user clicks 'Save and Continue'
 *   and the saving process fails. The prompt would no longer
 *   appear although there exist unsaved changes
 */
type State = {
  xpAdjustmentInput: string | null;
  editorValue?: string;
  selectedTab: ReactMdeProps['selectedTab'];
  currentlySaving: boolean;
};

const gradingEditorButtonClass = 'grading-editor-button';

class GradingEditor extends React.Component<GradingEditorProps, State> {
  constructor(props: GradingEditorProps) {
    super(props);
    this.state = this.makeInitialState();
  }

  public render() {
    const hasUnsavedChanges = this.hasUnsavedChanges();
    const saveButtonOpts = {
      intent: hasUnsavedChanges ? Intent.WARNING : Intent.NONE,
      minimal: !hasUnsavedChanges,
      className: gradingEditorButtonClass
    };
    const discardButtonOpts = {
      intent: hasUnsavedChanges ? Intent.DANGER : Intent.NONE,
      minimal: !hasUnsavedChanges,
      className: gradingEditorButtonClass
    };
    const saveAndContinueButtonOpts = {
      intent: hasUnsavedChanges ? Intent.SUCCESS : Intent.NONE,
      minimal: !hasUnsavedChanges,
      className: gradingEditorButtonClass
    };
    const onTabChange = (tab: ReactMdeProps['selectedTab']) =>
      this.setState({
        ...this.state,
        selectedTab: tab
      });

    // Derived values
    const totalXp =
      this.props.initialXp + (stringParamToInt(this.state.xpAdjustmentInput || undefined) || 0);
    const xpPlaceholder = `${this.props.initialXp > 0 ? '-' : ''}${this.props.initialXp} to ${
      this.props.maxXp - this.props.initialXp
    }`;

    return (
      <div className="GradingEditor">
        {!this.state.currentlySaving && hasUnsavedChanges ? (
          <Prompt message={'You have unsaved changes. Are you sure you want to leave?'} />
        ) : null}

        <div className="grading-editor-header">
          <H3>Currently Grading: {this.props.studentName}</H3>
        </div>
        {this.props.solution !== null ? (
          <div className="grading-editor-marking-scheme">
            <Pre>{this.props.solution.toString()} </Pre>
          </div>
        ) : null}

        <div className="grading-editor-container">
          <div className="grading-editor-xp">
            <div className="autograder-xp">
              <div>Autograder XP:</div>
              <div>
                {`${this.props.initialXp} / ${this.props.maxXp}`}{' '}
                <Button
                  icon="refresh"
                  small
                  minimal
                  onClick={this.onClickReautogradeAnswer}
                ></Button>
              </div>
            </div>
            <div className="xp-adjustment">
              <div>XP adjustment:</div>
              <div>
                <NumericInput
                  className="adjustment-input"
                  onValueChange={this.onXpAdjustmentInputChange}
                  value={this.state.xpAdjustmentInput || ''}
                  buttonPosition={Position.RIGHT}
                  fill={true}
                  placeholder={xpPlaceholder}
                  intent={totalXp < 0 || totalXp > this.props.maxXp ? Intent.DANGER : Intent.NONE}
                  min={0 - this.props.initialXp}
                  max={
                    this.props.maxXp > this.props.initialXp
                      ? this.props.maxXp - this.props.initialXp
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="final-xp">
              <div>Final XP:</div>
              <div>{`${totalXp} / ${this.props.maxXp}`}</div>
            </div>
          </div>
        </div>

        <div className="react-mde-parent">
          <ReactMde
            value={this.state.editorValue || ''}
            onChange={this.handleEditorValueChange}
            selectedTab={this.state.selectedTab}
            onTabChange={onTabChange}
            generateMarkdownPreview={this.generateMarkdownPreview}
            minEditorHeight={200}
            maxEditorHeight={1000}
            minPreviewHeight={240}
            getIcon={this.blueprintIconProvider}
          />
        </div>

        {this.state.selectedTab === 'write' && (
          <div className="grading-editor-draft-buttons">
            <div className="grading-editor-save-button">
              {controlButton(
                'Save Changes',
                IconNames.FLOPPY_DISK,
                this.validateXpBeforeSave(this.props.handleGradingSave),
                saveButtonOpts
              )}
            </div>
            <div className="grading-editor-discard-button">
              {controlButton(
                'Discard Changes',
                IconNames.TRASH,
                this.discardChanges,
                discardButtonOpts
              )}
            </div>
          </div>
        )}
        <div className="grading-editor-save-continue-button">
          {controlButton(
            'Save and Continue',
            IconNames.UPDATED,
            this.validateXpBeforeSave(this.onClickSaveAndContinue),
            saveAndContinueButtonOpts
          )}
        </div>
        {this.props.graderName && this.props.gradedAt && (
          <>
            <Divider />
            <div className="grading-editor-last-graded-details">
              Last edited by <b>{this.props.graderName}</b> on {getPrettyDate(this.props.gradedAt)}
            </div>
          </>
        )}
      </div>
    );
  }

  public componentDidUpdate(prevProps: GradingEditorProps, prevState: State) {
    if (
      prevProps.submissionId !== this.props.submissionId ||
      prevProps.questionId !== this.props.questionId
    ) {
      this.setState(this.makeInitialState());
    }
  }

  /**
   * A custom icons provider. It uses a bulky mapping function
   * defined below.
   *
   * See {@link https://github.com/andrerpena/react-mde}
   */
  private blueprintIconProvider(name: string) {
    const blueprintIcon = mdeToBlueprintIconMapping(name);
    return <Icon icon={blueprintIcon.iconName} htmlTitle={blueprintIcon.title} />;
  }

  /**
   * Makes sure that the XP values are permissible before
   * returning the relevant saving function (for the 'Save Draft'
   * and 'Submit and Continue' buttons)
   */
  private validateXpBeforeSave =
    (handleSaving: GradingSaveFunction): (() => void) =>
    () => {
      const xpAdjustmentInput =
        stringParamToInt(this.state.xpAdjustmentInput || undefined) || undefined;
      const xp = this.props.initialXp + (xpAdjustmentInput || 0);
      if (xp < 0 || xp > this.props.maxXp) {
        showWarningMessage(
          `XP ${xp.toString()} is out of bounds. Maximum xp is ${this.props.maxXp.toString()}.`
        );
        return;
      } else {
        handleSaving(
          this.props.submissionId,
          this.props.questionId,
          xpAdjustmentInput,
          this.state.editorValue!
        );
      }
    };

  /**
   * Sets the state currentlySaving to true to disable
   * the 'You have unsaved changes' prompt
   */
  private onClickSaveAndContinue: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const callback = (): void => {
      this.props.handleGradingSaveAndContinue(submissionId, questionId, xpAdjustment, comments!);
    };
    this.setState({ ...this.state, currentlySaving: true }, callback);
  };

  private onClickReautogradeAnswer = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: (
        <>
          <p>Reautograde this answer?</p>
          <p>Note: manual adjustments will be reset to 0.</p>
        </>
      ),
      positiveLabel: 'Reautograde',
      positiveIntent: 'danger'
    });
    if (confirm) {
      this.props.handleReautogradeAnswer(this.props.submissionId, this.props.questionId);
    }
  };

  /**
   * Send a warning prompt that loading from a local draft
   * will overwrite any unsaved changes
   */
  private discardChanges = (): void => {
    if (!this.hasUnsavedChanges() || window.confirm('This will reset the editor. Are you sure?')) {
      this.setState(
        {
          ...this.state,
          xpAdjustmentInput: this.props.xpAdjustment!.toString(),
          editorValue: this.props.comments || ''
        },
        () => {
          showSuccessMessage('Discarded!', 1000);
        }
      );
    }
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

  private handleEditorValueChange = (editorValue: string) => {
    this.setState({
      ...this.state,
      editorValue
    });
  };

  private hasUnsavedChanges = () => {
    const xpAdjustmentInput = stringParamToInt(this.state.xpAdjustmentInput || undefined);
    return (
      this.props.xpAdjustment !== xpAdjustmentInput ||
      this.props.comments !== this.state.editorValue
    );
  };

  private generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(
      <Markdown
        content={markdown}
        simplifiedAutoLink={true}
        strikethrough={true}
        tasklists={true}
        openLinksInNewWindow={true}
      />
    );

  private makeInitialState(): State {
    return {
      xpAdjustmentInput: this.props.xpAdjustment.toString(),
      editorValue: this.props.comments,
      selectedTab: 'write',
      currentlySaving: false
    };
  }
}

/**
 * Maps react-mde icon names to blueprintjs counterparts
 * to reduce the number of dependencies on icons and
 * keep a more consistent look
 *
 * Also, generate a HTML title for the icon to be shown on mouse hover
 *
 * By default, react-mde would use FontAwesome5 icons if this
 * icon mapping is not provided
 */
const mdeToBlueprintIconMapping = (name: string): { iconName: IconName; title?: string } => {
  switch (name) {
    case 'header':
      return {
        iconName: IconNames.HEADER,
        title: 'Header Styles'
      };
    case 'bold':
      return {
        iconName: IconNames.BOLD,
        title: 'Bold'
      };
    case 'italic':
      return {
        iconName: IconNames.ITALIC,
        title: 'Italic'
      };
    case 'strikethrough':
      return {
        iconName: IconNames.STRIKETHROUGH,
        title: 'Strikethrough'
      };
    case 'link':
      return {
        iconName: IconNames.LINK,
        title: 'Link'
      };
    case 'quote':
      return {
        iconName: IconNames.CITATION,
        title: 'Quote'
      };
    case 'code':
      return {
        iconName: IconNames.CODE,
        title: 'Monospaced'
      };
    case 'image':
      return {
        iconName: IconNames.MEDIA,
        title: 'Image'
      };
    case 'unordered-list':
      return {
        iconName: IconNames.UNGROUP_OBJECTS,
        title: 'Bullets'
      };
    case 'ordered-list':
      return {
        iconName: IconNames.NUMBERED_LIST,
        title: 'Numbering'
      };
    case 'checked-list':
      return {
        iconName: IconNames.SQUARE,
        title: 'Checkboxes'
      };
    default:
      // For unknown icons, a question mark icon is returned
      return {
        iconName: IconNames.HELP
      };
  }
};

export default GradingEditor;
