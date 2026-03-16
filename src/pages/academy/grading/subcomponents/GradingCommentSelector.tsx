import { Checkbox, H5, NonIdealState, Spinner } from '@blueprintjs/core';
import React from 'react';
import styles from 'src/styles/GradingCommentSelector.module.scss';

type Props = {
  comments: string[];
  isLoading: boolean;
  selectedIndices: number[];
  onToggle: (index: number) => void;
};

const GradingCommentSelector: React.FC<Props> = props => {
  return (
    <div className={styles['grading-comment-selector']}>
      <H5 className={styles['grading-comment-selector-title']}>LLM Comment Suggestions:</H5>

      {props.isLoading ? (
        <NonIdealState icon={<Spinner />} />
      ) : (
        <div>
          {props.comments.length > 0 ? (
            props.comments.map((comment, index) => {
              const isSelected = props.selectedIndices.includes(index);

              return (
                <div
                  key={index}
                  className={`${styles['grading-comment-selector-item']} ${isSelected ? styles['selected'] : ''}`}
                >
                  <div className={styles['comment-header']}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => props.onToggle(index)}
                      className={styles['comment-checkbox']}
                    />
                    <div className={styles['comment-text']} onClick={() => props.onToggle(index)}>
                      {comment}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <span>No Comments Generated</span>
          )}
        </div>
      )}
    </div>
  );
};

export default GradingCommentSelector;
