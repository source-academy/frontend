import { H5, NonIdealState, Spinner } from '@blueprintjs/core';
import React from 'react';
import styles from 'src/styles/GradingCommentSelector.module.scss';

type Props = {
  comments: string[];
  isLoading: boolean;
  onSelect: (comment: string) => void;
};

const GradingCommentSelector: React.FC<Props> = props => {
  return (
    <div className={styles['grading-comment-selector']}>
      <H5 className={styles['grading-comment-selector-title']}>LLM Comment Suggestions:</H5>

      {props.isLoading ? (
        <NonIdealState icon={<Spinner />} />
      ) : (
        <div>
          {' '}
          {props.comments.length > 0 ? (
            props.comments.map((el, index) => {
              return (
                <button
                  key={index}
                  className={styles['grading-comment-selector-item']}
                  onClick={() => {
                    props.onSelect(el);
                  }}
                >
                  {el}
                </button>
              );
            })
          ) : (
            <span>No Comments Generated</span>
          )}{' '}
        </div>
      )}
    </div>
  );
};

export default GradingCommentSelector;
