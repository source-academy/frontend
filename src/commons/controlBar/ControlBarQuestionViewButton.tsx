import React from 'react';

import ControlButton from '../ControlButton';

/**
 * @prop questionProgress a tuple of (current question number, question length) where
 *   the current question number is 1-based.
 */
type ControlBarQuestionViewButtonProps = {
  questionProgress: [number, number] | null;
};

export const ControlBarQuestionViewButton: React.FC<ControlBarQuestionViewButtonProps> = ({
  questionProgress
}) => {
  return (
    <ControlButton
      label={`Question ${questionProgress![0]} of ${questionProgress![1]}  `}
      isDisabled
    />
  );
};
