import { runInContext } from 'js-slang/dist/';
import createContext from 'js-slang/dist/createContext';

import { Layout } from '../EnvVisualizerLayout';

// The following are code samples that are more complex/known to have caused bugs
// Some are commented out to keep the tests shorter
const codeSamples = [
  `
    const fn = () => "L";
    const x = ["long string", pair(() => 1, () => 2), list(1, pair(2, 3), () => 3), () => "THIS", 5, 6];
    const y = list(x[1], x[2], tail(x[1]), tail(x[2]), fn);        
    debugger;`,
  `
    const fn = () => 1;
    const x = [1, pair(pair(1, 2), 3), 4];
    const l = list(1, list(list(1, 2, 3, fn),x[1] , [1, pair(1,2), fn, 4, 5], 4), () => 9, x);
    debugger;`,
  `
    const x1 = list(1, 2);
    const x2 = list(3, 4);
    set_head(tail(x2), x1);
    set_tail(tail(x1), x2);
    debugger;`,
  `
    const e = list(null, 2, list(3,4,5));
    set_head(e, head(tail(tail(e))));
    const f = pair(1,2);
    const g = list(null, 2, list(() => 1,4,5));
    set_head(g, head(tail(tail(g))));
    const y = pair(null, pair(() => 2, pair(1,2)));
    set_head(y, tail(tail(y)));
    debugger;`,
  `
    let x = 0;
    let y = 10;
    function f(x) {
        return () => 6;
    }
    const z = f(11);
    debugger;`,
  //   `
  //     let x = 0;
  //     let y = 10;
  //     function f(x) {
  //         function g(x) {
  //             x = x + 1;
  //             y = y + 1;
  //         }
  //         return g;
  //     }
  //     const z = f(11);
  //     debugger;
  //        `,
  // `
  //     function longfn(a) {
  //         a = (x) => {
  //             debugger;
  //         };
  //         a(10);
  //     }
  //     longfn(undefined);`,
  //   `
  //     function fn0() {
  //         const a = fn1(10);
  //         debugger;
  //     }
  //     function fn1(x) {
  //         return () => 1;
  //     }
  //     fn0();`,
  //   `
  //     const y = enum_list(1,20);
  //     debugger;`,
  //   `
  //     function fib(n) {
  //         if (n<=1) {
  //             return n;
  //         } else {
  //             debugger;
  //             return fib(n-1)+fib(n-2);
  //         }
  //     }
  //     fib(5);`,
  //   `
  //     const y = list(4,5,6);
  //     const x = [1,"hello world", ()=>1, list(1,2,3), y, null];
  //     const z = ()=>2;
  //     debugger;`,
  `
    const x = list(1,pair, accumulate);
    debugger;`,
  `
    const x = [];
    debugger;`
  //   `
  //     let x = null;
  //     for (let i = 0; i < 5; i = i + 1) {
  //         x = pair(() => i, x);
  //     }
  //     debugger;`,
  //   `
  //     function f(n) {
  //         if (n <= 1) {
  //             debugger;
  //             return 1;
  //         } else {
  //             return n * f(n-1);
  //         }
  //     }
  //     f(5);`,
  //   `
  //     (w => x => y => { const a = 1; debugger; })(1)(2)(3);`
];

codeSamples.forEach((code, idx) => {
  test('EnvVisualizer calculates correct layout for code sample ' + idx, async () => {
    const context = createContext(4);
    await runInContext(code, context);
    Layout.setContext(context);

    const toTest: any[] = [];
    Layout.levels.forEach(({ frames }) => {
      frames.forEach(({ environment, bindings }) => {
        toTest.push(environment);
        bindings.forEach(({ keyString, data }) => {
          toTest.push(keyString);
          toTest.push(data);
        });
      });
    });

    expect(toTest).toMatchSnapshot();
  });
});
