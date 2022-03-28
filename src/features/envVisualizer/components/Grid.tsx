import React from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { EnvTreeNode, Visible } from '../EnvVisualizerTypes';
import { ArrayLevel } from './ArrayLevel';
import { ArrayUnit } from './ArrayUnit';
import { ArrowLane } from './ArrowLane';
import { Binding } from './Binding';
import { Frame } from './Frame';
import { FrameLevel } from './FrameLevel';
import { Level } from './Level';
import { ArrayValue } from './values/ArrayValue';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class Grid implements Visible {
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number;
  /** list of all levels */
  frameLevels: FrameLevel[];
  arrayLevels: ArrayLevel[];
  levels: Level[];
  widths: number[];
  static cumHeights: number[];

  constructor(
    /** the environment tree nodes */
    readonly envTreeNodes: EnvTreeNode[][]
  ) {
    this._x = Config.CanvasPaddingX;
    this._y = Config.CanvasPaddingY;
    this.frameLevels = [];
    this.arrayLevels = [];
    this.levels = [];
    this.widths = [];
    Grid.cumHeights = [];
    this._height = 0;
    this._width = 0;
    this.update(envTreeNodes);
  }
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return this._height;
  }
  width(): number {
    return this._width;
  }

  destroy = () => {
    this.frameLevels.forEach(l => l.ref.current.destroyChildren());
  };

  /**
   * Processes updates to Layout.environmentTree.
   * @param envTreeNodes an array of different arrays of EnvTreeNodes corresponding to a single level.
   */
  update(envTreeNodes: EnvTreeNode[][]) {
    Frame.reset();
    FrameLevel.reset();
    ArrowLane.reset();
    this.arrayLevels.forEach(x => x.reset());
    this.frameLevels = [];
    this.arrayLevels = [];
    this.levels = [];
    const nodes: Array<[number, EnvTreeNode]> = envTreeNodes.reduce((result, nodes, i) => {
      if (i === 0) {
        this.frameLevels[i] = new FrameLevel(null);
        this.arrayLevels[i] = new ArrayLevel(this.frameLevels[i]);
      } else {
        this.frameLevels[i] = new FrameLevel(this.arrayLevels[i - 1]);
        this.arrayLevels[i] = new ArrayLevel(this.frameLevels[i]);
      }
      this.levels.push(this.frameLevels[i]);
      this.levels.push(this.arrayLevels[i]);
      return [...result, ...nodes.map<[number, EnvTreeNode]>(node => [i, node])];
    }, new Array<[number, EnvTreeNode]>());

    nodes.sort((a, b) => parseInt(a[1].environment.id) - parseInt(b[1].environment.id));
    this.widths = [];
    Grid.cumHeights = [];
    nodes.forEach(node => {
      this.frameLevels[node[0]].addFrame(node[1]);
    });

    Layout.values.forEach((v, d, m) => {
      const isArray = v instanceof ArrayValue;
      if (isArray) {
        let bindings = v.referencedBy.filter(r => r instanceof Binding) as Binding[];
        let p: ArrayUnit = v.referencedBy.find(x => x instanceof ArrayUnit) as ArrayUnit;
        const belongsToFrame = v.referencedBy[0] instanceof Binding;
        while (bindings.length === 0) {
          bindings = p.parent.referencedBy.filter(r => r instanceof Binding) as Binding[];
          p = p.parent.referencedBy.find(x => x instanceof ArrayUnit) as ArrayUnit;
        }
        const references = v.units
          .filter(x => x.value instanceof FnValue || x.value instanceof GlobalFnValue)
          .map(x => x.value as FnValue);

        let [yCoordSum, xCoordSum, count] = bindings.reduce(
          (acc, binding) => {
            const [yCoordSum, xCoordSum, count] = acc;
            return [yCoordSum + binding.frame.yCoord, xCoordSum + binding.frame.xCoord, count + 1];
          },
          [0, 0, 0]
        );
        // Move array closer to fn objects they are pointing to
        [yCoordSum, xCoordSum, count] = references.reduce(
          (acc, ref) => {
            const [yCoordSum, xCoordSum, count] = acc;
            return [
              yCoordSum + (ref?.enclosingEnvNode?.frame?.yCoord || 0),
              xCoordSum + (ref?.enclosingEnvNode?.frame?.xCoord || 0),
              count + (ref.enclosingEnvNode === undefined ? 0 : 1)
            ];
          },
          [yCoordSum, xCoordSum, count]
        );
        const meanX = xCoordSum / count;
        if (belongsToFrame) {
          const y = (v.referencedBy[0] as Binding).frame.yCoord;
          const x =
            Frame.cumWidths[Math.floor(meanX)] * (meanX - Math.floor(meanX)) +
            Frame.cumWidths[Math.floor(meanX) + 1] * (Math.floor(meanX) + 1 - meanX) +
            Config.FrameMarginX * 0.5;
          this.arrayLevels[Math.floor(y)].addArray(v, x);
        } else if (v.referencedBy[0] instanceof ArrayUnit) {
          const y = v.referencedBy[0].parent.level?.parentLevel?.yCoord ?? 0;
          const x =
            v.referencedBy[0].x() +
            (v.referencedBy[0] instanceof ArrayUnit && v.referencedBy[0].isLastUnit
              ? Config.DataUnitWidth * 2
              : 0);
          this.arrayLevels[Math.floor(y)].addArray(v, x);
        }
      }
    });
    // Put the array levels and frame levels at same vertical position.
    // Requires all array's x-position to be at the right of all frames and its fn values.
    if (Frame.maxXCoord <= 0) {
      Grid.cumHeights = this.levels.reduce(
        (res, b, i) => {
          const height =
            i % 2 === 0
              ? 0
              : Math.max(
                  Frame.heights[Math.floor(i / 2)] +
                    (Frame.heights[Math.floor(i / 2)] > 0 ? Config.FrameMarginY : 0),
                  this.arrayLevels[Math.floor((i - 1) / 2)].height() +
                    (this.arrayLevels[Math.floor((i - 1) / 2)].height() > 0
                      ? Config.FrameMarginY
                      : 0)
                );
          return [...res, res[res.length - 1] + height];
        },
        [Config.FrameMarginY.valueOf()]
      );
      this.levels.forEach((level, i) => {
        level.setY(Grid.cumHeights[i]);
      });
    } else {
      // All array levels will be separate from the frame levels.
      Grid.cumHeights = this.levels.reduce(
        (res, b, i) => {
          const height =
            i % 2 === 0
              ? Frame.heights[Math.floor(i / 2)] +
                (this.arrayLevels[Math.floor(i / 2)].height() > 0 ? Config.FrameMarginY : 0)
              : this.arrayLevels[Math.floor((i - 1) / 2)].height() + Config.FrameMarginY;
          return [...res, res[res.length - 1] + height];
        },
        [Config.FrameMarginY.valueOf()]
      );
      this.levels.forEach((level, i) => {
        level.setY(Grid.cumHeights[i]);
      });
    }

    // get the cumulative height of all the array and frame levels
    this._height = Grid.cumHeights[Grid.cumHeights.length - 1];
    // get the maximum width of all the array and frame levels
    this._width = Math.max(
      this.frameLevels.reduce<number>((a, b) => Math.max(a, b.width()), 0),
      this.arrayLevels.reduce<number>((a, b) => Math.max(a, b.width()), 0)
    );
  }

  /**
   * Find the Grid y-coordinate given a x-position.
   * @param y absolute position
   * @returns Largest x-coordinate smaller than or equal to a given x position.
   */
  static lastYCoordBelow(y: number) {
    let l = Grid.cumHeights.length;
    while (l--) {
      if (Grid.cumHeights[l] <= y) {
        return l;
      }
    }
    return 0;
  }

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++}>
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          key={Layout.key++}
          listening={false}
        />
        {this.arrayLevels.reverse().map(level => level.draw())}
        {this.frameLevels.reverse().map(level => level.draw())}
      </Group>
    );
  }
}
