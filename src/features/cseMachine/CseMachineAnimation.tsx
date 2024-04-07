import { AppInstr, ArrLitInstr, AssmtInstr, InstrType } from 'js-slang/dist/cse-machine/types';
import { Layer } from 'konva/lib/Layer';
import { Easings } from 'konva/lib/Tween';
import React from 'react';

import { ArrayAccessAnimation } from './animationComponents/ArrayAccessAnimation';
import { ArrayAssignmentAnimation } from './animationComponents/ArrayAssignmentAnimation';
import { ArrayLiteralAnimation } from './animationComponents/ArrayLiteralAnimation';
import { AssignmentAnimation } from './animationComponents/AssignmentAnimation';
import { Animatable } from './animationComponents/base/Animatable';
import { checkFrameCreation, lookupBinding } from './animationComponents/base/AnimationUtils';
import { BinaryOperationAnimation } from './animationComponents/BinaryOperationAnimation';
import { BlockAnimation } from './animationComponents/BlockAnimation';
import { BranchAnimation } from './animationComponents/BranchAnimation';
import { EnvironmentAnimation } from './animationComponents/EnvironmentAnimation';
import { FrameCreationAnimation } from './animationComponents/FrameCreationAnimation';
import { FunctionApplicationAnimation } from './animationComponents/FunctionApplicationAnimation';
import { LiteralAnimation } from './animationComponents/LiteralAnimation';
import { LookupAnimation } from './animationComponents/LookupAnimation';
import { PopAnimation } from './animationComponents/PopAnimation';
import { UnaryOperationAnimation } from './animationComponents/UnaryOperationAnimation';
import { isInstr } from './components/ControlStack';
import { Frame } from './components/Frame';
import CseMachine from './CseMachine';
import { Layout } from './CseMachineLayout';
import { isClosure, isGlobalFn } from './CseMachineUtils';

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
    return Layout.controlComponent.stackItemComponents.slice(previousControlSize - 1);
  }

  static updateAnimation() {
    CseAnimation.animations.forEach(a => a.destroy());
    CseAnimation.clearAnimationComponents();

    if (!Layout.previousControlComponent) return;
    const lastControlItem = Layout.previousControlComponent.control.peek();
    const lastControlComponent = Layout.previousControlComponent.stackItemComponents.at(-1);
    const currStashComponent = Layout.stashComponent.stashItemComponents.at(-1);
    // const currControlComponent = Layout.controlComponent.stackItemComponents.at(-1);
    if (
      !CseAnimation.animationEnabled ||
      !lastControlItem ||
      !lastControlComponent ||
      !CseMachine.getControlStash() // TODO: handle cases where there are only environment animations
    ) {
      return;
    }
    if (!isInstr(lastControlItem)) {
      console.log('TYPE: ' + lastControlItem.type);
      switch (lastControlItem.type) {
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
          CseAnimation.animations.push(
            new LiteralAnimation(lastControlComponent, currStashComponent!)
          );
          break;
        case 'BlockStatement':
          CseAnimation.animations.push(
            new BlockAnimation(lastControlComponent, CseAnimation.getNewControlItems())
          );
          // if (!currControlComponent) return;
          if (checkFrameCreation(CseAnimation.previousFrame, CseAnimation.currentFrame)) {
            CseAnimation.animations.push(
              new FrameCreationAnimation(lastControlComponent, CseAnimation.currentFrame)
            );
          }
          break;
        case 'Identifier':
          // Special case for 'undefined' identifier, use the literal animation instead
          if (lastControlComponent.text === 'undefined') {
            CseAnimation.animations.push(
              new LiteralAnimation(lastControlComponent, currStashComponent!)
            );
          } else {
            CseAnimation.animations.push(
              new LookupAnimation(
                lastControlComponent,
                currStashComponent!,
                ...lookupBinding(CseAnimation.currentFrame, lastControlItem.name)
              )
            );
          }
          break;
        case 'Literal':
          CseAnimation.animations.push(
            new LiteralAnimation(lastControlComponent, currStashComponent!)
          );
          break;
        case 'Program':
          CseAnimation.animations.push(
            new BlockAnimation(lastControlComponent, CseAnimation.getNewControlItems())
          );
          // if (!currControlComponent) return;
          if (checkFrameCreation(CseAnimation.previousFrame, CseAnimation.currentFrame)) {
            CseAnimation.animations.push(
              new FrameCreationAnimation(lastControlComponent, CseAnimation.currentFrame)
            );
          }
          break;
        // block split cases
        case 'AssignmentExpression':
        case 'ArrayExpression':
        case 'BinaryExpression':
        case 'CallExpression':
        case 'ConditionalExpression':
        case 'ExpressionStatement':
        case 'ForStatement':
        case 'IfStatement':
        case 'MemberExpression':
        case 'StatementSequence':
        case 'UnaryExpression':
        case 'VariableDeclaration':
        case 'WhileStatement':
          CseAnimation.animations.push(
            new BlockAnimation(lastControlComponent, CseAnimation.getNewControlItems())
          );
          break;
      }
    } else {
      console.log('INSTRTYPE: ' + lastControlItem.instrType);
      switch (lastControlItem.instrType) {
        case InstrType.APPLICATION:
          const appInstr = lastControlItem as AppInstr;
          const fnStashItem = Layout.previousStashComponent.stashItemComponents.at(
            -appInstr.numOfArgs - 1
          )!;
          const fn = fnStashItem.value;
          const isPredefined = isGlobalFn(fn) || (isClosure(fn) && fn.preDefined);

          // TODO: find a better way to test for a variadic function call
          if (appInstr.numOfArgs > CseAnimation.currentFrame.bindings.length
            || CseAnimation.currentFrame.environment.heap.size() > 0 // only variadics can instantaneously create array
          ) {
            // function is variadic, disable animation
            break;
          }

          CseAnimation.animations.push(
            new FunctionApplicationAnimation(
              lastControlComponent,
              CseAnimation.getNewControlItems(),
              fnStashItem,
              Layout.previousStashComponent.stashItemComponents.slice(-appInstr.numOfArgs),
              !isPredefined && checkFrameCreation(CseAnimation.previousFrame, CseAnimation.currentFrame) 
                ? CseAnimation.currentFrame : undefined
            )
          );
          break;
        case InstrType.ARRAY_ACCESS:
          CseAnimation.animations.push(
            new ArrayAccessAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-2)!,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              Layout.stashComponent.stashItemComponents.at(-1)!
            )
          );
          break;
        case InstrType.ARRAY_ASSIGNMENT:
          CseAnimation.animations.push(
            new ArrayAssignmentAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-3)!,
              Layout.previousStashComponent.stashItemComponents.at(-2)!,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              Layout.stashComponent.stashItemComponents.at(-1)!
            )
          );
          break;
        case InstrType.ARRAY_LITERAL:
          const arrSize = (lastControlItem as ArrLitInstr).arity;
          CseAnimation.animations.push(
            new ArrayLiteralAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.slice(-arrSize),
              currStashComponent!
            )
          );
          break;
        case InstrType.ASSIGNMENT:
          CseAnimation.animations.push(
            new AssignmentAnimation(
              lastControlComponent,
              currStashComponent!,
              ...lookupBinding(CseAnimation.currentFrame, (lastControlItem as AssmtInstr).symbol)
            )
          );
          break;
        case InstrType.BINARY_OP:
          CseAnimation.animations.push(
            new BinaryOperationAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-2)!,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              currStashComponent!
            )
          );
          break;
        case InstrType.BRANCH:
        case InstrType.FOR:
        case InstrType.WHILE:
          // if (!currControlComponent) return;
          CseAnimation.animations.push(
            new BranchAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              CseAnimation.getNewControlItems()
            )
          );
          break;
        case InstrType.ENVIRONMENT:
          CseAnimation.animations.push(
            new EnvironmentAnimation(CseAnimation.previousFrame, CseAnimation.currentFrame)
          );
          break;
        case InstrType.POP:
          const currentStashSize = Layout.stashComponent.stash.size();
          const previousStashSize = Layout.previousStashComponent.stash.size();
          const lastStashIsUndefined =
            currentStashSize === 1 &&
            currStashComponent!.text === 'undefined' &&
            currentStashSize === previousStashSize;
          CseAnimation.animations.push(
            new PopAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              lastStashIsUndefined ? currStashComponent : undefined
            )
          );
          break;
        case InstrType.UNARY_OP:
          CseAnimation.animations.push(
            new UnaryOperationAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              currStashComponent!
            )
          );
          break;
        case InstrType.ARRAY_LENGTH:
        case InstrType.BREAK:
        case InstrType.BREAK_MARKER:
        case InstrType.CONTINUE_MARKER:
        case InstrType.MARKER:
        case InstrType.RESET:
          break;
      }
    }
  }

  static async playAnimation() {
    if (!CseAnimation.animationEnabled || CseMachine.getStackTruncated()) {
      CseAnimation.animations.forEach(a => a.destroy());
      CseAnimation.clearAnimationComponents();
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
