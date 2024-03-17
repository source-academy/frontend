import { AppInstr, AssmtInstr, InstrType } from 'js-slang/dist/cse-machine/types';
import { Layer } from 'konva/lib/Layer';
import { Easings } from 'konva/lib/Tween';
import React from 'react';

import { ArrowFunctionExpressionAnimation } from './animationComponents/ArrowFunctionExpressionAnimation';
import { AssignmentAnimation } from './animationComponents/AssignmentAnimation';
import { Animatable } from './animationComponents/base/Animatable';
import { checkFrameCreation, lookupBinding } from './animationComponents/base/AnimationUtils';
import { BinaryOperationAnimation } from './animationComponents/BinaryOperationAnimation';
import { BlockAnimation } from './animationComponents/BlockAnimation';
import { BranchAnimation } from './animationComponents/BranchAnimation';
import { EnvironmentAnimation } from './animationComponents/EnvironmentAnimation';
import { FrameCreationAnimation } from './animationComponents/FrameCreationAnimation';
import { FunctionFrameCreationAnimation } from './animationComponents/FunctionFrameCreationAnimation';
import { LiteralAnimation } from './animationComponents/LiteralAnimation';
import { LookupAnimation } from './animationComponents/LookupAnimation';
import { PopAnimation } from './animationComponents/PopAnimation';
import { UnaryOperationAnimation } from './animationComponents/UnaryOperationAnimation';
import { isInstr } from './components/ControlStack';
import { Frame } from './components/Frame';
import CseMachine from './CseMachine';
import { Layout } from './CseMachineLayout';

export class CseAnimation {
  static readonly animations: Animatable[] = [];
  static readonly defaultDuration = 300;
  static readonly defaultEasing = Easings.StrongEaseInOut;
  private static animationEnabled = false;
  private static currentFrame: Frame;
  private static previousFrame: Frame;

  static layerRef = React.createRef<Layer>();
  static getLayer(): Layer | null {
    return this.layerRef.current;
  }

  static enableAnimations(): void {
    CseAnimation.animationEnabled = true;
  }

  static disableAnimations(): void {
    CseAnimation.animationEnabled = false;
  }

  static setCurrentFrame(frame: Frame) {
    CseAnimation.previousFrame = CseAnimation.currentFrame;
    CseAnimation.currentFrame = frame;
  }

  private static clearAnimationComponents(): void {
    CseAnimation.animations.length = 0;
  }

  private static getNewControlItems() {
    const currentControlSize = Layout.controlComponent.control.size();
    const previousControlSize = Layout.previousControlComponent.control.size();
    const numOfItems = currentControlSize - previousControlSize + 1;
    if (numOfItems <= 0) return [];
    const targetItems = Array.from({ length: numOfItems }, (_, i) => {
      return Layout.controlComponent.stackItemComponents[previousControlSize + i - 1];
    });
    return targetItems;
  }

  static updateAnimation() {
    CseAnimation.animations.forEach(a => a.destroy());
    CseAnimation.clearAnimationComponents();

    if (!Layout.previousControlComponent) return;
    const lastControlItem = Layout.previousControlComponent.control.peek();
    const lastControlComponent = Layout.previousControlComponent.stackItemComponents.at(-1);
    const currControlComponent = Layout.controlComponent.stackItemComponents.at(-1);
    if (
      !CseAnimation.animationEnabled ||
      !lastControlItem ||
      !lastControlComponent ||
      !CseMachine.getControlStash() // TODO: handle cases where there are environment animations
    ) {
      return;
    }
    let animation: Animatable | undefined;
    if (!isInstr(lastControlItem)) {
      console.log('TYPE: ' + lastControlItem.type);
      switch (lastControlItem.type) {
        case 'ArrowFunctionExpression':
          CseAnimation.animations.push(new ArrowFunctionExpressionAnimation(
            lastControlComponent,
            Layout.stashComponent.stashItemComponents.at(-1)!
          ));
          break;
        case 'BlockStatement':
          CseAnimation.animations.push(
            new BlockAnimation(lastControlComponent, CseAnimation.getNewControlItems())
          );
          if (!currControlComponent) return;
          if (checkFrameCreation(CseAnimation.previousFrame, CseAnimation.currentFrame)) {
            CseAnimation.animations.push(
              new FrameCreationAnimation(CseAnimation.currentFrame, currControlComponent)
            );
          }
          break;
        case 'Identifier':
          if (lastControlComponent.text === 'undefined') {
            animation = new LiteralAnimation(
              lastControlComponent,
              Layout.stashComponent.stashItemComponents.at(-1)!
            );
          } else {
            animation = new LookupAnimation(
              lastControlComponent,
              Layout.stashComponent.stashItemComponents.at(-1)!,
              ...lookupBinding(CseAnimation.currentFrame, lastControlItem.name)
            );
          }
          break;
        case 'Literal':
          animation = new LiteralAnimation(
            lastControlComponent,
            Layout.stashComponent.stashItemComponents.at(-1)!
          );
          break;
        case 'Program':
          if (!currControlComponent) return;
          if (checkFrameCreation(CseAnimation.previousFrame, CseAnimation.currentFrame)) {
            CseAnimation.animations.push(
              new FrameCreationAnimation(CseAnimation.currentFrame, currControlComponent)
            );
          }
          break;
        case 'BinaryExpression':
        case 'CallExpression':
        case 'ExpressionStatement':
        case 'IfStatement':
        case 'UnaryExpression':
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
      console.log('INSTRTYPE: ' + lastControlItem.instrType);
      switch (lastControlItem.instrType) {
        case InstrType.APPLICATION:
          CseAnimation.animations.push(
            new BlockAnimation(lastControlComponent, CseAnimation.getNewControlItems())
          );
          if (!currControlComponent) return;
          if (checkFrameCreation(CseAnimation.previousFrame, CseAnimation.currentFrame)) {
            const appInstr = lastControlItem as AppInstr;
            const argStashItems = Layout.previousStashComponent.stashItemComponents.slice(
              -appInstr.numOfArgs
            );
            CseAnimation.animations.push(
              new FunctionFrameCreationAnimation(
                CseAnimation.currentFrame,
                currControlComponent,
                Layout.previousStashComponent.stashItemComponents.at(-appInstr.numOfArgs - 1)!,
                argStashItems
              )
            );
          }
          break;
        case InstrType.ASSIGNMENT:
          animation = new AssignmentAnimation(
            lastControlComponent,
            Layout.stashComponent.stashItemComponents.at(-1)!,
            ...lookupBinding(CseAnimation.currentFrame, (lastControlItem as AssmtInstr).symbol)
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
        case InstrType.BRANCH:
          if (!currControlComponent) return;
          CseAnimation.animations.push(
            new BranchAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              currControlComponent
            )
          );
          break;
        case InstrType.ENVIRONMENT:
          animation = new EnvironmentAnimation(
            CseAnimation.previousFrame,
            CseAnimation.currentFrame
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
        case InstrType.UNARY_OP:
          animation = new UnaryOperationAnimation(
            lastControlComponent,
            Layout.previousStashComponent.stashItemComponents.at(-1)!,
            Layout.stashComponent.stashItemComponents.at(-1)!
          );
          break;
        case InstrType.ARRAY_LITERAL:
        case InstrType.ARRAY_ACCESS:
        case InstrType.ARRAY_ASSIGNMENT:
        case InstrType.ARRAY_LENGTH:
        case InstrType.BREAK:
        case InstrType.BREAK_MARKER:
        case InstrType.CONTINUE_MARKER:
        case InstrType.FOR:
        case InstrType.MARKER:
        case InstrType.RESET:
        case InstrType.WHILE:
          break;
      }
    }
    if (animation) CseAnimation.animations.push(animation);
  }

  static async playAnimation() {
    if (!CseAnimation.animationEnabled) {
      CseAnimation.disableAnimations();
      return;
    }
    CseAnimation.disableAnimations();
    // Get the actual HTML <canvas> element and set the pointer events to none, to allow for
    // mouse events to pass through the animation layer, and be handled by the actual CSE Machine.
    // Setting the listening property to false on the Konva Layer does not seem to work, so
    // this is the only workaround.
    const canvasElement = CseAnimation.getLayer()?.getCanvas()._canvas;
    if (canvasElement) canvasElement.style.pointerEvents = 'none';
    // Play all the animations
    await Promise.all(this.animations.map(a => a.animate()));
  }
}
