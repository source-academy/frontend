import type { AppInstr, ArrLitInstr, AssmtInstr } from 'js-slang/dist/cse-machine/types';
import { InstrType } from 'js-slang/dist/cse-machine/types';
import type { Node } from 'js-slang/dist/types';
import { Layer } from 'konva/lib/Layer';
import { Easings } from 'konva/lib/Tween';
import { createRef } from 'react';

import { ArrayAccessAnimation } from './animationComponents/ArrayAccessAnimation';
import { ArrayAssignmentAnimation } from './animationComponents/ArrayAssignmentAnimation';
import { ArraySpreadAnimation } from './animationComponents/ArraySpreadAnimation';
import { AssignmentAnimation } from './animationComponents/AssignmentAnimation';
import { Animatable } from './animationComponents/base/Animatable';
import { lookupBinding } from './animationComponents/base/AnimationUtils';
import { BinaryOperationAnimation } from './animationComponents/BinaryOperationAnimation';
import { BranchAnimation } from './animationComponents/BranchAnimation';
import { ControlExpansionAnimation } from './animationComponents/ControlExpansionAnimation';
import { ControlToStashAnimation } from './animationComponents/ControlToStashAnimation';
import { EnvironmentAnimation } from './animationComponents/EnvironmentAnimation';
import { FrameCreationAnimation } from './animationComponents/FrameCreationAnimation';
import { FunctionApplicationAnimation } from './animationComponents/FunctionApplicationAnimation';
import { InstructionApplicationAnimation } from './animationComponents/InstructionApplicationAnimation';
import { LookupAnimation } from './animationComponents/LookupAnimation';
import { PopAnimation } from './animationComponents/PopAnimation';
import { UnaryOperationAnimation } from './animationComponents/UnaryOperationAnimation';
import { isNode } from './components/ControlStack';
import { Frame } from './components/Frame';
import { ArrayValue } from './components/values/ArrayValue';
import CseMachine from './CseMachine';
import { Layout } from './CseMachineLayout';
import { isBuiltInFn, isEnvEqual, isInstr, isStreamFn } from './CseMachineUtils';

export class CseAnimation {
  static readonly animations: Animatable[] = [];
  static readonly defaultDuration = 300;
  static readonly defaultEasing = Easings.StrongEaseInOut;
  private static animationEnabled = false;
  private static hideReferenceArrows = false;
  private static hiddenFrameIds = new Set<string>();
  private static currentFrame: Frame;
  private static previousFrame: Frame;

  static layerRef = createRef<Layer>();
  static getLayer(): Layer | null {
    return this.layerRef.current;
  }

  static enableAnimations(): void {
    CseAnimation.animationEnabled = true;
  }

  static disableAnimations(): void {
    CseAnimation.animationEnabled = false;
  }

  static setHideReferenceArrows(shouldHide: boolean): void {
    CseAnimation.hideReferenceArrows = shouldHide;
  }

  static shouldHideReferenceArrows(): boolean {
    return CseAnimation.hideReferenceArrows;
  }

  static setHiddenFrameIds(frameIds: Iterable<string>): void {
    CseAnimation.hiddenFrameIds = new Set(frameIds);
  }

  static clearHiddenFrameIds(): void {
    CseAnimation.hiddenFrameIds.clear();
  }

  static shouldHideFrame(frameId: string): boolean {
    return CseAnimation.hiddenFrameIds.has(frameId);
  }

  static setCurrentFrame(frame: Frame) {
    CseAnimation.previousFrame = CseAnimation.currentFrame ?? frame;
    CseAnimation.currentFrame = frame;
  }

  private static clearAnimationComponents(): void {
    CseAnimation.animations.forEach(a => a.destroy());
    CseAnimation.animations.length = 0;
  }

  private static getNewControlItems() {
    const currentControlSize = Layout.controlComponent.control.size();
    const previousControlSize = Layout.previousControlComponent.control.size();
    const numOfItems = currentControlSize - previousControlSize + 1;
    if (numOfItems <= 0) return [];
    return Layout.controlComponent.stackItemComponents.slice(-numOfItems);
  }

  private static handleNode(node: Node) {
    const lastControlComponent = Layout.previousControlComponent.stackItemComponents.at(-1)!;
    const currStashComponent = Layout.stashComponent.stashItemComponents.at(-1)!;
    // In conductor/snapshot mode the adapter stores the real AST type in __snapAnimType
    // while keeping type:'Identifier' for correct control-stack display.  Real AST nodes
    // never have __snapAnimType so this falls through to node.type transparently.
    const effectiveType = (node as any).__snapAnimType ?? node.type;
    switch (effectiveType) {
      case 'Program':
      case 'BlockStatement':
      case 'StatementSequence': {
        // In snapshot mode, body is stored in __snapBody (stub elements).
        // For real AST nodes, (node as any).__snapBody is undefined so we fall back to node.body.
        const body: Node[] = (node as any).__snapBody ?? (node as any).body ?? [];
        if (body.length === 1) {
          CseAnimation.handleNode(body[0]);
        } else {
          CseAnimation.animations.push(
            new ControlExpansionAnimation(lastControlComponent, CseAnimation.getNewControlItems()),
          );
          if (
            !isEnvEqual(
              CseAnimation.currentFrame.environment,
              CseAnimation.previousFrame.environment,
            )
          ) {
            CseAnimation.animations.push(
              new FrameCreationAnimation(lastControlComponent, CseAnimation.currentFrame),
            );
          }
        }
        break;
      }
      case 'Literal':
        CseAnimation.animations.push(
          new ControlToStashAnimation(lastControlComponent, currStashComponent!),
        );
        break;
      case 'ArrowFunctionExpression':
        CseAnimation.animations.push(
          new ControlToStashAnimation(lastControlComponent, currStashComponent!),
        );
        break;
      case 'Identifier': {
        const identNode = node as any;
        // Special case for 'undefined' identifier
        if (identNode.name === 'undefined') {
          CseAnimation.animations.push(
            new ControlToStashAnimation(lastControlComponent, currStashComponent!),
          );
        } else {
          // Only show LookupAnimation when the binding is found in a non-global frame.
          // When the current frame is already the global frame (id '-1'), or the lookup
          // resolves to the global frame, use ControlToStashAnimation instead.
          const currentEnvId = CseAnimation.currentFrame?.environment?.id;
          if (currentEnvId && currentEnvId !== '-1') {
            const [foundFrame, foundBinding] = lookupBinding(CseAnimation.currentFrame, identNode.name);
            if (foundFrame?.environment?.id !== '-1') {
              CseAnimation.animations.push(
                new LookupAnimation(lastControlComponent, currStashComponent!, foundFrame, foundBinding),
              );
            } else {
              CseAnimation.animations.push(
                new ControlToStashAnimation(lastControlComponent, currStashComponent!),
              );
            }
          } else {
            CseAnimation.animations.push(
              new ControlToStashAnimation(lastControlComponent, currStashComponent!),
            );
          }
        }
        break;
      }
      case 'SpreadElement':
        CseAnimation.animations.push(
          new ControlExpansionAnimation(lastControlComponent, CseAnimation.getNewControlItems()),
        );
        break;
      case 'AssignmentExpression':
      case 'ArrayExpression':
      case 'BinaryExpression':
      case 'CallExpression':
      case 'ConditionalExpression':
      case 'ForStatement':
      case 'IfStatement':
      case 'MemberExpression':
      case 'ReturnStatement':
      case 'UnaryExpression':
      case 'VariableDeclaration':
      case 'FunctionDeclaration':
      case 'WhileStatement':
        CseAnimation.animations.push(
          new ControlExpansionAnimation(lastControlComponent, CseAnimation.getNewControlItems()),
        );
        break;
      case 'ExpressionStatement':
        CseAnimation.handleNode((node as any).expression);
        break;
    }
  }

  static updateAnimation() {
    CseAnimation.clearAnimationComponents();

    if (!Layout.previousControlComponent) return;
    const lastControlItem = Layout.previousControlComponent.control.peek();
    const lastControlComponent = Layout.previousControlComponent.stackItemComponents.at(-1);
    const currStashComponent = Layout.stashComponent.stashItemComponents.at(-1);
    if (
      !CseAnimation.animationEnabled ||
      !lastControlItem ||
      !lastControlComponent ||
      !CseMachine.getControlStash() // TODO: handle cases where there are only environment animations
    ) {
      return;
    }
    if (isNode(lastControlItem)) {
      CseAnimation.handleNode(lastControlItem);
    } else if (isInstr(lastControlItem)) {
      switch (lastControlItem.instrType) {
        case InstrType.APPLICATION: {
          const appInstr = lastControlItem as AppInstr;
          // numOfArgs may be undefined when serialized from Python snapshot metadata
          // (e.g. 0-arg calls where the plugin uses a truthy guard). Fall back to 0.
          const numOfArgs = appInstr.numOfArgs ?? 0;
          const fnStashItem = Layout.previousStashComponent.stashItemComponents.at(-numOfArgs - 1);
          if (!fnStashItem) break;
          const fn = fnStashItem.value;
          const newControlItems = CseAnimation.getNewControlItems();
          // Use InstructionApplicationAnimation for:
          //  - js-slang builtins / streams
          //  - Python builtins (serialized as strings — no reference arrow)
          //  - any call that didn't push new control items (e.g. tail-call-like builtins)
          if (isBuiltInFn(fn) || isStreamFn(fn) || !fnStashItem.arrow || newControlItems.length === 0) {
            CseAnimation.animations.push(
              new InstructionApplicationAnimation(
                lastControlComponent,
                Layout.previousStashComponent.stashItemComponents.slice(-numOfArgs - 1),
                currStashComponent!,
              ),
            );
            break;
          }
          // A new frame is created whenever a user-defined function is applied.
          // Use environment identity to detect this (handles 0-arg functions too).
          const frameCreated = !isEnvEqual(
            CseAnimation.currentFrame?.environment,
            CseAnimation.previousFrame?.environment,
          );
          // slice(-0) === slice(0) returns the whole array, so guard 0-arg case.
          const argStashItems =
            numOfArgs > 0
              ? Layout.previousStashComponent.stashItemComponents.slice(-numOfArgs)
              : [];
          CseAnimation.animations.push(
            new FunctionApplicationAnimation(
              lastControlComponent,
              newControlItems,
              fnStashItem,
              argStashItems,
              frameCreated ? CseAnimation.currentFrame : undefined,
            ),
          );
          break;
        }
        case InstrType.ARRAY_ACCESS:
          CseAnimation.animations.push(
            new ArrayAccessAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-2)!,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              Layout.stashComponent.stashItemComponents.at(-1)!,
            ),
          );
          break;
        case InstrType.ARRAY_ASSIGNMENT: {
          const arrayItem = Layout.previousStashComponent.stashItemComponents.at(-3)!;
          CseAnimation.animations.push(
            new ArrayAssignmentAnimation(
              lastControlComponent,
              arrayItem,
              Layout.values.get(arrayItem.value.id) as ArrayValue,
              Layout.previousStashComponent.stashItemComponents.at(-2)!,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              Layout.stashComponent.stashItemComponents.at(-1)!,
            ),
          );
          break;
        }
        case InstrType.ARRAY_LITERAL: {
          const arrSize = (lastControlItem as ArrLitInstr).arity;
          CseAnimation.animations.push(
            new InstructionApplicationAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.slice(-arrSize),
              currStashComponent!,
            ),
          );
          break;
        }
        case InstrType.ASSIGNMENT:
          CseAnimation.animations.push(
            new AssignmentAnimation(
              lastControlComponent,
              currStashComponent!,
              ...lookupBinding(CseAnimation.currentFrame, (lastControlItem as AssmtInstr).symbol),
            ),
          );
          break;
        case InstrType.BINARY_OP:
          CseAnimation.animations.push(
            new BinaryOperationAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-2)!,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              currStashComponent!,
            ),
          );
          break;
        case InstrType.BRANCH:
        case InstrType.FOR:
        case InstrType.WHILE:
          CseAnimation.animations.push(
            new BranchAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              CseAnimation.getNewControlItems(),
            ),
          );
          break;
        case InstrType.ENVIRONMENT:
          CseAnimation.animations.push(
            new EnvironmentAnimation(CseAnimation.previousFrame, CseAnimation.currentFrame),
          );
          break;
        case InstrType.POP:
          {
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
                lastStashIsUndefined ? currStashComponent : undefined,
              ),
            );
          }
          break;
        case InstrType.UNARY_OP:
          CseAnimation.animations.push(
            new UnaryOperationAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              currStashComponent!,
            ),
          );
          break;
        case InstrType.SPREAD: {
          const control = Layout.controlComponent.stackItemComponents;
          const array = Layout.previousStashComponent.stashItemComponents.at(-1)!.arrow!
            .target! as ArrayValue;

          let currCallInstr;

          for (let i = 1; control.at(-i) != undefined; i++) {
            if (control.at(-i)?.text.includes('call ')) {
              // find call instr above
              currCallInstr = control.at(-i);
              break;
            }
          }

          const resultItems =
            array.data.length !== 0
              ? Layout.stashComponent.stashItemComponents.slice(-array.data.length)
              : [];

          CseAnimation.animations.push(
            new ArraySpreadAnimation(
              lastControlComponent,
              Layout.previousStashComponent.stashItemComponents.at(-1)!,
              resultItems!,
              currCallInstr!,
            ),
          );
          break;
        }
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
    if (!CseAnimation.animationEnabled) {
      CseAnimation.clearAnimationComponents();
      return;
    }
    CseAnimation.disableAnimations();
    // Get the actual HTML <canvas> element and set the pointer events to none, to allow for
    // mouse events to pass through the animation layer and be handled by the actual CSE Machine.
    // Setting the listening property to false on the Konva Layer does not seem to work, so
    // this a workaround.
    const canvasElement = CseAnimation.getLayer()?.getNativeCanvasElement();
    if (canvasElement) canvasElement.style.pointerEvents = 'none';
    // Play all the animations
    await Promise.all(this.animations.map(a => a.animate()));
  }
}
