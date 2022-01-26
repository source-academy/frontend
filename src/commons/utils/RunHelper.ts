/*
 * This file contains wrappers for functions that runs/evaluates programs
 */

/**
 * Generic function to wrap run/eval functions into a task so to give UI thread time to render
 * - setTimeout "schedules" a task as opposed to the microtask (directly within a promise)
 *
 * @param runFunc       Function used to run/evaluate Source/fullJS program strings (e.g. runInContext)
 * @param runFuncArgs   Parameters for runFunc
 * @returns             Promise that resolves to ReturnType of runFunc
 */
export async function runWrapper<ReturnType>(
  runFunc: (...args: any[]) => ReturnType,
  ...runFuncArgs: any[]
): Promise<ReturnType> {
  return await new Promise((resolve, _) => setTimeout(() => resolve(runFunc(...runFuncArgs)), 0));
}
