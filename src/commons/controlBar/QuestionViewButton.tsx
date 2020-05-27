import controlButton from '../ControlButton';

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
type QuestionViewButtonProps = StateProps;

type StateProps = {
  questionProgress: [number, number] | null;
  key: string;
};

export function QuestionViewButton(props: QuestionViewButtonProps) {
  return controlButton(
    `Question ${props.questionProgress![0]} of ${props.questionProgress![1]}  `,
    null,
    null,
    {},
    true
  );
}
