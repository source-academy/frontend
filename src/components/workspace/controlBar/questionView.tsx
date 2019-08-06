import { controlButton } from '../../commons';

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
export type QuestionViewProps = {
  questionProgress: [number, number] | null;
  key: string;
};

export function QuestionView(props: QuestionViewProps) {
  return controlButton(
    `Question ${props.questionProgress![0]} of ${props.questionProgress![1]}  `,
    null,
    null,
    {},
    true
  );
}
