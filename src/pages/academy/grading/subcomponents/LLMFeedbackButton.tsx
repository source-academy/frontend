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

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

const LLMFeedbackButton: React.FC<Props> = ({ tokens, assessmentId, questionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const starButtonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

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

  const handleRatingKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, currentStar: number) => {
      let nextStar: number | null = null;

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        nextStar = Math.min(5, currentStar + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        nextStar = Math.max(1, currentStar - 1);
      } else if (event.key === 'Home') {
        nextStar = 1;
      } else if (event.key === 'End') {
        nextStar = 5;
      }

      if (nextStar === null) {
        return;
      }

      event.preventDefault();
      setRating(nextStar);
      starButtonRefs.current[nextStar - 1]?.focus();
    },
    []
  );

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
            <div
              role="radiogroup"
              aria-label="Rating from one to five stars"
              style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
            >
              {STAR_VALUES.map(star => (
                <button
                  key={star}
                  ref={element => {
                    starButtonRefs.current[star - 1] = element;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                  tabIndex={rating === 0 ? (star === 1 ? 0 : -1) : rating === star ? 0 : -1}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  onKeyDown={event => handleRatingKeyDown(event, star)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    lineHeight: 0
                  }}
                >
                  <Icon
                    icon={star <= rating ? IconNames.STAR : IconNames.STAR_EMPTY}
                    size={24}
                    style={{ color: star <= rating ? '#f5a623' : '#ccc' }}
                  />
                </button>
              ))}
              <Button
                minimal
                small
                onClick={() => setRating(0)}
                disabled={rating === 0}
                aria-label="Clear rating"
              >
                Clear
              </Button>
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
