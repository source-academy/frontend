import { parse } from 'acorn';
import { FunctionExpression, Node } from 'estree';
import { ACORN_PARSE_OPTIONS } from 'js-slang/dist/constants';
import createContext, { EnvTree } from 'js-slang/dist/createContext';
import Closure from 'js-slang/dist/interpreter/closure';
import { Context, Environment } from 'js-slang/dist/types';
import { TypeError } from 'js-slang/dist/utils/rttc';

export function mockContext(chapter = 1): Context {
  return createContext(chapter);
}

export function mockRuntimeContext(): Context {
  const context = createContext();
  // Note: noticed no harm in removing the following context.runtime.
  // If you get an error with head is undefined after trying to evaluate code.
  // Likely due to the environments: [].
  // In every real context, there is at least one env frame.
  context.runtime = {
    break: false,
    debuggerOn: true,
    isRunning: true,
    environmentTree: new EnvTree(),
    environments: [],
    nodes: [
      {
        type: 'Literal',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 1 }
        },
        value: 0,
        raw: '0',
        range: [0, 1]
      }
    ],
    control: null,
    stash: null,
    objectCount: 0,
    envStepsTotal: 0,
    breakpointSteps: [],
    changepointSteps: []
  };
  return context;
}

export function mockClosure(): Closure {
  return new Closure({} as FunctionExpression, {} as Environment, {} as Context);
}

export function mockTypeError(): TypeError {
  // Typecast to Node to fix estree-acorn compatability.
  return new TypeError(parse('', ACORN_PARSE_OPTIONS) as Node, '', '', '');
}
