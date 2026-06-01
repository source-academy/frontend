import { H5, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';

type Props = {
  comments: string[];
  isLoading: boolean;
  onSelect: (comment: string) => void;
};

function GradingCommentSelector(props: Props) {
  return (
    <div
      className={classNames(
        'text-center flex! flex-col justify-center',
        'text-sm rounded-sm bg-(--cadet-color-1)',
        'mt-1 mb-1 p-2',
      )}
    >
      <H5 className="mb-3">LLM Comment Suggestions:</H5>

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
                  className={classNames(
                    'm-0.5 p-1.5 w-full cursor-pointer rounded',
                    'bg-(--cadet-color-2) border border-(--cadet-color-3)',
                    'hover:bg-(--cadet-color-3)',
                  )}
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
}

export default GradingCommentSelector;
