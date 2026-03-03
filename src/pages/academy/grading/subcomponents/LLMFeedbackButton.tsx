import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Icon,
  Intent,
  TextArea
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';
import { Tokens } from 'src/commons/application/types/SessionTypes';

import { submitLLMFeedback } from '../../../../commons/sagas/RequestsSaga';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../../../commons/utils/notifications/NotificationsHelper';

type Props = {
  tokens: Tokens;
  assessmentId: number;
  questionId?: number;
};

const LLMFeedbackButton: React.FC<Props> = ({ tokens, assessmentId, questionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setBody('');
    setRating(0);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!body.trim()) {
      showWarningMessage('Please enter feedback before submitting.');
      return;
    }
    setSubmitting(true);
    const resp = await submitLLMFeedback(
      tokens,
      assessmentId,
      body,
      rating || undefined,
      questionId
    );
    setSubmitting(false);

    if (resp && resp.ok) {
      showSuccessMessage('Feedback submitted! Thank you.', 2000);
      handleClose();
    } else {
      showWarningMessage('Failed to submit feedback. Please try again.');
    }
  }, [tokens, body, rating, assessmentId, questionId, handleClose]);

  return (
    <>
      <Button
        icon={IconNames.COMMENT}
        intent={Intent.NONE}
        minimal
        onClick={handleOpen}
        title="Provide feedback on LLM comments"
      >
        Feedback
      </Button>
      <Dialog
        icon={IconNames.COMMENT}
        isOpen={isOpen}
        onClose={handleClose}
        title="LLM Feature Feedback"
        canOutsideClickClose={true}
        style={{ width: '480px' }}
      >
        <DialogBody>
          <p>
            Share your experience with the <b>Generate Comments</b> feature. Your feedback helps us
            improve.
          </p>

          {/* Star Rating */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              Rating (optional)
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Icon
                  key={star}
                  icon={star <= rating ? IconNames.STAR : IconNames.STAR_EMPTY}
                  size={24}
                  style={{
                    cursor: 'pointer',
                    color: star <= rating ? '#f5a623' : '#ccc'
                  }}
                  onClick={() => setRating(star === rating ? 0 : star)}
                />
              ))}
            </div>
          </div>

          {/* Text Feedback */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              Your Feedback
            </label>
            <TextArea
              fill
              large
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="What worked well? What could be improved?"
              style={{ minHeight: '120px' }}
            />
          </div>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button onClick={handleClose} minimal>
                Cancel
              </Button>
              <Button
                intent={Intent.PRIMARY}
                onClick={handleSubmit}
                loading={submitting}
                disabled={!body.trim()}
              >
                Submit Feedback
              </Button>
            </>
          }
        />
      </Dialog>
    </>
  );
};

export default LLMFeedbackButton;
