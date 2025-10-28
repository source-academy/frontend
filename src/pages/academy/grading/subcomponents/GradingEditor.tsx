import {
  Button,
  Dialog,
  Divider,
  H3,
  H5,
  Icon,
  IconName,
  Intent,
  NumericInput,
  Position,
  Pre
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useMemo, useState } from 'react';
import ReactMde, { ReactMdeProps } from 'react-mde';
import { useDispatch } from 'react-redux';
import { AutogradingResult } from 'src/commons/assessment/AssessmentTypes';
import { useTokens } from 'src/commons/utils/Hooks';

import SessionActions from '../../../../commons/application/actions/SessionActions';
import ControlButton from '../../../../commons/ControlButton';
import Markdown from '../../../../commons/Markdown';
import { Prompt } from '../../../../commons/ReactRouterPrompt';
import { postGenerateComments } from '../../../../commons/sagas/RequestsSaga';
import { saveFinalComment } from '../../../../commons/sagas/RequestsSaga';
import { getPrettyDate } from '../../../../commons/utils/DateHelper';
import { showSimpleConfirmDialog } from '../../../../commons/utils/DialogHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../../../commons/utils/notifications/NotificationsHelper';
import { convertParamToInt } from '../../../../commons/utils/ParamParseHelper';
import GradingCommentSelector from './GradingCommentSelector';

type GradingSaveFunction = (
  submissionId: number,
  questionId: number,
  xpAdjustment: number | undefined,
  comments?: string
) => void;

type Props = {
  solution: number | string | null;
  questionId: number;
  submissionId: number;
  initialXp: number;
  xpAdjustment: number;
  maxXp: number;
  studentNames: string[];
  studentUsernames: string[];
  is_llm: boolean;
  comments: string;
  llm_course_level_prompt: string | null;
  llm_assessment_prompt: string | null;
  llm_question_prompt: string | null;
  autoGradingStatus: string;
  autoGradingResults: AutogradingResult[];
  questionContent: string;
  studentAnswer: string | null;
  graderName?: string;
  gradedAt?: string;
  ai_comments?: string[];
};

const gradingEditorButtonClass = 'grading-editor-button';

const GradingEditor: React.FC<Props> = props => {
  const dispatch = useDispatch();
  const tokens = useTokens();
  const { handleGradingSave, handleGradingSaveAndContinue, handleReautogradeAnswer } = useMemo(
    () =>
      ({
        handleGradingSave: (...args) => dispatch(SessionActions.submitGrading(...args)),
        handleGradingSaveAndContinue: (...args) =>
          dispatch(SessionActions.submitGradingAndContinue(...args)),
        handleReautogradeAnswer: (...args) => dispatch(SessionActions.reautogradeAnswer(...args))
      }) satisfies {
        handleGradingSave: GradingSaveFunction;
        handleGradingSaveAndContinue: GradingSaveFunction;
        handleReautogradeAnswer: (submissionId: number, questionId: number) => void;
      },
    [dispatch]
  );

  /**
   * A potentially null string which defines the
   * result for the number XP input. This property being null
   * will show the hint text in the NumericInput. This property is a string
   * so as to allow input such as the '-' character.
   */
  const [xpAdjustmentInput, setXpAdjustmentInput] = useState<string | null>(
    props.xpAdjustment.toString()
  );
  /**
   * The text in the react-mde editor, that will be saved
   * to a comment displayed below the numerical XP */
  const [editorValue, setEditorValue] = useState(props.comments);
  /**
   * The selected tab for the react-mde editor (either 'write' or 'preview')
   */
  const [selectedTab, setSelectedTab] = useState<ReactMdeProps['selectedTab']>('write');
  /**
   * Determines whether the 'You have unsaved changes'
   * prompt should appear on page navigation, to prevent the
   * 'Save and Continue' button from activating the prompt
   * in cases where navigation occurs before Redux has
   * updated the props of the Editor component
   *
   * This may pose a problem if the user clicks 'Save and Continue'
   * and the saving process fails. The prompt would no longer
   * appear although there exist unsaved changes
   */
  const [currentlySaving, setCurrentlySaving] = useState(false);

  useEffect(() => {
    makeInitialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.submissionId, props.questionId]);

  const getCommentSuggestions = async () => {
    const resp = await postGenerateComments(tokens, props.submissionId, props.questionId);
    return resp;
  };

  const onSelectGeneratedComments = (comment: string) => {
    if (!selectedSuggestions.includes(comment)) {
      setSelectedSuggestions([comment, ...selectedSuggestions]);
    }

    setEditorValue(editorValue + comment);
  };

  const postSaveFinalComment = async (comment: string) => {
    const resp = await saveFinalComment(tokens, props.submissionId, props.questionId, comment);
    return resp;
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [hasClickedGenerate, setHasClickedGenerate] = useState<boolean>(false);
  const [isViewLLMPromptOpen, setIsViewLLMPromptOpen] = useState<boolean>(false);

  const makeInitialState = () => {
    setXpAdjustmentInput(props.xpAdjustment.toString());
    setEditorValue(props.comments);
    setSelectedTab('write');
    setCurrentlySaving(false);
    setSuggestions(props.ai_comments || []);
  };

  /**
   * A custom icons provider. It uses a bulky mapping function
   * defined below.
   *
   * See {@link https://github.com/andrerpena/react-mde}
   */
  function blueprintIconProvider(name: string) {
    const blueprintIcon = mdeToBlueprintIconMapping(name);
    return <Icon icon={blueprintIcon.iconName} htmlTitle={blueprintIcon.title} />;
  }

  /**
   * Makes sure that the XP values are permissible before
   * returning the relevant saving function (for the 'Save Draft'
   * and 'Submit and Continue' buttons)
   */
  const validateXpBeforeSave =
    (handleSaving: GradingSaveFunction): (() => void) =>
    () => {
      const newXpAdjustmentInput = convertParamToInt(xpAdjustmentInput || undefined) || undefined;
      const xp = props.initialXp + (newXpAdjustmentInput || 0);
      postSaveFinalComment(editorValue);
      if (xp < 0 || xp > props.maxXp) {
        showWarningMessage(
          `XP ${xp.toString()} is out of bounds. Maximum xp is ${props.maxXp.toString()}.`
        );
        return;
      } else {
        handleSaving(props.submissionId, props.questionId, newXpAdjustmentInput, editorValue);
      }
    };

  /**
   * Sets the state currentlySaving to true to disable
   * the 'You have unsaved changes' prompt
   */
  const onClickSaveAndContinue: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const callback = (): void => {
      handleGradingSaveAndContinue(submissionId, questionId, xpAdjustment, comments!);
    };
    setCurrentlySaving(true);
    // TODO: Check (not sure how) if this results in a regression.
    callback();
  };

  const onClickReautogradeAnswer = async () => {
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
      handleReautogradeAnswer(props.submissionId, props.questionId);
    }
  };

  /**
   * Send a warning prompt that loading from a local draft
   * will overwrite any unsaved changes
   */
  const discardChanges = (): void => {
    if (!checkHasUnsavedChanges() || window.confirm('This will reset the editor. Are you sure?')) {
      setXpAdjustmentInput(props.xpAdjustment!.toString());
      setEditorValue(props.comments);
      // TODO: Check (not sure how) if this results in a regression.
      showSuccessMessage('Discarded!', 1000);
    }
  };

  /**
   * Handles changes in the XP NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  const onXpAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    setXpAdjustmentInput(valueAsString);
  };

  const checkHasUnsavedChanges = () => {
    const newXpAdjustmentInput = convertParamToInt(xpAdjustmentInput || undefined);
    return props.xpAdjustment !== newXpAdjustmentInput || props.comments !== editorValue;
  };

  const checkIsNewQuestion = () => {
    return props.gradedAt === undefined;
  };

  const generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(
      <Markdown
        content={markdown}
        simplifiedAutoLink
        strikethrough
        tasklists
        openLinksInNewWindow
      />
    );

  const copyComposedPromptToClipboard = () => {
    navigator.clipboard.writeText(
      `${props.llm_course_level_prompt || ''}\n
${props.llm_assessment_prompt || ''}\n
${props.llm_question_prompt || ''}\n
**Question:** \n
\`\`\`\n
${props.questionContent}\n
\`\`\`\n\n
**Model Solution:** \n
\`\`\`\n
${props.solution || 'N/A'}\n
\`\`\`\n\n
**Autograding Status:** ${props.autoGradingStatus}\n
**Autograding Results:** ${props.autoGradingResults ? JSON.stringify(props.autoGradingResults) : 'N/A'}\n
The student answer will be given below as part of the User Prompt.\n
**Student Answer:** \n
\`\`\`\n
${props.studentAnswer}\n
\`\`\``
    );
    showSuccessMessage('Composed prompt copied to clipboard!', 2000);
  };

  // Render
  const hasUnsavedChanges = checkHasUnsavedChanges();
  const isNewQuestion = checkIsNewQuestion();
  const saveButtonOpts = {
    intent: hasUnsavedChanges || isNewQuestion ? Intent.WARNING : Intent.NONE,
    minimal: !hasUnsavedChanges && !isNewQuestion,
    className: gradingEditorButtonClass
  };
  const discardButtonOpts = {
    intent: hasUnsavedChanges ? Intent.DANGER : Intent.NONE,
    minimal: !hasUnsavedChanges,
    className: gradingEditorButtonClass
  };
  const saveAndContinueButtonOpts = {
    intent: hasUnsavedChanges || isNewQuestion ? Intent.SUCCESS : Intent.NONE,
    minimal: !hasUnsavedChanges && !isNewQuestion,
    className: gradingEditorButtonClass
  };
  const onTabChange = (tab: ReactMdeProps['selectedTab']) => setSelectedTab(tab);

  // Derived values
  const totalXp = props.initialXp + (convertParamToInt(xpAdjustmentInput || undefined) || 0);
  const xpPlaceholder = `${props.initialXp > 0 ? '-' : ''}${props.initialXp} to ${
    props.maxXp - props.initialXp
  }`;

  return (
    <div className="GradingEditor">
      <Prompt
        when={!currentlySaving && (hasUnsavedChanges || isNewQuestion)}
        message={'You have unsaved changes. Are you sure you want to leave?'}
      />

      <div className="grading-editor-header">
        <H3>
          Currently Grading:
          <br />
          {props.studentNames.map((name, index) => (
            <div key={index}>
              <span>
                {name} ({props.studentUsernames[index]})
              </span>
              <br />
            </div>
          ))}
        </H3>
      </div>
      {props.solution !== null ? (
        <div className="grading-editor-marking-scheme">
          <Pre>{props.solution.toString()} </Pre>
        </div>
      ) : null}

      <div className="grading-editor-container">
        <div className="grading-editor-xp">
          <div className="autograder-xp">
            <div>Autograder XP:</div>
            <div>
              {`${props.initialXp} / ${props.maxXp}`}{' '}
              <Button icon="refresh" small minimal onClick={onClickReautogradeAnswer}></Button>
            </div>
          </div>
          <div className="xp-adjustment">
            <div>XP adjustment:</div>
            <div>
              <NumericInput
                className="adjustment-input"
                onValueChange={onXpAdjustmentInputChange}
                value={xpAdjustmentInput || ''}
                buttonPosition={Position.RIGHT}
                fill={true}
                placeholder={xpPlaceholder}
                intent={totalXp < 0 || totalXp > props.maxXp ? Intent.DANGER : Intent.NONE}
                min={0 - props.initialXp}
                max={props.maxXp > props.initialXp ? props.maxXp - props.initialXp : undefined}
                stepSize={50}
                minorStepSize={25}
                majorStepSize={100}
              />
            </div>
          </div>
          <div className="final-xp">
            <div>Final XP:</div>
            <div>{`${totalXp} / ${props.maxXp}`}</div>
          </div>
        </div>
      </div>

      {props.is_llm && (
        <>
          <Dialog
            title="Full Composed LLM Prompt"
            icon={IconNames.WRENCH}
            isOpen={isViewLLMPromptOpen}
            onClose={() => setIsViewLLMPromptOpen(false)}
          >
            <div className="llm-prompt-dialog">
              <div className="forenote-section">
                <span className="forenote">
                  <b>Note:</b> The titles here are provided merely to distinguish the different
                  sections. They are not included in the final prompt.
                </span>
                <Button
                  onClick={() => {
                    copyComposedPromptToClipboard();
                  }}
                >
                  <Icon icon={IconNames.Clipboard} />
                </Button>
              </div>
              <H3>System Prompt</H3>
              <Divider />
              <H5>Course Level Prompt</H5>
              {props.llm_course_level_prompt || ''}
              <br />
              <H5>Assessment Level Prompt</H5>
              {props.llm_assessment_prompt || ''}
              <br />
              <H5>Question Level Prompt</H5>
              {props.llm_question_prompt || ''}
              <H5>Generic Info From Question</H5>
              **Question:** <br />
              ```
              <br />
              {props.questionContent}
              <br />
              ```
              <br />
              <br />
              **Model Solution:** <br />
              ``` <br />
              {props.solution || 'N/A'}
              <br />
              ```
              <br />
              <br />
              **Autograding Status:** {props.autoGradingStatus} <br />
              **Autograding Results:**{' '}
              {props.autoGradingResults ? JSON.stringify(props.autoGradingResults) : 'N/A'} <br />
              The student answer will be given below as part of the User Prompt.
              <H3>User Prompt</H3>
              <Divider />
              **Student Answer:** <br />
              ``` <br />
              {props.studentAnswer}
              <br />
              ``` <br />
            </div>
          </Dialog>
          <div style={{ marginBottom: '10px' }}>
            <GradingCommentSelector
              onSelect={onSelectGeneratedComments}
              isLoading={hasClickedGenerate}
              comments={suggestions}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                style={{ marginRight: '1rem' }}
                onClick={async () => {
                  setIsViewLLMPromptOpen(true);
                }}
              >
                View Prompt
              </Button>

              <Button
                intent="primary"
                onClick={async () => {
                  setHasClickedGenerate(true);
                  const resp = await getCommentSuggestions();
                  setHasClickedGenerate(false);
                  setSuggestions(resp ? resp.comments : []);
                }}
              >
                Generate Comments
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="react-mde-parent">
        <ReactMde
          value={editorValue}
          onChange={setEditorValue}
          selectedTab={selectedTab}
          onTabChange={onTabChange}
          generateMarkdownPreview={generateMarkdownPreview}
          minEditorHeight={200}
          maxEditorHeight={1000}
          minPreviewHeight={240}
          getIcon={blueprintIconProvider}
        />
      </div>

      {selectedTab === 'write' && (
        <div className="grading-editor-draft-buttons">
          <div className="grading-editor-save-button">
            <ControlButton
              label="Save Changes"
              icon={IconNames.FLOPPY_DISK}
              onClick={validateXpBeforeSave(handleGradingSave)}
              options={saveButtonOpts}
            />
          </div>
          <div className="grading-editor-discard-button">
            <ControlButton
              label="Discard Changes"
              icon={IconNames.TRASH}
              onClick={discardChanges}
              options={discardButtonOpts}
            />
          </div>
        </div>
      )}
      <div className="grading-editor-save-continue-button">
        <ControlButton
          label="Save and Continue"
          icon={IconNames.UPDATED}
          onClick={validateXpBeforeSave(onClickSaveAndContinue)}
          options={saveAndContinueButtonOpts}
        />
      </div>
      {props.graderName && props.gradedAt && (
        <>
          <Divider />
          <div className="grading-editor-last-graded-details">
            Last edited by <b>{props.graderName}</b> on {getPrettyDate(props.gradedAt)}
          </div>
        </>
      )}
    </div>
  );
};

const mdeToBlueprintIconMap: Readonly<Record<string, readonly [IconName, string?]>> = {
  header: [IconNames.HEADER, 'Header Styles'],
  bold: [IconNames.BOLD, 'Bold'],
  italic: [IconNames.ITALIC, 'Italic'],
  strikethrough: [IconNames.STRIKETHROUGH, 'Strikethrough'],
  link: [IconNames.LINK, 'Link'],
  quote: [IconNames.CITATION, 'Quote'],
  code: [IconNames.CODE, 'Monospaced'],
  image: [IconNames.MEDIA, 'Image'],
  'unordered-list': [IconNames.UNGROUP_OBJECTS, 'Bullets'],
  'ordered-list': [IconNames.NUMBERED_LIST, 'Numbering'],
  'checked-list': [IconNames.SQUARE, 'Checkboxes']
} as const;

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
    case 'bold':
    case 'italic':
    case 'strikethrough':
    case 'link':
    case 'quote':
    case 'code':
    case 'image':
    case 'unordered-list':
    case 'ordered-list':
    case 'checked-list': {
      const [iconName, title] = mdeToBlueprintIconMap[name];
      return { iconName, title };
    }
    default:
      // For unknown icons, a question mark icon is returned
      return {
        iconName: IconNames.HELP
      };
  }
};

export default GradingEditor;
