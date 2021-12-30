import { SourceError } from 'js-slang/dist/types';

enum BrowserType {
  Chrome = 'Chrome',
  FireFox = 'FireFox',
  Unsupported = 'Unsupported'
}

interface EvalErrorLocator {
  regex: RegExp;
  browser: BrowserType;
}
// Chrome
// Example: `TypeError: window.dsl is not a function at eval (eval at evalNativeJSProgram (NativeJSEval.ts:6:1), <anonymous>:1:8)`
const ChromeEvalErrorLocator = {
  regex: /at eval.+<anonymous>:(\d+):(\d+)/gm,
  browser: BrowserType.Chrome
};

// Firefox
// Example: @http://localhost:8000/static/js/main.chunk.js line 31925 > eval:1:1
//            evalNativeJSProgram@http://localhost:8000/static/js/main.chunk.js:31925:16`
const FireFoxEvalErrorLocator = {
  regex: /eval:(\d+):(\d+)/gm,
  browser: BrowserType.Chrome
};

const EVAL_ERROR_LOCATORS: EvalErrorLocator[] = [ChromeEvalErrorLocator, FireFoxEvalErrorLocator];

function getBrowserType(): BrowserType {
  const userAgent: string = navigator.userAgent.toLowerCase();
  return userAgent.indexOf('chrome') > -1
    ? BrowserType.Chrome
    : userAgent.indexOf('firefox') > -1
    ? BrowserType.FireFox
    : BrowserType.Unsupported;
}

function extractErrorLocation(
  errorStack: string,
  lineOffset: number,
  errorLocator: EvalErrorLocator
): SourceError['location'] | undefined {
  const evalErrors = Array.from(errorStack.matchAll(errorLocator.regex));
  if (evalErrors.length) {
    // we only want to get the initial eval error
    // this is to account for nested `eval()` calls
    const baseEvalError = evalErrors[evalErrors.length - 1];
    const [lineNumStr, colNumStr] = baseEvalError.slice(1, 3);
    return {
      start: { line: parseInt(lineNumStr) - lineOffset, column: parseInt(colNumStr) },
      end: { line: 0, column: 0 }
    };
  }

  return undefined;
}

const DUMMY_ERROR_LOCATION = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 }
};

export function getEvalErrorLocation(
  error: Error,
  lineOffset: number = 0
): SourceError['location'] {
  const browser: BrowserType = getBrowserType();
  const errorLocator: EvalErrorLocator | undefined = EVAL_ERROR_LOCATORS.find(
    locator => locator.browser === browser
  );
  const errorStack: string | undefined = error.stack!;

  if (errorStack && errorLocator) {
    return extractErrorLocation(errorStack, lineOffset, errorLocator) || DUMMY_ERROR_LOCATION;
  } else if (errorStack) {
    // if browser is unsupported try all supported locators until the first success
    return (
      EVAL_ERROR_LOCATORS.map(locator =>
        extractErrorLocation(errorStack, lineOffset, locator)
      ).find(x => x !== undefined) || DUMMY_ERROR_LOCATION
    );
  }

  return DUMMY_ERROR_LOCATION;
}
