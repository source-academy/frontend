import { Continuation } from 'js-slang/dist/cse-machine/continuations';
export { Continuation } from 'js-slang/dist/cse-machine/continuations';

export function isContinuation(data: any): data is Continuation {
  return (data as any)?.toString() === 'continuation';
}
