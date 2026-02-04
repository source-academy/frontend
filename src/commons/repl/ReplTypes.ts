import { InterpreterOutput } from '../application/ApplicationTypes';

export type OutputProps = {
  output: InterpreterOutput;
  usingSubst?: boolean;
  isHtml?: boolean;
};
