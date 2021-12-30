/**
 * This wrapper was initiated by `eval()` from `NativeJS`. It helps by allowing some UI rendering time.
 *
 *
 * // Example usage
 * const nativeJSResult: NativeJSEvalResult = yield call(runWrapper, evalNativeJSProgram, program);
 * const sourceResult = call(runWrapper, runInContext, code, context, {
 *                                        scheduler: 'preemptive',
 *                                        originalMaxExecTime: execTime,
 *                                        stepLimit: stepLimit,
 *                                        throwInfiniteLoops: throwInfiniteLoops,
 *                                        useSubst: substActiveAndCorrectChapter})
 */
export async function runWrapper<ReturnType>(
  runFunc: (...args: any[]) => ReturnType,
  ...runFuncArgs: any[]
): Promise<ReturnType> {
  return await new Promise((resolve, _) => setTimeout(() => resolve(runFunc(...runFuncArgs)), 0));
}
