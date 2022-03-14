import { Config } from '../EnvVisualizerConfig';
import { Data, Visible } from '../EnvVisualizerTypes';
import { Frame } from './Frame';
import { Grid } from './Grid';
import { Value } from './values/Value';

/** this class tracks the target objects for each lane. */
export class ArrowLane {
  private id: number;
  static verticalLanes: ArrowLane[] = [];
  static horizontalLanes: ArrowLane[] = [];
  static arrayLevelLanes: ArrowLane[] = [];
  public objects: (Data | Visible)[] = [];
  public frames: Frame[] = [];
  private isVertical: boolean = true;

  constructor(coord: number, isVertical: boolean) {
    this.id = coord;
    this.isVertical = isVertical;
  }

  static reset = () => {
    ArrowLane.verticalLanes = [];
    ArrowLane.horizontalLanes = [];
    ArrowLane.arrayLevelLanes = [];
  };

  static getVerticalLane = (target: Visible, currentX: number): ArrowLane => {
    const xCoord = Frame.lastXCoordBelow(currentX) + (currentX > target.x() ? 0 : 1);
    if (ArrowLane.verticalLanes[xCoord] === undefined) {
      ArrowLane.verticalLanes[xCoord] = new ArrowLane(xCoord, true);
    }
    return ArrowLane.verticalLanes[xCoord];
  };

  static getHorizontalLane = (target: Visible, currentY: number): ArrowLane => {
    const yCoord = Grid.lastYCoordBelow(currentY) + (currentY > target.y() ? 0 : 1);
    if (ArrowLane.horizontalLanes[yCoord] === undefined) {
      ArrowLane.horizontalLanes[yCoord] = new ArrowLane(yCoord, false);
    }
    return ArrowLane.horizontalLanes[yCoord];
  };

  getPosition = (target: Value | Visible): number => {
    // place frame arrows on bottom half of horizontal lanes
    if (target instanceof Frame) {
      let index = this.frames.indexOf(target);
      if (index === -1) {
        index = this.frames.push(target) - 1;
      }
      const lane: number = index % Config.ArrowNumLanes;
      return (
        Grid.cumHeights[this.id] -
        Config.FrameMarginY * 0.3 +
        (lane / Config.ArrowNumLanes) * Config.FrameMarginY * 0.3
      );
    } else {
      let index = this.objects.indexOf(target instanceof Value ? target.data : target);
      if (index === -1) {
        index = this.objects.push(target instanceof Value ? target.data : target) - 1;
      }
      const lane: number = index % Config.ArrowNumLanes;
      if (this.isVertical) {
        return (
          Frame.cumWidths[this.id] -
          Config.FrameMarginX * 0.8 +
          Config.FnRadius * 1.5 +
          ((lane + 0.5) / Config.ArrowNumLanes) * Config.FrameMarginX * 0.8
        );
      } else {
        return (
          Grid.cumHeights[this.id] -
          Config.FrameMarginY * 0.95 +
          ((lane + 0.5) / Config.ArrowNumLanes) * Config.FrameMarginY * 0.5
        );
      }
    }
  };
}
