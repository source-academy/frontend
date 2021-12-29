import { NativeJSEvalResult } from 'src/features/nativeJS/NativeJSTypes';

export async function evalNativeJSProgram(program: string): Promise<NativeJSEvalResult> {
  try {
    // eslint-disable-next-line no-eval
    return { status: 'finished', message: eval(program) };
  } catch (error) {
    return { status: 'error', message: error };
  }
}
