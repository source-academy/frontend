/**
 * Evaluates Source program string using js-slang interpreter and measures runtime in milliseconds
 * @param  {String} program  Program to evaluate
 * @param  {Number} chapter  Source chapter number to evaluate under
 * @return {Number} Program runtime in milliseconds
 */
export default function measureRunTime(program, chapter) {
    const { eval_code } = require('./evalCode.js');
    // const { PerformanceObserver, performance } = require('perf_hooks');
    const before = window.performance.now();
    // var t0 = performance.now();
    eval_code(program, chapter);
    // var t1 = performance.now();
    // return t1 - t0;
    return window.performance.now() - before;
}
