import { Button, Divider, FormGroup, H2, Icon, InputGroup, TextArea } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useCallback, useState } from 'react';

import type { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import classes from './PixelbotConfigPanel.module.css';
import PixelbotDocumentsPanel from './PixelbotDocumentsPanel';

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
- FIRST, check for a direct name match: if the student's message is a prefix, substring, or fuzzy match (typos, different spacing/casing/punctuation, missing trailing numbers/versions) of any document's "id" or "title", always include that document. This check takes priority over everything below.
- You will be told today's date above. If the student asks about a time period (e.g. "this week", "last week", "today"), use each document's "release_date" against today's date to determine which documents fall in that period.
- Cast a wide net: a topic can appear across multiple document types (lectures, exercises, past papers, etc.), so a document may be relevant even if its title doesn't mention the topic directly — use its "doc_type" as an additional signal.
- If no documents are relevant (e.g. the question is about the SICP textbook only), return an empty array: []
- Do NOT include any explanation, just the JSON array.

Example response: ["cs1101s-final-2023", "cs1101s-midterm-2023"]
Example response for no relevant documents: []`;

const DEFAULT_ANSWER_PROMPT = `You are a competent tutor assisting a computer science student on the Source Academy platform.

IF course documents (lecture slides, tutorial sheets, recitation sheets, past exams, or other course materials) are attached:
- Answer using ONLY the provided documents. Do not make up information.
- When citing information from a document, mention its title.
- If the provided documents do not contain enough information to answer, say so clearly.

IF no course documents are attached:
- Answer the question using your general knowledge.
- Mention that you're answering from general knowledge and not from specific course materials.
- Be helpful and provide a clear, accurate answer.

GENERAL INSTRUCTIONS:
- Match the programming language used by the course. If the course uses "Source" (a restricted
  subset of Python), do NOT use Python features not supported in Source (classes, decorators,
  comprehensions, imports, async/await, generators, exception handling), and use display or
  display_list instead of print.
- Format your response using markdown, with fenced code blocks labelled for the language you're
  using (e.g. \`\`\`python ... \`\`\`).`;

function PixelbotConfigPanel(props: Props) {
  const { pixelbotRoutingPrompt, pixelbotAnswerPrompt, feedbackUrl } = props.courseConfiguration;

  const [editingRouting, setEditingRouting] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(false);
  const [routingDraft, setRoutingDraft] = useState('');
  const [answerDraft, setAnswerDraft] = useState('');

  const startEditRouting = useCallback(() => {
    setRoutingDraft(pixelbotRoutingPrompt || DEFAULT_ROUTING_PROMPT);
    setEditingRouting(true);
  }, [pixelbotRoutingPrompt]);

  const saveRouting = useCallback(() => {
    const updatedConfig = {
      ...props.courseConfiguration,
      pixelbotRoutingPrompt: routingDraft,
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
      pixelbotAnswerPrompt: answerDraft,
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
        <PixelbotDocumentsPanel />
      </div>

      <div className={classes['section']}>
        <div className={classes['section-header']}>
          <div>
            <div className={classes['section-title']}>Feedback URL</div>
            <div className={classes['section-helper']}>
              Set a URL where users can submit feedback. A small &ldquo;Any feedback?&rdquo; link
              will appear in the top-right corner of the navigation bar.
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
                feedbackUrl: e.target.value,
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
        <div className={classes['section-header']}>
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
          fill
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
        <div className={classes['section-header']}>
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
          fill
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
}

export default PixelbotConfigPanel;
