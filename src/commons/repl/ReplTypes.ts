import type { InterpreterOutput } from '../application/ApplicationTypes';

export type OutputProps = {
  output: InterpreterOutput;
  usingSubst?: boolean;
  showStepperPrompt?: boolean;
};
