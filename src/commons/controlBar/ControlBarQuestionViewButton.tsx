import ControlButton from '../ControlButton';

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
type Props = {
  questionProgress: [number, number] | null;
};

function ControlBarQuestionViewButton({ questionProgress }: Props) {
  return (
    <ControlButton
      label={`Question ${questionProgress![0]} of ${questionProgress![1]}  `}
      isDisabled
    />
  );
}

export default ControlBarQuestionViewButton;
