import { ECE } from 'java-slang';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Layer, Rect, Stage } from 'react-konva';

import { defaultBackgroundColor } from '../CseMachineUtils';
import { Config, ShapeDefaultProps } from './../CseMachineConfig';
import { Control } from './components/Control';
import { Environment } from './components/Environment';
import { Stash } from './components/Stash';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;

export class CseMachine {
  /** the unique key assigned to each node */
  static key: number = 0;

  /** callback function to update the visualization state in the SideContentCseMachine component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  public static setEditorHighlightedLines: SetEditorHighlightedLines;

  public static stageRef: RefObject<any> = React.createRef();
  /** scale factor for zooming and out of canvas */
  public static scaleFactor = 1.02;

  static environment: Environment | undefined;
  static control: Control | undefined;
  static stash: Stash | undefined;

  static init(setVis: SetVis, setEditorHighlightedLines: (segments: [number, number][]) => void) {
    this.setVis = setVis;
    this.setEditorHighlightedLines = setEditorHighlightedLines;
  }

  /** updates the visualization state in the SideContentCseMachine component based on
   * the Java Slang context passed in */
  static drawCse(context: ECE.Context) {
    if (!this.setVis || !context.environment || !context.control || !context.stash) {
      throw new Error('Java CSE Machine not initialized');
    }

    CseMachine.environment = new Environment(context.environment);
    CseMachine.control = new Control(context.control);
    CseMachine.stash = new Stash(context.stash);

    this.setVis(this.draw());

    // Set icon to blink.
    const icon = document.getElementById('env_visualizer-icon');
    icon?.classList.add('side-content-tab-alert');
  }

  static clearCse() {
    if (this.setVis) {
      this.setVis(undefined);
      CseMachine.environment = undefined;
      CseMachine.control = undefined;
      CseMachine.stash = undefined;
    }
  }

  /**
   * Updates the scale of the stage after the user inititates a zoom in or out
   * by scrolling or by the trackpad.
   */
  static zoomStage(event: KonvaEventObject<WheelEvent> | boolean, multiplier: number = 1) {
    if (typeof event != 'boolean') {
      event.evt.preventDefault();
    }
    if (CseMachine.stageRef.current) {
      const stage = CseMachine.stageRef.current;
      const oldScale = stage.scaleX();
      const { x: pointerX, y: pointerY } = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale
      };

      // zoom in or zoom out
      const direction =
        typeof event != 'boolean' ? (event.evt.deltaY > 0 ? -1 : 1) : event ? 1 : -1;

      // Check if the zoom limits have been reached
      if ((direction > 0 && oldScale < 3) || (direction < 0 && oldScale > 0.4)) {
        const newScale =
          direction > 0
            ? oldScale * CseMachine.scaleFactor ** multiplier
            : oldScale / CseMachine.scaleFactor ** multiplier;
        stage.scale({ x: newScale, y: newScale });
        if (typeof event !== 'boolean') {
          const newPos = {
            x: pointerX - mousePointTo.x * newScale,
            y: pointerY - mousePointTo.y * newScale
          };
          stage.position(newPos);
          stage.batchDraw();
        }
      }
    }
  }

  static draw(): React.ReactNode {
    const layout = (
      <div className={'sa-cse-machine'} data-testid="sa-cse-machine">
        <div
          id="scroll-container"
          style={{
            width: window.innerWidth - 50,
            height: window.innerHeight - 150,
            overflow: 'hidden'
          }}
        >
          <div
            id="large-container"
            style={{
              width: Config.CanvasMinWidth,
              height: Config.CanvasMinHeight,
              overflow: 'hidden',
              backgroundColor: defaultBackgroundColor()
            }}
          >
            <Stage
              width={+Config.CanvasMinWidth}
              height={+Config.CanvasMinHeight}
              ref={this.stageRef}
              draggable
              onWheel={CseMachine.zoomStage}
              className="draggable"
            >
              <Layer>
                <Rect
                  {...ShapeDefaultProps}
                  x={0}
                  y={0}
                  width={Config.CanvasMinWidth}
                  height={Config.CanvasMinHeight}
                  fill={defaultBackgroundColor()}
                  key={CseMachine.key++}
                  listening={false}
                />
                {this.control?.draw()}
                {this.stash?.draw()}
                {this.environment?.draw()}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    );

    return layout;
  }
}
