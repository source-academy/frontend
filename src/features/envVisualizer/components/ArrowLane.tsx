import { Config } from '../EnvVisualizerConfig';
import { Data, IVisible } from '../EnvVisualizerTypes';
import { Frame } from './Frame';
import { Grid } from './Grid';
import { Value } from './values/Value';

/** this class tracks the target objects for each lane. */
export class ArrowLane {
  readonly id: number;
  static verticalLanes: ArrowLane[] = [];
  static horizontalLanes: ArrowLane[] = [];
  static arrayLevelLanes: ArrowLane[] = [];
  public objects: (Data | IVisible)[] = [];
  public frames: Frame[] = [];
  readonly isVertical: boolean = true;

  constructor(coord: number, isVertical: boolean) {
    this.id = coord;
    this.isVertical = isVertical;
  }

  static reset = () => {
    ArrowLane.verticalLanes = [];
    ArrowLane.horizontalLanes = [];
    ArrowLane.arrayLevelLanes = [];
  };

  static getVerticalLaneBeforeTarget = (target: IVisible, currentX: number): ArrowLane => {
    // get the lane between currentX and target right before the target
    let xCoord = Frame.lastXCoordBelow(target.x()) + (currentX > target.x() ? 0 : 1);
    const x = Frame.cumWidths[xCoord];
    if (target.x() > x && currentX > x) {
      xCoord++;
    }
    if (ArrowLane.verticalLanes[xCoord] === undefined) {
      ArrowLane.verticalLanes[xCoord] = new ArrowLane(xCoord, true);
    }
    return ArrowLane.verticalLanes[xCoord];
  };

  static getVerticalLaneAfterSource = (target: IVisible, currentX: number): ArrowLane => {
    // get the lane between currentX and target right after currentX
    let xCoord = Frame.lastXCoordBelow(currentX) + (currentX > target.x() ? 0 : 1);
    const x = Frame.cumWidths[xCoord];
    if (target.x() > x && currentX > x) {
      xCoord++;
    }
    if (ArrowLane.verticalLanes[xCoord] === undefined) {
      ArrowLane.verticalLanes[xCoord] = new ArrowLane(xCoord, true);
    }
    return ArrowLane.verticalLanes[xCoord];
  };

  static getHorizontalLaneBeforeTarget = (target: IVisible, currentY: number): ArrowLane => {
    // get the horizontal lane between currentY and target right before target
    const yCoord = Grid.lastYCoordBelow(target.y()) + (currentY > target.y() ? 1 : 0);
    if (ArrowLane.horizontalLanes[yCoord] === undefined) {
      ArrowLane.horizontalLanes[yCoord] = new ArrowLane(yCoord, false);
    }
    return ArrowLane.horizontalLanes[yCoord];
  };

  static getHorizontalLaneAfterSource = (target: IVisible, currentY: number): ArrowLane => {
    // get the horizontal lane between currentY and target right after currentY
    const yCoord = Grid.lastYCoordBelow(currentY) + (currentY > target.y() ? 0 : 1);
    if (ArrowLane.horizontalLanes[yCoord] === undefined) {
      ArrowLane.horizontalLanes[yCoord] = new ArrowLane(yCoord, false);
    }
    return ArrowLane.horizontalLanes[yCoord];
  };

  getPosition = (target: Value | IVisible): number => {
    // place frame arrows on bottom half of horizontal lanes
    if (target instanceof Frame) {
      let index = this.frames.indexOf(target);
      if (index === -1) {
        index = this.frames.push(target) - 1;
      }
      const lane: number = (index * 2) % Config.ArrowNumLanes;
      return (
        Grid.cumHeights[this.id] -
        Config.FrameMarginY * 0.4 +
        (lane / Config.ArrowNumLanes) * Config.FrameMarginY * 0.4
      );
    } else {
      let index = this.objects.indexOf(target instanceof Value ? target.data : target);
      if (index === -1) {
        index = this.objects.push(target instanceof Value ? target.data : target) - 1;
      }
      const lane: number = (index * 2) % Config.ArrowNumLanes;
      if (this.isVertical) {
        return (
          Frame.cumWidths[this.id] -
          Config.FrameMarginX * 0.9 +
          Config.FnRadius +
          (lane / (Config.ArrowNumLanes + 1)) * Config.FrameMarginX * 0.8
        );
      } else {
        return (
          Grid.cumHeights[this.id] -
          Config.FrameMarginY * 0.6 +
          (lane / (Config.ArrowNumLanes + 1)) * Config.FrameMarginY * 0.4
        );
      }
    }
  };
}
