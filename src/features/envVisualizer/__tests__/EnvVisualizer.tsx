import { runInContext } from 'js-slang/dist/';
import createContext from 'js-slang/dist/createContext';
import { Config } from 'src/features/envVisualizer/EnvVisualizerConfig';

import { ArrayUnit } from '../components/ArrayUnit';
import { ArrowFromArrayUnit } from '../components/arrows/ArrowFromArrayUnit';
import { Frame } from '../components/Frame';
import { ArrayValue } from '../components/values/ArrayValue';
import { FnValue } from '../components/values/FnValue';
import { GlobalFnValue } from '../components/values/GlobalFnValue';
import EnvVisualizer from '../EnvVisualizer';
import { Layout } from '../EnvVisualizerLayout';
import { Env, EnvTree } from '../EnvVisualizerTypes';

// The following are code samples that are more complex/known to have caused bugs
// Some are commented out to keep the tests shorter
// Old code samples: https://github.com/source-academy/frontend/blob/006fcd47abea62f704c9d5901bd8e80097122705/src/features/envVisualizer/__tests__/EnvVisualizer.tsx
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
  `
    const x = list(1,pair, accumulate);
    debugger;`,
  `
    const x = [];
    debugger;`,
  `let y = [];
    for (let i = 1; i < 5; i = i + 1) {
        const x = [y];
    }
    y = [1, [1, 2, 3]];
    y[1][1] = y;
    y[0] = y;
    y[1][2] = y[1];
    function eval_stream(s, n) {
        function es(s, n) {
            if (n === 1) { debugger; }
            const z = [y];
            return n === 1 ? list(head(s)) : pair(head(s), es(stream_tail(s), n - 1));
        }
        return n === 0 ? null : es(s, n);
    }
    eval_stream(integers_from(1), 2);
    let x = 1;`
];

codeSamples.forEach((code, idx) => {
  test('EnvVisualizer calculates correct layout for code sample ' + idx, async () => {
    if (EnvVisualizer.getCompactLayout()) {
      EnvVisualizer.toggleCompactLayout();
    }
    const context = createContext(4);
    await runInContext(code, context);
    Layout.setContext(context.runtime.environmentTree as EnvTree);

    const toTest: any[] = [];
    const environmentsToTest: Env[] = [];
    Layout.compactLevels.forEach(({ frames }) => {
      frames.forEach(({ environment, bindings }) => {
        environmentsToTest.push(environment);
        bindings.forEach(({ keyString, data }) => {
          toTest.push(keyString);
          toTest.push(data);
        });
      });
    });
    Layout.grid.frameLevels.forEach(({ frames }) => {
      frames.forEach(({ environment, bindings, xCoord, yCoord }) => {
        environmentsToTest.push(environment);
        toTest.push(xCoord);
        toTest.push(yCoord);
        bindings.forEach(({ keyString, data }) => {
          toTest.push(keyString);
          toTest.push(data);
        });
      });
    });
    environmentsToTest.forEach(environment => {
      expect(environment).toMatchSnapshot({
        id: expect.any(String)
      });
    });
    expect(toTest).toMatchSnapshot();
    const checkNonCompactLayout = () => {
      Layout.draw();
      Layout.values.forEach(v => {
        if (v instanceof GlobalFnValue || v instanceof FnValue) {
          const arrow = v.arrow();
          expect(arrow).toBeDefined();
          expect(arrow?.target).toBeDefined();
          const path = arrow!.path().match(/[^ ]+/g) ?? [];
          expect(path.length).toEqual(14);
          expect(path[1]).toEqual(path[4]); // move up
          expect(path[8]).toEqual(path[10]); // move left
          expect(Frame.lastXCoordBelow(v.x())).toEqual(Frame.lastXCoordBelow(arrow!.target!.x())); // target
        } else if (v instanceof ArrayValue) {
          v.arrows().forEach(arrow => {
            expect(arrow).toBeDefined();
            expect(arrow?.target).toBeDefined();
            if (
              arrow instanceof ArrowFromArrayUnit &&
              arrow.target instanceof ArrayValue &&
              arrow.source instanceof ArrayUnit
            ) {
              const sourceArray = arrow.source.parent as ArrayValue;
              const targetArray = arrow.target as ArrayValue;
              if (sourceArray.level === targetArray.level) {
                // for arrows within same array level
                const path = arrow!.path().match(/[^ ]+/g) ?? [];
                expect(parseFloat(path[1])).toEqual(arrow.source.x() + Config.DataUnitWidth / 2);
                expect(parseFloat(path[2])).toEqual(arrow.source.y() + Config.DataUnitHeight / 2);
                if (sourceArray.data === targetArray.data) {
                  expect(path.length).toEqual(22); // up, right, down.
                  expect(path[1]).toEqual(path[4]);
                  expect(path[17]).toEqual(path[20]);
                  expect(parseFloat(path[20]) - parseFloat(path[1])).toBeCloseTo(
                    Config.DataUnitWidth / 3
                  );
                }
              }
            }
          });
        }
      });
    };
    const checkCompactLayout = () => {
      Layout.draw();
    };
    checkCompactLayout();
    EnvVisualizer.togglePrintableMode();
    checkCompactLayout();
    EnvVisualizer.toggleCompactLayout();
    checkNonCompactLayout();
    EnvVisualizer.togglePrintableMode();
    checkNonCompactLayout();
  });
});
