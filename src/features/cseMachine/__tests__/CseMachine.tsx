import { runInContext } from 'js-slang/dist/';
import createContext from 'js-slang/dist/createContext';

import { Binding } from '../components/Binding';
import { ControlItemComponent } from '../components/ControlItemComponent';
import { Frame } from '../components/Frame';
import { StashItemComponent } from '../components/StashItemComponent';
import { ArrayValue } from '../components/values/ArrayValue';
import { FnValue } from '../components/values/FnValue';
import { GlobalFnValue } from '../components/values/GlobalFnValue';
import CseMachine from '../CseMachine';
import { Config } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Env, EnvTree } from '../CseMachineTypes';
import { isMainReference } from '../CseMachineUtils';

function isArray(x: any): x is any[] {
  return Array.isArray(x);
}

function isFunction(x: any): x is Function {
  return typeof x === 'function';
}

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
    const x = list(1, pair, accumulate);
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
            const z = [y];
            return n === 1 ? list(head(s)) : pair(head(s), es(stream_tail(s), n - 1));
        }
        return n === 0 ? null : es(s, n);
    }
    eval_stream(integers_from(1), 2);
    let x = 1;
    debugger;
    `
];

codeSamples.forEach((code, idx) => {
  test('CSE Machine calculates correct layout for code sample ' + idx, async () => {
    const context = createContext(4);
    await runInContext(code, context);
    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.control!,
      context.runtime.stash!
    );

    // Map of environment.id to Frame
    const frameMap = new Map<string, Frame>();

    const toTest: any[] = [];
    const environmentsToTest: Env[] = [];

    // Testing environment contents and order
    Layout.levels.forEach(({ frames }) => {
      frames.forEach(frame => {
        frameMap.set(frame.environment.id, frame);
        environmentsToTest.push(frame.environment);
        frame.bindings.forEach(({ keyString, data }) => {
          toTest.push(keyString);
          toTest.push(data);
        });
      });
    });
    environmentsToTest.forEach(environment => {
      expect(environment).toMatchSnapshot();
    });
    expect(toTest).toMatchSnapshot();
    const checkLayout = () => {
      Layout.draw();
      const globalFrame = frameMap.get(Layout.globalEnvNode.environment.id);
      Layout.values.forEach(v => {
        if (v instanceof GlobalFnValue || v instanceof FnValue) {
          const arrow = v.arrow();
          expect(arrow).toBeDefined();
          expect(arrow!.target).toBeDefined();
          // Split path text into an array by the spaces
          const path = arrow!.path().match(/[^ ]+/g) ?? [];
          expect(path).toHaveLength(14);
          expect(path[1]).toEqual(path[4]); // moves up
          expect(path[8]).toEqual(path[10]); // moves left
          const targetFrame =
            v instanceof FnValue ? frameMap.get(v.data.environment.id) : globalFrame;
          expect(targetFrame).toBeDefined();
          expect(arrow!.target).toEqual(targetFrame);
          expect(v.x()).toBeGreaterThan(targetFrame!.x());
          expect(v.y()).toBeGreaterThan(targetFrame!.y());
        } else if (v instanceof ArrayValue) {
          const targetFrame = frameMap.get(v.data.environment.id);
          expect(targetFrame).toBeDefined();
          expect(v.x()).toBeGreaterThan(targetFrame!.x());
          expect(v.y()).toBeGreaterThan(targetFrame!.y());
          v.units.forEach((unit, i) => {
            expect(unit.index).toEqual(i);
            const lastIndex = i === v.units.length - 1;
            if (isFunction(unit.data) || isArray(unit.data)) {
              expect(unit.arrow).toBeDefined();
              expect(unit.arrow!.target).toBeDefined();
              const path = unit.arrow!.path().match(/[^ ]+/g) ?? [];
              if (unit.value instanceof GlobalFnValue) {
                // Check value has a binding in the global frame
                expect(
                  unit.value.references.filter(r => r instanceof Binding && r.frame === globalFrame)
                ).toHaveLength(1);
              } else {
                expect(unit.data).toHaveProperty('environment');
                if (isMainReference(unit.value, unit)) {
                  if (lastIndex) {
                    expect(unit.isLastUnit).toEqual(true);
                    expect(unit.value.x()).toBeGreaterThan(v.x());
                    expect(Number(path[1])).toBeLessThan(Number(path[4])); // arrow moves right
                    expect(path[2]).toEqual(path[5]); // horizontal arrow
                    // Box-and-pointer notation, y-coordinate should be the same
                    if (isArray(unit.data)) expect(unit.value.y()).toEqual(v.y());
                    // y-coordinates of functions should be at the mid-point of the array
                    else expect(unit.value.y()).toEqual(v.y() + Config.DataUnitHeight / 2);
                  } else {
                    expect(unit.value.y()).toBeGreaterThan(v.y());
                    expect(path[1]).toEqual(path[4]); // vertical arrow
                    expect(Number(path[2])).toBeLessThan(Number(path[5])); // arrow moves down
                    // Arrays have matching x-coordinates
                    if (isArray(unit.data)) expect(unit.value.x()).toEqual(unit.x());
                    // Functions have the centers aligned instead
                    else {
                      expect(unit.value.x() + unit.value.width() / 2).toEqual(
                        unit.x() + unit.width() / 2
                      );
                    }
                  }
                }
              }
            }
          });
        }
      });
    };
    checkLayout();
    CseMachine.togglePrintableMode();
    checkLayout();
    CseMachine.togglePrintableMode();
  });
});

const codeSamplesControlStash: [string, string, number, boolean?][] = [
  [
    'arrows from the environment instruction to the frame and arrows from the stash to closures',
    `
    function create(n) {
      const arr = [];
      let x = 0;
      
      while (x < n) {
          arr[x] = () => x;
          x = x + 1;
      }
      return arr;
    }
    create(3)[1]();
    `,
    33
  ],
  [
    'global environments are treated correctly',
    `
    {
      const math_sin = x => x;
    }
    math_sin(math_PI / 2);
    `,
    5
  ],
  [
    'Control is truncated properly',
    `
      function fact(n) {
        return n <= 1 ? 1 : n * fact(n - 1);
      }
      fact(10);
      `,
    140,
    true
  ]
];

codeSamplesControlStash.forEach(codeSample => {
  test('CSE Machine Control Stash correctly renders: ' + codeSample[0], async () => {
    const code = codeSample[1] as string;
    const currentStep = codeSample[2] as number;
    const truncate = codeSample[3];
    if (Boolean(truncate) !== CseMachine.getStackTruncated()) {
      CseMachine.toggleStackTruncated();
    }
    if (!CseMachine.getControlStash()) {
      CseMachine.toggleControlStash();
    }
    const context = createContext(4);
    await runInContext(code, context, { executionMethod: 'cse-machine', envSteps: currentStep });
    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.control!,
      context.runtime.stash!
    );
    Layout.draw();
    const controlItemsToTest: ControlItemComponent[] = Layout.controlComponent.stackItemComponents;
    const stashItemsToTest: StashItemComponent[] = Layout.stashComponent.stashItemComponents;
    controlItemsToTest.forEach(item => {
      expect(item.draw()).toMatchSnapshot();
      if (item.value === 'ENVIRONMENT') expect(item.arrow).toBeDefined();
    });
    if (truncate) expect(controlItemsToTest.length).toBeLessThanOrEqual(10);
    stashItemsToTest.forEach(item => {
      expect(item.draw()).toMatchSnapshot();
      if (isFunction(item.value) || isArray(item.value)) expect(item.arrow).toBeDefined();
    });
  });
});
