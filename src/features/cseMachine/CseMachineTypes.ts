import {
  EnvTree as EnvironmentTree,
  EnvTreeNode as EnvironmentTreeNode
} from 'js-slang/dist/createContext';
import { Environment } from 'js-slang/dist/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';

import { ArrayUnit as CompactArrayUnit } from './compactComponents/ArrayUnit';
import { Binding as CompactBinding } from './compactComponents/Binding';
import { Frame as CompactFrame } from './compactComponents/Frame';
import { Level as CompactLevel } from './compactComponents/Level';
import { ArrayUnit } from './components/ArrayUnit';
import { Binding } from './components/Binding';
import { Frame } from './components/Frame';
import { Level } from './components/Level';

/** this interface defines a drawing function */
export interface Drawable {
  /** the draw logic */
  draw: (key: number) => React.ReactNode;
}

/** this interface defines a Hoverable object */
export interface IHoverable {
  onMouseEnter(e: KonvaEventObject<MouseEvent>): void;
  onMouseLeave(e: KonvaEventObject<MouseEvent>): void;
}

/** this interface defines coordinates and dimensions */
export interface IVisible extends Drawable {
  /** x coordinate of top-left corner */
  x(): number;

  /** y coordinate of top-left corner */
  y(): number;

  /** width */
  width(): number;

  /** height */
  height(): number;

  ref?: React.RefObject<any>;
}

/** unassigned is internally represented as a symbol */
export type UnassignedData = symbol;

/** types of primitives in JS Slang  */
export type PrimitiveTypes = number | string | boolean | null | undefined;

/** types of functions in JS Slang */
export type FnTypes = {
  /** the function itself */
  (): any;

  /** the enclosing environment */
  environment: Environment;

  /** string representation of the function */
  functionName: string;

  /** unique id of the function */
  id: string;

  node: any;
};

/** the types of data in the JS Slang context */
export type Data = PrimitiveTypes | FnTypes | (() => any) | UnassignedData | Data[];

/** modified `Environment` to store children and associated frame */
export type Env = Environment | null;

/** modified `EnvTree` */
export type EnvTree = EnvironmentTree & { root: EnvTreeNode };

/** modified `EnvTreeNode` */
export type EnvTreeNode = EnvironmentTreeNode & {
  parent: EnvTreeNode;
  children: EnvTreeNode[];
  level?: Level;
  frame?: Frame;
  compactLevel: CompactLevel;
  compactFrame?: CompactFrame;
  xCoord?: number;
};

/** empty object type  */
export type EmptyObject = {
  [K in any]: never;
};

/** types that a reference can be: either from a binding in a frame or from an array  */
export type ReferenceType = Binding | ArrayUnit;
export type CompactReferenceType = CompactBinding | CompactArrayUnit;

/** type of an array of steps (as defined by a function), for the arrow classes */
export type StepsArray = Array<(x: number, y: number) => [number, number]>;
