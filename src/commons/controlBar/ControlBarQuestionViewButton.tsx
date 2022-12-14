import ControlButton from '../ControlButton';

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
type ControlBarQuestionViewButtonProps = {
  questionProgress: [number, number] | null;
};

export function ControlBarQuestionViewButton({
  questionProgress
}: ControlBarQuestionViewButtonProps) {
  return (
    <ControlButton
      label={`Question ${questionProgress![0]} of ${questionProgress![1]}  `}
      isDisabled
    />
  );
}
