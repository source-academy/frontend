import Konva from 'konva';
import { RefObject } from 'react';
import * as ReactKonva from 'react-konva';

import { AnimatableTo, AnimationConfig } from '../animationComponents/base/Animatable';
import { AnimationComponent } from '../animationComponents/base/AnimationComponents';
import { CseAnimation } from '../CseMachineAnimation';

const mockStage = new Konva.Stage({
  container: document.createElement('div'),
  width: 500,
  height: 500
} as Konva.StageConfig);
const mockLayer = new Konva.Layer();
mockStage.add(mockLayer);
// Override layer ref's current property to the mock layer
Object.defineProperty(CseAnimation.layerRef, 'current', { value: mockLayer });

// Mapping of React Konva components to Konva nodes
const konvaNodeMap = {
  Label: Konva.Label,
  Rect: Konva.Rect,
  Circle: Konva.Circle,
  Ellipse: Konva.Ellipse,
  Wedge: Konva.Wedge,
  Line: Konva.Line,
  Sprite: Konva.Sprite,
  Image: Konva.Image,
  Text: Konva.Text,
  TextPath: Konva.TextPath,
  Star: Konva.Star,
  Ring: Konva.Ring,
  Arc: Konva.Arc,
  Tag: Konva.Tag,
  Path: Konva.Path,
  RegularPolygon: Konva.RegularPolygon,
  Arrow: Konva.Arrow,
  Shape: Konva.Shape
};

type ValueTolerancePair = [number, number];
type ExpectedValues<O> = {
  [K in keyof O]?: NonNullable<O[K]> extends number ? ValueTolerancePair : O[K];
};
type Writable<T> = { -readonly [K in keyof T]: T[K] };

async function testAnimationComponent<
  KonvaNode extends Konva.Node,
  KonvaConfig extends Konva.NodeConfig
>(args: {
  /** Type of konva node we want to construct, e.g. `ReactKonva.Rect`, `ReactKonva.Text`, etc. */
  nodeType: ReactKonva.KonvaNodeComponent<KonvaNode, KonvaConfig>;
  /** Initial props of the Konva node */
  nodeProps: KonvaConfig;
  /** Delta values we want to test, scaled by `CseAnimation.defaultDuration` */
  deltas: number[];
  /** List of `animateTo` parameters, to call in parallel for testing */
  animations: Parameters<AnimatableTo<KonvaConfig>['animateTo']>[];
  /**
   * Expected props of the node when given the timestamp.
   * Props which contain numbers (e.g. `x`, `width`, `opacity`) instead require a pair of numbers,
   * where the left value is the expected value, and the right value is the tolerance.
   */
  expected: (elapsed: number) => ExpectedValues<KonvaConfig>;
}) {
  const { nodeProps, animations, expected } = args;
  const component = new AnimationComponent(args.nodeType, nodeProps);
  expect(component.draw()).toMatchSnapshot();

  // See: https://github.com/konvajs/react-konva/blob/master/src/ReactKonvaCore.tsx#L108
  // `nodeType` has a runtime type of string, and the `KonvaNodeComponent` TS type is only
  // for compatibility with React components.
  const nodeType = args.nodeType as unknown as keyof typeof konvaNodeMap;

  // React RefObjects don't work well in test environments, so we have to manually create the
  // node and assign it to the RefObject's `current` property
  expect(konvaNodeMap[nodeType]).toBeDefined();
  const node = Reflect.construct(konvaNodeMap[nodeType], [nodeProps]) as Konva.Shape;
  (component.ref as Writable<RefObject<any>>).current = node;
  mockLayer.add(node);

  const timings = args.deltas.map(d => d * CseAnimation.defaultDuration);
  const checker = () => {
    return new Promise<void>((resolve, reject) => {
      let i = 0;
      const startTime = performance.now();
      const fn = () => {
        const elapsed = performance.now() - startTime;
        if (timings[i] - elapsed < 50 / 3 || elapsed > timings[i]) {
          const expectedProps = expected(elapsed);
          for (const attr in expectedProps) {
            const actual = node.getAttr(attr);
            const expected = expectedProps[attr];
            try {
              if (Array.isArray(expected)) {
                const [value, tolerance] = expected as ValueTolerancePair;
                // See: https://github.com/jestjs/jest/blob/main/packages/expect/src/matchers.ts#L144
                // Below calculation for precision is the inverse of the calculation in `toBeCloseTo`
                expect(actual).toBeCloseTo(value, -Math.log10(2 * tolerance));
              } else {
                expect(actual).toEqual(expected);
              }
            } catch (e) {
              reject(e);
            }
          }
          i++;
          if (i === timings.length) {
            resolve();
            return;
          }
        }
        requestAnimationFrame(fn);
      };
      requestAnimationFrame(fn);
    });
  };

  await Promise.all([...animations.map(params => component.animateTo(...params)), checker()]);
  node.destroy();
}

test('AnimationComponent animates correctly with default animation config', async () => {
  await testAnimationComponent({
    nodeType: ReactKonva.Rect,
    nodeProps: { height: 100, fill: '#000' },
    deltas: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1],
    animations: [[{ height: 200 }]],
    expected: elapsed => ({
      height: [CseAnimation.defaultEasing(elapsed, 100, 100, CseAnimation.defaultDuration), 1.5]
    })
  });
});

test('AnimationComponent animates correctly with custom animation config', async () => {
  const easing: AnimationConfig['easing'] = (t, b, c, d) => b + (t /= d) * t * t * c; // EaseInCubic
  await testAnimationComponent({
    nodeType: ReactKonva.Text,
    nodeProps: { x: 0, y: 100, opacity: 0, text: 'test' },
    deltas: [0, 0.25, 0.5, 1, 1.25, 1.5, 2],
    animations: [
      [
        { x: 400, y: 200, opacity: 1 },
        { duration: 1.5, delay: 0.5, easing }
      ]
    ],
    expected: elapsed => {
      const duration = CseAnimation.defaultDuration * 1.5;
      const delay = CseAnimation.defaultDuration * 0.5;
      const timing = Math.max(0, Math.min(elapsed - delay, duration));
      return {
        x: [easing(timing, 0, 400, duration), 4],
        y: [easing(timing, 100, 100, duration), 1],
        opacity: [easing(timing, 0, 1, duration), 0.01]
      };
    }
  });
});

test('AnimationComponent animates correctly with parallel animateTo calls 1', async () => {
  await testAnimationComponent({
    nodeType: ReactKonva.Path,
    nodeProps: { x: 0, y: 0, opacity: 0, data: 'L 0 0 M 100 100' },
    deltas: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5],
    animations: [
      [{ x: 100 }],
      [{ y: 100 }, { delay: 0.5 }],
      [{ opacity: 1 }, { duration: 0.75, delay: 0.25 }]
    ],
    expected: elapsed => {
      const d = CseAnimation.defaultDuration;
      return {
        x: [CseAnimation.defaultEasing(Math.min(elapsed / d, 1), 0, 100, 1), 1],
        y: [CseAnimation.defaultEasing(Math.min(Math.max(0, elapsed / d - 0.5), 1), 0, 100, 1), 1],
        opacity: [
          CseAnimation.defaultEasing(Math.min(Math.max(0, elapsed / d / 0.75 - 1 / 3), 1), 0, 1, 1),
          0.01
        ]
      };
    }
  });
});

test('AnimationComponent animates correctly with parallel animateTo calls 2', async () => {
  const easing: AnimationConfig['easing'] = (t, b, c, d) => b + (t / d) * c; // Linear
  await testAnimationComponent({
    nodeType: ReactKonva.Circle,
    nodeProps: { x: 0, y: 0, width: 100, height: 100, fill: '#000' },
    deltas: [0, 0.5, 1, 1.5, 2, 2.5, 3],
    animations: [
      [{ x: 100 }, { easing }],
      [{ x: 200 }, { delay: 1, easing }],
      [{ x: 150 }, { delay: 2, easing }]
    ],
    expected: elapsed => {
      const d = CseAnimation.defaultDuration;
      return {
        x:
          elapsed < d
            ? [easing(elapsed, 0, 100, d), 4]
            : elapsed < d * 2
              ? [easing(elapsed - d, 100, 100, d), 4]
              : [easing(elapsed - d * 2, 200, -50, d), 2]
      };
    }
  });
});

test('AnimationComponent animates correctly with conflicting animateTo calls', async () => {
  const easing: AnimationConfig['easing'] = (t, b, c, d) => b + (t / d) * c; // Linear
  await testAnimationComponent({
    nodeType: ReactKonva.Rect,
    nodeProps: { x: 0, y: 0, width: 100, height: 100, fill: '#000' },
    deltas: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5],
    animations: [[{ x: 100 }], [{ x: 200 }, { easing }], [{ x: 100 }, { delay: 0.5 }]],
    expected: elapsed => {
      const d = CseAnimation.defaultDuration;
      return {
        x:
          elapsed < d * 0.5
            ? [easing(elapsed, 0, 200, d), 1]
            : // Larger tolerance value at the start because of overshoot from 2nd animation,
              // will gradually go back to value of 100 towards the end.
              [100, easing(elapsed - d * 0.5, 15, 1, d)]
      };
    }
  });
});
