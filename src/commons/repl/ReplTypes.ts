import { InterpreterOutput } from 'src/commons/application/ApplicationTypes';

export type OutputProps = {
  output: InterpreterOutput;
  usingSubst?: boolean;
  isHtml?: boolean;
};
