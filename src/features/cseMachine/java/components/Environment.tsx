import { ECE } from 'java-slang';
import { Group } from 'react-konva';

import { Visible } from '../../components/Visible';
import { Config } from '../../CseMachineConfig';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { defaultActiveColor, defaultStrokeColor } from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';
import { Arrow } from './Arrow';
import { Frame } from './Frame';
import { Line } from './Line';
import { Obj } from './Object';
import { Variable } from './Variable';

export class Environment extends Visible {
  private readonly _methodFrames: Frame[] = [];
  private readonly _objects: Obj[] = [];
  private readonly _classFrames: Frame[] = [];
  private readonly _lines: Line[] = [];

  constructor(environment: ECE.Environment) {
    super();

    // Position.
    this._x =
      ControlStashConfig.ControlPosX +
      ControlStashConfig.ControlItemWidth +
      2 * Config.CanvasPaddingX;
    this._y =
      ControlStashConfig.StashPosY + ControlStashConfig.StashItemHeight + 2 * Config.CanvasPaddingY;

    // Create method frames.
    const methodFramesX = this._x;
    let methodFramesY: number = this._y;
    let methodFramesWidth = Number(Config.FrameMinWidth);
    environment.global.children.forEach(env => {
      if (env.name.includes('(')) {
        let currEnv: ECE.EnvNode | undefined = env;
        let parentFrame;
        while (currEnv) {
          const stroke =
            currEnv === environment.current ? defaultActiveColor() : defaultStrokeColor();
          const frame = new Frame(currEnv, methodFramesX, methodFramesY, stroke);
          this._methodFrames.push(frame);
          methodFramesY += frame.height() + Config.FramePaddingY;
          methodFramesWidth = Math.max(methodFramesWidth, frame.width());
          if (parentFrame) {
            frame.setParent(parentFrame);
          }

          parentFrame = frame;
          currEnv = currEnv.children.length ? currEnv.children[0] : undefined;
        }
      }
    });

    // Create objects.
    const objectFramesX = methodFramesX + methodFramesWidth + Config.FrameMinWidth;
    let objectFramesY: number = this._y;
    let objectFramesWidth = Number(Config.FrameMinWidth);
    environment.objects.forEach(obj => {
      const objectFrames: Frame[] = [];
      let objectFrameWidth = Number(Config.FrameMinWidth);

      // Get top env.
      let env: ECE.EnvNode | undefined = obj.frame;
      while (env.parent) {
        env = env.parent;
      }

      // Create frame top-down.
      while (env) {
        const stroke = env === environment.current ? defaultActiveColor() : defaultStrokeColor();
        const frame = new Frame(env, objectFramesX, objectFramesY, stroke);
        // No padding btwn obj frames thus no arrows required.
        objectFramesY += frame.height();
        objectFramesWidth = Math.max(objectFramesWidth, frame.width());

        env = env.children.length ? env.children[0] : undefined;

        objectFrames.push(frame);
        objectFrameWidth = Math.max(objectFrameWidth, frame.width());
      }

      // Standardize obj frames width.
      objectFrames.forEach(o => o.setWidth(objectFrameWidth));

      // Only add padding btwn objects.
      objectFramesY += Config.FramePaddingY;

      this._objects.push(new Obj(objectFrames, obj));
    });

    // Create class frames.
    const classFramesX = objectFramesX + objectFramesWidth + Config.FrameMinWidth;
    let classFramesY = this._y;
    for (const c of environment.global.frame.values()) {
      const classEnv = (c as ECE.Class).frame;
      const classFrameStroke =
        classEnv === environment.current ? defaultActiveColor() : defaultStrokeColor();
      const highlightOnHover = () => {
        const node = (c as ECE.Class).classDecl;
        let start = -1;
        let end = -1;
        if (node.location) {
          start = node.location.startLine - 1;
          end = node.location.endLine ? node.location.endLine - 1 : start;
        }
        CseMachine.setEditorHighlightedLines([[start, end]]);
      };
      const unhighlightOnHover = () => CseMachine.setEditorHighlightedLines([]);
      const classFrame = new Frame(
        classEnv,
        classFramesX,
        classFramesY,
        classFrameStroke,
        '',
        highlightOnHover,
        unhighlightOnHover
      );
      const superClassName = (c as ECE.Class).superclass?.frame.name;
      if (superClassName) {
        const parentFrame = this._classFrames.find(f => f.name.text === superClassName)!;
        classFrame.setParent(parentFrame);
      }
      this._classFrames.push(classFrame);
      classFramesY += classFrame.height() + Config.FramePaddingY;
    }

    // Draw arrow for var ref in mtd frames to corresponding obj.
    this._methodFrames.forEach(mf => {
      mf.bindings.forEach(b => {
        if (b.value instanceof Variable && b.value.variable.value.kind === ECE.StructType.OBJECT) {
          const objFrame = b.value.variable.value.frame;
          const matchingObj = this._objects.filter(o => o.getFrame().frame === objFrame)[0];
          b.value.value = new Arrow(
            b.value.x() + b.value.width() / 2,
            b.value.y() + b.value.type.height() + (b.value.height() - b.value.type.height()) / 2,
            matchingObj.x(),
            matchingObj.y() + matchingObj.height() / 2
          );
        }
      });
    });

    // Draw arrow for var ref in obj frames to corresponding var or obj.
    this._objects
      .flatMap(obj => obj.frames)
      .forEach(of => {
        of.bindings.forEach(b => {
          if (
            b.value instanceof Variable &&
            b.value.variable.value.kind === ECE.StructType.VARIABLE
          ) {
            const variable = b.value.variable.value;
            const matchingVariable = this._classFrames
              .flatMap(c => c.bindings)
              .filter(b => b.value instanceof Variable && b.value.variable === variable)[0]
              .value as Variable;
            b.value.value = new Arrow(
              b.value.x() + b.value.width() / 2,
              b.value.y() + b.value.type.height() + (b.value.height() - b.value.type.height()) / 2,
              matchingVariable.x(),
              matchingVariable.y() + matchingVariable.type.height()
            );
          }
          if (
            b.value instanceof Variable &&
            b.value.variable.value.kind === ECE.StructType.OBJECT
          ) {
            const obj = b.value.variable.value.frame;
            const matchingObj = this._objects.find(o => o.getFrame().frame === obj)!;
            // Variable always has a box.
            b.value.value = new Arrow(
              b.value.x() + b.value.width() / 2,
              b.value.y() + b.value.type.height() + (b.value.height() - b.value.type.height()) / 2,
              matchingObj.x(),
              matchingObj.y() + matchingObj.height() / 2
            );
          }
        });
      });

    // Draw line for obj to class.
    this._objects.forEach(obj => {
      const matchingClass = this._classFrames.find(
        c => c.name.text === obj.object.class.frame.name
      )!;
      const line = new Line(
        obj.x() + obj.width(),
        obj.y() + obj.height() / 2,
        matchingClass.x(),
        matchingClass.y() + matchingClass.height() / 2 + matchingClass.name.height()
      );
      this._lines.push(line);
    });
  }

  get classes() {
    return this._classFrames;
  }

  get objects() {
    return this._objects.flatMap(obj => obj.frames);
  }

  get frames() {
    return this._methodFrames;
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++}>
        {this._methodFrames.map(f => f.draw())}
        {this._objects.flatMap(obj => obj.frames).map(f => f.draw())}
        {this._classFrames.map(f => f.draw())}
        {this._lines.map(f => f.draw())}
      </Group>
    );
  }
}
