import React from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { EnvTreeNode } from '../CseMachineTypes';
import { getNextChildren } from '../CseMachineUtils';
import { ArrayLevel } from './ArrayLevel';
import { ArrayUnit } from './ArrayUnit';
import { ArrowLane } from './ArrowLane';
import { Binding } from './Binding';
import { Frame } from './Frame';
import { FrameLevel } from './FrameLevel';
import { Level } from './Level';
import { ArrayValue } from './values/ArrayValue';
import { Visible } from './Visible';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class Grid extends Visible {
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
    super();
    this._x = 0;
    this._y = 0;
    this.frameLevels = [];
    this.arrayLevels = [];
    this.levels = [];
    this.widths = [];
    Grid.cumHeights = [];
    this._height = 0;
    this._width = 0;
    this.update(envTreeNodes);
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
    // Compute the x coordinate of each frame by the max of 1 + the last xcoord of all frames before that frame on the same level
    // and the xcoord of its immediate parent
    const grid: (EnvTreeNode | undefined)[][] = [];
    nodes.forEach(node => {
      // children frame not to left of parent.
      grid[node[0]] = grid[node[0]] ?? [];
      node[1].xCoord = Math.max(
        grid[node[0]].length - 1 + 1,
        (node[1] as EnvTreeNode).parent?.xCoord ?? 0
      );
      grid[node[0]][node[1].xCoord] = node[1];
      if (node[1].parent) {
        let currentNode = node[1];
        let level = node[0];
        let updatedParent = true;
        // if current frame is the first child of its parent frame and none of the frames to the left of the current frame
        // is pointing to any frame to the right of the parent frame, shift the parent frame above the current frame
        // (and move all frames to its right.) This will not violate the rule that all frames mustn't be at the left of its parent frame
        // since the parent frame will not be at the right of the current frame, and any children frame of frames to the right of the parent frame
        // will be created to right of those frames.
        while (updatedParent) {
          const parentNode = currentNode.parent;
          if (
            parentNode.xCoord &&
            parentNode.children.flatMap(x => getNextChildren(x as EnvTreeNode))[0] === currentNode
          ) {
            if (currentNode.xCoord === undefined || parentNode.xCoord === undefined) {
              updatedParent = false;
            } else {
              const diff: number = currentNode.xCoord - parentNode.xCoord;
              const oldParentCoord = parentNode.xCoord;
              if (
                diff > 0 &&
                grid[level]
                  .slice(oldParentCoord, currentNode.xCoord)
                  .every(
                    x =>
                      x === undefined ||
                      parseInt(x.parent.environment.id ?? 0) < parseInt(parentNode.environment.id)
                  )
              ) {
                grid[level - 1].slice(oldParentCoord).forEach(x => {
                  if (x !== undefined) {
                    x.xCoord = x.xCoord ? x.xCoord + diff : x.xCoord;
                  }
                });
                grid[level - 1] = [
                  ...grid[level - 1].slice(0, oldParentCoord),
                  ...Array(diff).fill(undefined),
                  ...grid[level - 1].slice(oldParentCoord)
                ];
                level = level - 1;
                currentNode = parentNode;
              } else {
                updatedParent = false;
              }
            }
          } else {
            updatedParent = false;
          }
        }
      }
    });
    // ordered by increasing y coord (since frame guaranteed to be to the right of its parent, and all frames are sorted by frame id)
    // followed by increasing xCoord
    nodes.sort((a, b) => (a[1].xCoord ?? 0) - (b[1].xCoord ?? 0));
    nodes.forEach(node => this.frameLevels[node[0]].addFrame(node[1]));

    Layout.values.forEach((v, d, m) => {
      if (v instanceof ArrayValue) {
        let bindings = v.referencedBy.filter(r => r instanceof Binding) as Binding[];
        let p: ArrayUnit = v.referencedBy.find(x => x instanceof ArrayUnit) as ArrayUnit;
        const belongsToFrame = v.referencedBy[0] instanceof Binding;
        while (bindings.length === 0) {
          bindings = p.parent.referencedBy.filter(r => r instanceof Binding) as Binding[];
          p = p.parent.referencedBy.find(x => x instanceof ArrayUnit) as ArrayUnit;
        }

        if (belongsToFrame) {
          const y = (v.referencedBy[0] as Binding).frame.yCoord;
          // array close to first declaration, aligned to the frame to its right for clarity.
          const x =
            Frame.cumWidths[(v.referencedBy[0] as Binding).frame.xCoord + 1] +
            0.8 * Config.FrameMarginX;
          // Alternative approach to move array closer to horizontal mean of bindings
          // https://github.com/source-academy/frontend/blob/dcd34c1cb792b96123d9163d2e31c960bedf123d/src/features/envVisualizer/components/Grid.tsx#L109
          this.arrayLevels[Math.floor(y)].addArray(v, x);
        } else if (v.referencedBy[0] instanceof ArrayUnit) {
          const y = v.referencedBy[0].parent.level?.parentLevel?.yCoord ?? 0;
          const x =
            v.referencedBy[0].x() +
            (v.referencedBy[0] instanceof ArrayUnit && v.referencedBy[0].isLastUnit
              ? Config.DataUnitWidth + Config.DataUnitPaddingX
              : 0);
          this.arrayLevels[Math.floor(y)].addArray(v, x);
        }
      }
    });
    // Put the array levels and frame levels at same vertical position.
    // Requires all array's x-position to be at the right of all frames and its fn values.
    Grid.cumHeights = this.levels.reduce(
      (res, b, i) => {
        let height;
        if (i % 2 === 0) {
          const arrayLevel = this.arrayLevels[Math.floor(i / 2)] as ArrayLevel;
          height =
            Frame.cumWidths[(b as FrameLevel).lastXcoord + 1] <= arrayLevel.minX()
              ? 0
              : Frame.heights[Math.floor(i / 2)] +
                (Frame.heights[Math.floor(i / 2)] > 0
                  ? Config.FrameMarginY / 2
                  : Config.FrameMarginY / 2);
        } else {
          const frameLevel = this.frameLevels[Math.floor(i / 2)] as FrameLevel;
          height =
            Frame.heights[Math.floor(i / 2)] +
            (Frame.heights[Math.floor(i / 2)] > 0 ? Config.FrameMarginY : 0);
          if ((b as ArrayLevel).count() > 0) {
            if (Frame.cumWidths[frameLevel.lastXcoord + 1] <= (b as ArrayLevel).minX()) {
              height = Math.max(
                height,
                this.arrayLevels[Math.floor((i - 1) / 2)].height() +
                  (this.arrayLevels[Math.floor((i - 1) / 2)].height() > 0
                    ? Config.FrameMarginY
                    : Config.FrameMarginY / 2)
              );
            } else {
              height = this.arrayLevels[Math.floor((i - 1) / 2)].height() + Config.FrameMarginY;
            }
          }
        }
        return [...res, res[res.length - 1] + height];
      },
      [Config.CanvasPaddingY.valueOf()]
    );
    this.levels.forEach((level, i) => {
      level.setY(Grid.cumHeights[i]);
    });

    // get the cumulative height of all the array and frame levels
    this._height = Grid.cumHeights[Grid.cumHeights.length - 1];
    // get the maximum width of all the array and frame levels
    this._width =
      Math.max(
        this.frameLevels.reduce<number>((a, b) => Math.max(a, b.width()), 0),
        this.arrayLevels.reduce<number>((a, b) => Math.max(a, b.width()), 0)
      ) + Config.FrameMarginX;
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
