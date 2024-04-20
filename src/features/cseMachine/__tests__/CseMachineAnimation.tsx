import Konva from 'konva';
import * as ReactKonva from 'react-konva';

import { AnimationConfig } from '../animationComponents/base/Animatable';
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

// The points in the animation which the checker should check for.
const deltaIntervals = [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1];

async function checkComponentAnimation<
  KonvaNode extends Konva.Node,
  KonvaConfig extends Konva.NodeConfig
>(
  component: AnimationComponent<KonvaNode, KonvaConfig>,
  initialProps: KonvaConfig,
  targetProps: Partial<KonvaConfig>,
  animationConfig: Required<AnimationConfig>
) {
  const duration = animationConfig.duration * CseAnimation.defaultDuration;
  const delay = animationConfig.delay * CseAnimation.defaultDuration;
  const easing = animationConfig.easing;
  const node = component.ref.current as KonvaNode;
  const timings = deltaIntervals.map(d => d * duration + delay);

  let i = 0;
  const startTime = performance.now();
  const checker = () => {
    const elapsed = performance.now() - startTime - delay;
    if (timings[i] - elapsed < 50 / 3 || elapsed > timings[i]) {
      for (const [attr, target] of Object.entries(targetProps)) {
        const initial = initialProps[attr];
        if (initial === undefined) {
          // Check that animation is skipped for props with no initial values
          expect(node.getAttr(attr)).toEqual(target);
          continue;
        }

        const actual = node.getAttr(attr) as number;
        const expected = easing(elapsed, initial, target - initial, duration);

        // Tolerance is the max difference between actual and expected.
        // Example: initial value = 100, target value = 200, duration = 300ms => tolerance = 2
        // Longer duration => lower tolerance. Larger difference in values => higher tolerance
        const tolerance = (Math.abs(target - initial) / duration) * 6;

        // See: https://github.com/jestjs/jest/blob/main/packages/expect/src/matchers.ts#L144
        // Below calculation for precision is the inverse of the calculation in `toBeCloseTo`
        expect(actual).toBeCloseTo(expected, -Math.log10(2 * tolerance));
      }
      if (i < timings.length - 1) {
        i++;
        requestAnimationFrame(checker);
      }
    } else {
      requestAnimationFrame(checker);
    }
  };
  requestAnimationFrame(checker);
}

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

async function testSingleAnimation<
  KonvaNode extends Konva.Node,
  KonvaConfig extends Konva.NodeConfig
>(
  component: AnimationComponent<KonvaNode, KonvaConfig>,
  targetProps: Partial<KonvaConfig>,
  animationConfig?: AnimationConfig
) {
  for (const value of Object.values(targetProps)) {
    if (typeof value !== 'number') {
      throw new Error('Checking of non-number animation values is not supported in testing!');
    }
  }

  // React's `RefObject`s don't work properly during testing, so we have to access internal
  // properties of AnimationComponent and manually create the Konva nodes
  const type = (component as any).type as keyof typeof konvaNodeMap;
  const initialProps = (component as any).props as KonvaConfig;
  expect(konvaNodeMap[type]).toBeDefined();
  const node = Reflect.construct(konvaNodeMap[type], [initialProps]) as Konva.Shape;
  Object.defineProperty(component.ref, 'current', { value: node });
  mockLayer.add(node);

  // Peek into node attributes and check that the values match while the animation is running
  const config = {
    duration: animationConfig?.duration ?? 1,
    delay: animationConfig?.delay ?? 0,
    easing: animationConfig?.easing ?? CseAnimation.defaultEasing
  };

  // Run animation and checks in parallel
  await Promise.all([
    component.animateTo(targetProps, animationConfig),
    checkComponentAnimation(component, initialProps, targetProps, config)
  ]);

  // Check at the end that all target props have been fulfilled
  for (const [attr, target] of Object.entries(targetProps)) {
    expect(node.getAttr(attr)).toEqual(target);
  }

  node.destroy();
}

test('AnimationComponent animates correctly with default animation config', async () => {
  const start = { height: 100 };
  const target = { height: 200 };
  const component = new AnimationComponent(ReactKonva.Rect, start);
  expect(component.draw()).toMatchSnapshot();
  await testSingleAnimation(component, target);
});

test('AnimationComponent animates correctly with custom animation config', async () => {
  const start = { x: 0, y: 100, opacity: 0, text: 'test' };
  const target = { x: 400, y: 200, opacity: 1 };
  const component = new AnimationComponent(ReactKonva.Text, start);
  expect(component.draw()).toMatchSnapshot();
  await testSingleAnimation(component, target, {
    duration: 1.5,
    delay: 0.5,
    easing: (t, b, c, d) => b + (t /= d) * t * t * c // EaseInCubic
  });
});
