import {
  Button,
  Callout,
  Divider,
  FormGroup,
  H2,
  Icon,
  InputGroup,
  Intent,
  TextArea
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import classes from 'src/styles/PixelbotConfig.module.scss';

import {
  Tokens,
  UpdateCourseConfiguration
} from '../../../../commons/application/types/SessionTypes';
import { getPixelbotDocumentMap } from '../../../../commons/sagas/RequestsSaga';

type Props = {
  courseConfiguration: UpdateCourseConfiguration;
  setCourseConfiguration: (courseConfiguration: UpdateCourseConfiguration) => void;
  onSave: (courseConfiguration: UpdateCourseConfiguration) => void;
};

const DEFAULT_ROUTING_PROMPT = `You are a document routing assistant. Given a student's question and a list of available course documents, determine which documents are most relevant to answering the question.

Here is the list of available documents (JSON):
%DOCUMENT_MAP%

Instructions:
- Return ONLY a JSON array of document IDs that are relevant to the student's question.
- Select at most 5 documents.
- If no documents are relevant (e.g. the question is about the SICP textbook only), return an empty array: []
- Do NOT include any explanation, just the JSON array.

Example response: ["cs1101s-final-2023", "cs1101s-midterm-2023"]
Example response for no relevant documents: []`;

const DEFAULT_ANSWER_PROMPT = `You are a competent tutor assisting a computer science student on the Source Academy platform.

IF course documents (exams, lecture slides, tutorial sheets, or recitation sheets) are attached as PDF files:
- Answer using ONLY the provided documents. Do not make up information.
- When citing information from a document, mention the document title and year.
- If the provided documents do not contain enough information to answer, say so clearly.

IF no course documents are attached:
- Answer the question using your general knowledge.
- Mention that you're answering from general knowledge and not from specific course materials.
- Be helpful and provide a clear, accurate answer.

GENERAL INSTRUCTIONS:
- The Source Academy platform uses the "Source" language, a restricted subset of JavaScript. When providing code examples, use valid Source language syntax.
- Do NOT use JavaScript features not supported in Source (classes, modules, imports/exports, async/await, generators).
- Use display or display_list instead of console.log.
- Format your response using markdown. Use fenced code blocks with the language identifier for all code examples, e.g. \`\`\`javascript ... \`\`\`.`;

const PixelbotConfigPanel: React.FC<Props> = props => {
  const { pixelbotRoutingPrompt, pixelbotAnswerPrompt, feedbackUrl } = props.courseConfiguration;

  const [documentMap, setDocumentMap] = useState<string>('');
  const [documentMapError, setDocumentMapError] = useState<string>('');
  const [editingRouting, setEditingRouting] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(false);
  const [routingDraft, setRoutingDraft] = useState('');
  const [answerDraft, setAnswerDraft] = useState('');

  const accessToken = useTypedSelector(state => state.session.accessToken);
  const refreshToken = useTypedSelector(state => state.session.refreshToken);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;
    const fetchDocumentMap = async () => {
      try {
        const data = await getPixelbotDocumentMap({ accessToken, refreshToken } as Tokens);
        if (data) {
          setDocumentMap(JSON.stringify(data, null, 2));
        } else {
          setDocumentMapError('Failed to fetch document map.');
        }
      } catch {
        setDocumentMapError('Failed to fetch document map.');
      }
    };
    fetchDocumentMap();
  }, [accessToken, refreshToken]);

  const startEditRouting = useCallback(() => {
    setRoutingDraft(pixelbotRoutingPrompt || DEFAULT_ROUTING_PROMPT);
    setEditingRouting(true);
  }, [pixelbotRoutingPrompt]);

  const saveRouting = useCallback(() => {
    const updatedConfig = {
      ...props.courseConfiguration,
      pixelbotRoutingPrompt: routingDraft
    };
    props.setCourseConfiguration(updatedConfig);
    props.onSave(updatedConfig);
    setEditingRouting(false);
  }, [props, routingDraft]);

  const resetRouting = useCallback(() => {
    setRoutingDraft(DEFAULT_ROUTING_PROMPT);
  }, []);

  const cancelRouting = useCallback(() => {
    setEditingRouting(false);
  }, []);

  const startEditAnswer = useCallback(() => {
    setAnswerDraft(pixelbotAnswerPrompt || DEFAULT_ANSWER_PROMPT);
    setEditingAnswer(true);
  }, [pixelbotAnswerPrompt]);

  const saveAnswer = useCallback(() => {
    const updatedConfig = {
      ...props.courseConfiguration,
      pixelbotAnswerPrompt: answerDraft
    };
    props.setCourseConfiguration(updatedConfig);
    props.onSave(updatedConfig);
    setEditingAnswer(false);
  }, [props, answerDraft]);

  const resetAnswer = useCallback(() => {
    setAnswerDraft(DEFAULT_ANSWER_PROMPT);
  }, []);

  const cancelAnswer = useCallback(() => {
    setEditingAnswer(false);
  }, []);

  const routingDisplay = pixelbotRoutingPrompt || DEFAULT_ROUTING_PROMPT;
  const answerDisplay = pixelbotAnswerPrompt || DEFAULT_ANSWER_PROMPT;

  return (
    <div className={classes['pixelbot-config']}>
      <H2>Pixelbot Settings</H2>
      <p className={classes['description']}>
        Pixel uses a two-step prompting pipeline. The routing prompt (Step 1) selects relevant
        documents from the directory. The answer prompt (Step 2) generates the final response using
        those documents.
      </p>

      <Divider style={{ marginBottom: '24px' }} />

      <div className={classes['section']}>
        <div className={classes['section-header-center']}>
          <div>
            <div className={classes['section-title']}>Feedback URL</div>
            <div className={classes['section-helper']}>
              Set a URL where users can submit feedback. A small "Any feedback?" link will appear in
              the top-right corner of the navigation bar.
            </div>
          </div>
        </div>
        <FormGroup inline={false} labelFor="feedbackUrl">
          <InputGroup
            id="feedbackUrl"
            value={feedbackUrl || ''}
            placeholder="e.g. https://forms.google.com/..."
            onChange={e => {
              const updatedConfig = {
                ...props.courseConfiguration,
                feedbackUrl: e.target.value
              };
              props.setCourseConfiguration(updatedConfig);
            }}
          />
        </FormGroup>
        <Button
          text="Save Feedback URL"
          onClick={() => props.onSave(props.courseConfiguration)}
          style={{ marginBottom: '8px' }}
        />
      </div>

      <div className={classes['section']}>
        <div className={classes['section-header-center']}>
          <div>
            <div className={classes['section-title']}>Routing Prompt (System Prompt 1)</div>
            <div className={classes['section-helper']}>
              Sent with the document directory to select relevant documents. Use %DOCUMENT_MAP% as a
              placeholder for the document list.
            </div>
          </div>
          {!editingRouting && (
            <Icon
              icon={IconNames.EDIT}
              className={classes['edit-icon']}
              onClick={startEditRouting}
            />
          )}
        </div>
        <TextArea
          id="pixelbotRoutingPrompt"
          className={classes['prompt-textarea']}
          fill={true}
          readOnly={!editingRouting}
          value={editingRouting ? routingDraft : routingDisplay}
          onChange={e => setRoutingDraft(e.target.value)}
        />
        {editingRouting && (
          <div className={classes['action-buttons']}>
            <Button text="Done" onClick={saveRouting} />
            <Button text="Reset to Default" onClick={resetRouting} />
            <Button text="Cancel" onClick={cancelRouting} />
          </div>
        )}
      </div>

      <div className={classes['section']}>
        <div className={classes['section-header-center']}>
          <div>
            <div className={classes['section-title']}>Document Directory (read-only)</div>
            <div className={classes['section-helper']}>
              The current document map used by Pixel for routing. This is managed on the server.
            </div>
          </div>
        </div>
        {documentMapError ? (
          <Callout intent={Intent.WARNING}>{documentMapError}</Callout>
        ) : (
          <TextArea
            id="pixelbotDocumentMap"
            className={classes['document-map-textarea']}
            fill={true}
            readOnly={true}
            value={documentMap}
          />
        )}
      </div>

      <div className={classes['section']}>
        <div className={classes['section-header-center']}>
          <div>
            <div className={classes['section-title']}>Answer Prompt (System Prompt 2)</div>
            <div className={classes['section-helper']}>
              Sent with the fetched documents to generate the final answer to the student.
            </div>
          </div>
          {!editingAnswer && (
            <Icon
              icon={IconNames.EDIT}
              className={classes['edit-icon']}
              onClick={startEditAnswer}
            />
          )}
        </div>
        <TextArea
          id="pixelbotAnswerPrompt"
          className={classes['prompt-textarea']}
          fill={true}
          readOnly={!editingAnswer}
          value={editingAnswer ? answerDraft : answerDisplay}
          onChange={e => setAnswerDraft(e.target.value)}
        />
        {editingAnswer && (
          <div className={classes['action-buttons']}>
            <Button text="Done" onClick={saveAnswer} />
            <Button text="Reset to Default" onClick={resetAnswer} />
            <Button text="Cancel" onClick={cancelAnswer} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelbotConfigPanel;
