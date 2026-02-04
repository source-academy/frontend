import { stringify } from 'js-slang/dist/utils/stringify';

type DisplayBufferCallback = (log: string) => void;

type ConsoleOverloadMethod<T> = (bufferCallback: DisplayBufferCallback) => (args: T) => void;

// TODO add other overloads
// - e.g. "warn"/"debug"/"time"/"timeEnd"
interface ConsoleOverload {
  log: ConsoleOverloadMethod<any[]>;
}

export const consoleOverloads: ConsoleOverload = {
  log:
    (bufferCallback: DisplayBufferCallback) =>
    (...args: any[]) => {
      bufferCallback(args.map(log => (typeof log === 'string' ? log : stringify(log))).join(' '));
    }
};
