import React from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { EnvTreeNode, Visible } from '../EnvVisualizerTypes';
import { Frame } from './Frame';
import { Level } from './Level';

/** this class encapsulates a grid of frames to be drawn */
export class Grid implements Visible {
  update(frontiers: EnvTreeNode[][]) {
    Frame.reset();
    Level.reset();
    this.maxCoordinate = 0;
    this.levels = [];
    const nodes: Array<[number, EnvTreeNode]> = frontiers.reduce((result, nodes, i) => {
      this.levels[i] = new Level(i === 0 ? null : this.levels[i - 1]);
      return [...result, ...nodes.map<[number, EnvTreeNode]>(node => [i, node])];
    }, new Array<[number, EnvTreeNode]>());

    nodes.sort((a, b) => parseInt(a[1].environment.id) - parseInt(b[1].environment.id));
    this.widths = [];
    this.heights = [];
    nodes.forEach(node => {
      this.levels[node[0]].addFrame(node[1]);
    });
    const cumHeights = Frame.heights.reduce(
      (res, b) => [...res, res[res.length - 1] + b + Config.FrameMarginY],
      [0]
    );
    this.levels.forEach((level, i) => {
      level.setY(cumHeights[i]);
    });

    // get the max height of all the frames in this level
    this.height = Frame.heights.reduce((a, b) => a + b + Config.FrameMarginY);
    this.width = this.levels.reduce<number>((a, b) => Math.max(a, b.width), 0);
  }
  x: number;
  y: number;
  height: number;
  width: number;

  /** list of all levels */
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
    Level.reset();
    this.x = Config.CanvasPaddingX;
    this.y = Config.CanvasPaddingY;
    this.maxCoordinate = 0;
    this.levels = [];
    const nodes: Array<[number, EnvTreeNode]> = envTreeNodes.reduce((result, nodes, i) => {
      this.levels[i] = new Level(i === 0 ? null : this.levels[i - 1]);
      return [...result, ...nodes.map<[number, EnvTreeNode]>(node => [i, node])];
    }, new Array<[number, EnvTreeNode]>());

    nodes.sort((a, b) => parseInt(a[1].environment.id) - parseInt(b[1].environment.id));
    this.widths = [];
    this.heights = [];
    nodes.forEach(node => {
      this.levels[node[0]].addFrame(node[1]);
    });
    const cumHeights = Frame.heights.reduce(
      (res, b) => [...res, res[res.length - 1] + b + Config.FrameMarginY],
      [0]
    );
    this.levels.forEach((level, i) => {
      level.setY(cumHeights[i]);
    });

    // get the max height of all the frames in this level
    this.height = Frame.heights.reduce((a, b) => a + b + Config.FrameMarginY);
    // const lastFrame = this.frames[this.frames.length - 1];
    // derive the width of this level from the last frame
    // this.width = lastFrame.x + lastFrame.totalWidth - this.x + Config.LevelPaddingX;
    this.width = this.levels.reduce<number>((a, b) => Math.max(a, b.width), 0);
  }

  destroy = () => {
    this.levels.forEach(l => l.ref.current.destroyChildren());
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
        {this.levels.map(level => level.draw())}
      </Group>
    );
  }
}
