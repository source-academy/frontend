import React from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { EnvTreeNode, Visible } from '../EnvVisualizerTypes';
import { ArrayLevel } from './ArrayLevel';
import { ArrayUnit } from './ArrayUnit';
import { Binding } from './Binding';
import { Frame } from './Frame';
import { FrameLevel } from './FrameLevel';
import { Level } from './Level';
import { ArrayValue } from './values/ArrayValue';

/** this class encapsulates a grid of frames to be drawn */
export class Grid implements Visible {
  update(envTreeNodes: EnvTreeNode[][]) {
    Frame.reset();
    FrameLevel.reset();
    this.maxCoordinate = 0;
    this.frameLevels = [];
    this.arrayLevels = [];
    this.levels = [];
    const nodes: Array<[number, EnvTreeNode]> = envTreeNodes.reduce((result, nodes, i) => {
      if (i === 0) {
        this.frameLevels[i] = new FrameLevel(null);
      } else {
        this.arrayLevels[i - 1] = new ArrayLevel(this.frameLevels[i - 1]);
        this.levels.push(this.arrayLevels[i - 1]);
        this.frameLevels[i] = new FrameLevel(this.arrayLevels[i - 1]);
      }
      this.levels.push(this.frameLevels[i]);
      return [...result, ...nodes.map<[number, EnvTreeNode]>(node => [i, node])];
    }, new Array<[number, EnvTreeNode]>());

    nodes.sort((a, b) => parseInt(a[1].environment.id) - parseInt(b[1].environment.id));
    this.widths = [];
    this.heights = [];
    nodes.forEach(node => {
      this.frameLevels[node[0]].addFrame(node[1]);
    });

    Layout.values.forEach((v, d, m) => {
      const isArray = v instanceof ArrayValue;
      if (isArray) {
        let bindings = v.referencedBy.filter(r => r instanceof Binding) as Binding[];
        let p: ArrayUnit = v.referencedBy.find(x => x instanceof ArrayUnit) as ArrayUnit;
        const hasFrame = bindings.length > 0;
        while (bindings.length === 0) {
          bindings = p.parent.referencedBy.filter(r => r instanceof Binding) as Binding[];
          p = p.parent.referencedBy.find(x => x instanceof ArrayUnit) as ArrayUnit;
        }

        const [yCoordSum, xCoordSum, count] = bindings.reduce(
          (acc, binding) => {
            const [yCoordSum, xCoordSum, count] = acc;
            return [yCoordSum + binding.frame.yCoord, xCoordSum + binding.frame.xCoord, count + 1];
          },
          [0, 0, 0]
        );
        const meanY =
          ((yCoordSum / count) * (this.frameLevels.length - 1)) / this.frameLevels.length;
        const meanX = xCoordSum / count;
        debugger;
        this.arrayLevels[Math.floor(meanY)].addArray(
          v,
          hasFrame
            ? Frame.cumWidths[Math.floor(meanX)] * (meanX - Math.floor(meanX)) +
                Frame.cumWidths[Math.floor(meanX) + 1] * (Math.floor(meanX) + 1 - meanX)
            : Math.max(
                v.referencedBy.reduce((acc, ref) => acc + ref.x, 0) / v.referencedBy.length,
                v.referencedBy[0].x
              )
          // : v.referencedBy[0].x
        );
      }
    });

    const cumHeights = this.levels.reduce(
      (res, b, i) => {
        const height =
          i % 2 === 0
            ? Frame.heights[Math.floor(i / 2)]
            : this.arrayLevels[Math.floor((i - 1) / 2)].height;
        return [...res, res[res.length - 1] + height + Config.FrameMarginY];
      },
      [0]
    );
    debugger;
    this.levels.forEach((level, i) => {
      level.setY(cumHeights[i]);
    });

    // get the max height of all the frames in this level
    // this.height = Frame.heights.reduce((a, b) => a + b + Config.FrameMarginY);
    // const lastFrame = this.frames[this.frames.length - 1];
    this.height = cumHeights[cumHeights.length - 1];
    // derive the width of this level from the last frame
    // this.width = lastFrame.x + lastFrame.totalWidth - this.x + Config.LevelPaddingX;
    this.width = Math.max(
      this.frameLevels.reduce<number>((a, b) => Math.max(a, b.width), 0),
      this.arrayLevels.reduce<number>((a, b) => Math.max(a, b.width), 0)
    );
  }
  x: number;
  y: number;
  height: number;
  width: number;

  /** list of all levels */
  frameLevels: FrameLevel[];
  arrayLevels: ArrayLevel[];
  levels: Level[];
  maxCoordinate: number;
  widths: number[];
  heights: number[];
  frameArrows: any;

  constructor(
    /** the environment tree nodes */
    readonly envTreeNodes: EnvTreeNode[][]
  ) {
    Frame.reset();
    FrameLevel.reset();
    ArrayLevel.reset();
    this.x = Config.CanvasPaddingX;
    this.y = Config.CanvasPaddingY;
    this.maxCoordinate = 0;
    this.frameLevels = [];
    this.arrayLevels = [];
    this.levels = [];
    this.widths = [];
    this.heights = [];
    this.height = 0;
    // const lastFrame = this.frames[this.frames.length - 1];
    // derive the width of this level from the last frame
    // this.width = lastFrame.x + lastFrame.totalWidth - this.x + Config.LevelPaddingX;
    this.width = 0;
    this.update(envTreeNodes);
  }

  destroy = () => {
    this.frameLevels.forEach(l => l.ref.current.destroyChildren());
  };

  draw(): React.ReactNode {
    // const tmp = Layout.values.entries();
    // debugger;
    return (
      <Group key={Layout.key++}>
        <Rect
          {...ShapeDefaultProps}
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          key={Layout.key++}
          listening={false}
        />
        {this.arrayLevels.map(level => level.draw())}
        {this.frameLevels.map(level => level.draw())}
      </Group>
    );
  }
}
