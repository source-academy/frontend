import { AssmtInstr, InstrType } from 'js-slang/dist/cse-machine/types';
import { Easings } from 'konva/lib/Tween';

import { Animatable } from './animationComponents/AnimationComponents';
import { lookupBinding } from './animationComponents/AnimationUtils';
import { AssignmentAnimation } from './animationComponents/AssignmentAnimation';
import { BinaryOperationAnimation } from './animationComponents/BinaryOperationAnimation';
import { BlockAnimation } from './animationComponents/BlockAnimation';
import { LiteralAnimation } from './animationComponents/LiteralAnimation';
import { LookupAnimation } from './animationComponents/LookupAnimation';
import { PopAnimation } from './animationComponents/PopAnimation';
import { UnaryOperationAnimation } from './animationComponents/UnaryOperationAnimation';
import { isInstr } from './compactComponents/ControlStack';
import { Frame } from './compactComponents/Frame';
import EnvVisualizer from './EnvVisualizer';
import { Layout } from './EnvVisualizerLayout';

export class CSEAnimation {
  private static animationEnabled = false;
  static readonly animationComponents: Animatable[] = [];
  static readonly defaultDuration = 0.3;
  static readonly defaultEasing = Easings.StrongEaseInOut;
  private static currentFrame: Frame;

  static enableAnimations(): void {
    CSEAnimation.animationEnabled = true;
  }

  static disableAnimations(): void {
    CSEAnimation.animationEnabled = false;
  }

  static setCurrentFrame(frame: Frame) {
    CSEAnimation.currentFrame = frame;
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
    let animation: Animatable | undefined;
    if (!isInstr(lastControlItem)) {
      // console.log("TYPE: " + lastControlItem.type);
      switch (lastControlItem.type) {
        case 'Identifier':
          animation = new LookupAnimation(
            lastControlComponent,
            Layout.stashComponent.stashItemComponents.at(-1)!,
            ...lookupBinding(CSEAnimation.currentFrame, lastControlItem.name)
          );
          break;
        case 'Literal':
          animation = new LiteralAnimation(
            lastControlComponent,
            Layout.stashComponent.stashItemComponents.at(-1)!
          );
          break;
        case 'Program':
        case 'UnaryExpression':
        case 'BinaryExpression':
        case 'CallExpression':
        case 'ExpressionStatement':
        case 'VariableDeclaration':
          const currentControlSize = Layout.controlComponent.control.size();
          const previousControlSize = Layout.previousControlComponent.control.size();
          const numOfItems = currentControlSize - previousControlSize + 1;
          if (numOfItems <= 0) break;
          const targetItems = Array.from({ length: numOfItems }, (_, i) => {
            return Layout.controlComponent.stackItemComponents[previousControlSize + i - 1];
          });
          animation = new BlockAnimation(lastControlComponent, targetItems);
          break;
      }
    } else {
      // console.log("INSTRTYPE: " + lastControlItem.instrType);
      switch (lastControlItem.instrType) {
        case InstrType.RESET:
        case InstrType.WHILE:
        case InstrType.FOR:
          break;
        case InstrType.ASSIGNMENT:
          animation = new AssignmentAnimation(
            lastControlComponent,
            Layout.stashComponent.stashItemComponents.at(-1)!,
            ...lookupBinding(CSEAnimation.currentFrame, (lastControlItem as AssmtInstr).symbol)
          );
          break;
        case InstrType.UNARY_OP:
          animation = new UnaryOperationAnimation(
            lastControlComponent,
            Layout.previousStashComponent.stashItemComponents.at(-1)!,
            Layout.stashComponent.stashItemComponents.at(-1)!
          );
          break;
        case InstrType.BINARY_OP:
          animation = new BinaryOperationAnimation(
            lastControlComponent,
            Layout.previousStashComponent.stashItemComponents.at(-2)!,
            Layout.previousStashComponent.stashItemComponents.at(-1)!,
            Layout.stashComponent.stashItemComponents.at(-1)!
          );
          break;
        case InstrType.POP:
          const currentStashSize = Layout.stashComponent.stash.size();
          const previousStashSize = Layout.previousStashComponent.stash.size();
          const lastStashIsUndefined =
            currentStashSize === 1 && currentStashSize === previousStashSize;
          animation = new PopAnimation(
            lastControlComponent,
            Layout.previousStashComponent.stashItemComponents.at(-1)!,
            lastStashIsUndefined ? Layout.stashComponent.stashItemComponents.at(-1)! : undefined
          );
          break;
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
    if (animation) CSEAnimation.animationComponents.push(animation);
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
