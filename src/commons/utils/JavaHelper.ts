import { SourceError as JavaSourceError } from 'java-slang/dist/ec-evaluator/errors';
import { runECEvaluator } from 'java-slang/dist/ec-evaluator/index';
import { Context as JavaContext } from 'java-slang/dist/ec-evaluator/types';
import setupJVM, { parseBin } from 'java-slang/dist/jvm';
import { createModuleProxy, loadCachedFiles } from 'java-slang/dist/jvm/utils/integration';
import { Context } from 'js-slang';
import loadSourceModules from 'js-slang/dist/modules/loader';
import { ErrorSeverity, ErrorType, Result, SourceError } from 'js-slang/dist/types';

import { CseMachine } from '../../features/cseMachine/java/CseMachine';
import Constants from './Constants';
import DisplayBufferService from './DisplayBufferService';

export async function javaRun(javaCode: string, context: Context, targetStep: number, isUsingCse: boolean) {
  let compiled = {};

  let files = {};
  let buffer: string[] = [];

  const readClassFiles = (path: string) => {
    let item = files[path as keyof typeof files];

    // not found: attempt to fetch from CDN
    if (!item && path) {
      const splits = path.split('/');
      splits.pop(); // classname.class
      const pkg = splits.join('_');

      const request = new XMLHttpRequest();
      request.open('GET', `${Constants.javaPackagesUrl}${pkg}.json`, false);
      request.send(null);
      if (request.status !== 200) {
        throw new Error('File not found: ' + path);
      }
      const json = JSON.parse(request.responseText);
      // we might want to cache the files in IndexedDB here
      files = { ...files, ...json };

      if (!files[path as keyof typeof files]) {
        throw new Error('File not found: ' + path);
      }

      item = files[path as keyof typeof files];
    }

    // convert base64 to classfile object
    const binaryString = atob(item);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return parseBin(new DataView(bytes.buffer));
  };
  const loadNatives = async (path: string) => {
    // dynamic load modules
    if (path.startsWith('modules')) {
      const module = path.split('/')[1] as string;
      const moduleFuncs = await loadSourceModules(new Set([module]), context, true);
      const { proxy } = createModuleProxy(module, moduleFuncs[module]);
      return { default: proxy };
    }
    return await import(`java-slang/dist/jvm/stdlib/${path}.js`);
  };
  const stdout = (str: string) => {
    if (str.endsWith('\n')) {
      buffer.push(str);
      const lines = buffer.join('').split('\n');
      lines.pop();
      lines.forEach(line => DisplayBufferService.push(line, context.externalContext));
      buffer = [];
    } else {
      buffer.push(str);
    }
  };
  const stderr = (msg: string) => {
    context.errors.push({
      type: 'Runtime' as any,
      severity: 'Error' as any,
      location: {
        start: {
          line: -1,
          column: -1
        },
        end: {
          line: -1,
          column: -1
        }
      },
      explain: () => msg,
      elaborate: () => msg
    });
  };

  if (isUsingCse) return await runJavaCseMachine(javaCode, targetStep, context);

  // FIXME: Remove when the compiler is working
  try {
    const json = JSON.parse(javaCode);
    compiled = json;
  } catch (e) {
    stderr(e);
    return Promise.resolve({ status: 'error' });
  }

  // load cached classfiles from IndexedDB
  return loadCachedFiles(() =>
    // Initial loader to fetch commonly used classfiles
    fetch(Constants.javaPackagesUrl + '_base.json')
      .then(res => res.json())
      .then((obj: { [key: string]: string }) => {
        return obj;
      })
  )
    .then(stdlib => {
      files = {
        ...stdlib,
        ...compiled
      };

      // run the JVM
      return new Promise((resolve, reject) => {
        setupJVM({
          javaClassPath: '',
          nativesPath: '',
          callbacks: {
            readFileSync: readClassFiles,
            readFile: loadNatives,
            stdout,
            stderr,
            onFinish: () => {
              resolve(
                context.errors.length
                  ? { status: 'error' }
                  : { status: 'finished', context, value: '' }
              );
            }
          },
          natives: {}
        })();
      });
    })
    .catch(() => {
      return { status: 'error' };
    });
}

export function visualizeJavaCseMachine({ context }: { context: JavaContext }) {
  try {
    CseMachine.drawCse(context);
  } catch (err) {
    throw new Error('Java CSE machine is not enabled');
  }
}

export async function runJavaCseMachine(
  code: string,
  targetStep: number,
  context: Context
) {
  const convertJavaErrorToJsError = (e: JavaSourceError): SourceError => ({
    type: ErrorType.RUNTIME,
    severity: ErrorSeverity.ERROR,
    location: {
      start: {
        line: 0,
        column: 0,
      },
      end: {
        line: 0,
        column: 0,
      },
    },
    explain: () => e.explain(),
    elaborate: () => e.explain(),
  });
  context.executionMethod = 'cse-machine';
  return runECEvaluator(code, targetStep)
    .then(result => {
      context.runtime.envStepsTotal = result.context.totalSteps;
      if (result.status === 'error') {
        context.errors = result.context.errors.map(e => convertJavaErrorToJsError(e));
      }
      return result;
    })
    .catch(e => {
      console.error(e);
      return { status: 'error' } as Result;
    });
}
