import { InstrType } from 'js-slang/dist/ec-evaluator/types';

import { Animatable } from './animationComponents/AnimationComponents';
import { ControlStashItemAnimation } from './animationComponents/ControlStashItemAnimation';
import { isInstr } from './compactComponents/ControlStack';
import EnvVisualizer from './EnvVisualizer';
import { Layout } from './EnvVisualizerLayout';

export class CSEAnimation {
  private static animationEnabled = false;
  static readonly animationComponents: Animatable[] = [];
  static readonly defaultDuration = 0.3;

  static enableAnimations(): void {
    CSEAnimation.animationEnabled = true;
  }

  static disableAnimations(): void {
    CSEAnimation.animationEnabled = false;
  }

  private static clearAnimationComponents(): void {
    CSEAnimation.animationComponents.length = 0;
  }

  static updateAnimation() {
    CSEAnimation.animationComponents.forEach(a => a.destroy());
    CSEAnimation.clearAnimationComponents();

    if (!Layout.previousControlComponent) return;
    const lastControlItem = Layout.previousControlComponent.control.peek();
    const lastControlComponent = Layout.previousControlComponent.stackItemComponents.at(-1);
    if (
      !CSEAnimation.animationEnabled ||
      !lastControlItem ||
      !lastControlComponent ||
      !EnvVisualizer.getControlStash() // TODO: handle cases where there are environment animations
    ) {
      return;
    }
    if (!isInstr(lastControlItem)) {
      if (lastControlItem.type === 'Literal') {
        const animationComponent = new ControlStashItemAnimation(
          lastControlComponent,
          Layout.stashComponent.stashItemComponents.at(-1)!
        );
        CSEAnimation.animationComponents.push(animationComponent);
      }
    } else {
      switch (lastControlItem.instrType) {
        case InstrType.RESET:
        case InstrType.WHILE:
        case InstrType.FOR:
        case InstrType.ASSIGNMENT:
        case InstrType.UNARY_OP:
        case InstrType.BINARY_OP:
        case InstrType.POP:
        case InstrType.APPLICATION:
        case InstrType.BRANCH:
        case InstrType.ENVIRONMENT:
        case InstrType.ARRAY_LITERAL:
        case InstrType.ARRAY_ACCESS:
        case InstrType.ARRAY_ASSIGNMENT:
        case InstrType.ARRAY_LENGTH:
        case InstrType.CONTINUE_MARKER:
        case InstrType.BREAK:
        case InstrType.BREAK_MARKER:
        case InstrType.MARKER:
      }
    }
  }

  static playAnimation(): void {
    if (!CSEAnimation.animationEnabled) {
      CSEAnimation.disableAnimations();
      return;
    }
    CSEAnimation.disableAnimations();
    for (const animationComponent of this.animationComponents) {
      animationComponent.animate();
    }
  }
}
