import { InstrType } from "js-slang/dist/ec-evaluator/types";

import { AnimationItemComponent } from "./compactComponents/AnimationItemComponent";
import { ControlStack, isInstr } from "./compactComponents/ControlStack";
import EnvVisualizer from './EnvVisualizer';

export class EnvVisualizerAnimation {
  private static animationEnabled = false;
  private static animationComponents: AnimationItemComponent[] = [];

  static enableAnimations(): void {
    EnvVisualizerAnimation.animationEnabled = true;
  }

  static disableAnimations(): void {
    EnvVisualizerAnimation.animationEnabled = false;
  }

  private static resetAnimationComponents(): void {
    EnvVisualizerAnimation.animationComponents.length = 0;
  }

  static getAnimationComponents(): AnimationItemComponent[] {
    return EnvVisualizerAnimation.animationComponents;
  }

  static updateAnimationComponents(controlComponent: ControlStack) {
    EnvVisualizerAnimation.resetAnimationComponents();
    if (!controlComponent) return;
    const lastControlItem = controlComponent.control.peek();
    const lastControlComponent = controlComponent.stackItemComponents.at(-1);
    if (!EnvVisualizerAnimation.animationEnabled || !lastControlItem || !lastControlComponent) {
      return;
    }
    if (!isInstr(lastControlItem)) {
      if (lastControlItem.type === 'Literal') {
        const animationComponent = new AnimationItemComponent(lastControlComponent.value, lastControlComponent);
        EnvVisualizerAnimation.animationComponents.push(animationComponent);
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

  static startAnimation(): void {
    if (!EnvVisualizerAnimation.animationEnabled || !EnvVisualizer.getControlStash()) {
      EnvVisualizerAnimation.disableAnimations();
      return;
    }
    EnvVisualizerAnimation.disableAnimations();
    for (const animationComponent of this.animationComponents) {
      animationComponent.animate();
    }
  }

  static abortAnimation(): void {
    for (const animationComponent of this.animationComponents) {
      animationComponent.destroy();
    }
  }
}