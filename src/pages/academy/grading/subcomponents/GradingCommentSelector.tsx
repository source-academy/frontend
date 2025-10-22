import { H5, NonIdealState, Spinner } from '@blueprintjs/core';
import React from 'react';

type Props = {
  comments: string[];
  isLoading: boolean;
  onSelect: (comment: string) => void;
};

const GradingCommentSelector: React.FC<Props> = props => {
  return (
    <div className="grading-comment-selector">
      <H5 className="grading-comment-selector-title">LLM Comment Suggestions:</H5>

      {props.isLoading ? (
        <NonIdealState icon={<Spinner />} />
      ) : (
        <div>
          {' '}
          {props.comments.length > 0 ? (
            props.comments.map(el => {
              return (
                <div
                  className="grading-comment-selector-item"
                  onClick={() => {
                    props.onSelect(el);
                  }}
                >
                  {el}
                </div>
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
