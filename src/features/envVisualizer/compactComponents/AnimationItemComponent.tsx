import { Easings } from 'konva/lib/Tween';
import React, { RefObject } from 'react';
import { Group, Label, Tag, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import { AgendaStashConfig, ShapeDefaultProps } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import {
  currentItemSAColor,
  truncateText
} from '../EnvVisualizerUtils';

export class AnimationItemComponent extends Visible {
  /** text to display */
  readonly text: string;
  readonly shapeRef: RefObject<any>;
  readonly textRef: RefObject<any>;

  constructor(
    readonly value: any,
    /** text to display on hover */
    /** The height of the stack so far */
    origin: Visible
  ) {
    super();
    this.text = truncateText(
      String(value),
      AgendaStashConfig.AgendaMaxTextWidth,
      AgendaStashConfig.AgendaMaxTextHeight
    );
    this.shapeRef = React.createRef();
    this.textRef = React.createRef();
    this._x = origin.x();
    this._y = origin.y();
    this._width = origin.width();
    this._height = origin.height();
  }

  destroy() {
    this.ref.current?.destroyChildren();
  }

  draw(): React.ReactNode {
    const textProps = {
      fill: AgendaStashConfig.SA_WHITE.toString(),
      padding: Number(AgendaStashConfig.AgendaItemTextPadding),
      fontFamily: AgendaStashConfig.FontFamily.toString(),
      fontSize: Number(AgendaStashConfig.FontSize),
      fontStyle: AgendaStashConfig.FontStyle.toString(),
      fontVariant: AgendaStashConfig.FontVariant.toString()
    };
    const tagProps = {
      stroke: currentItemSAColor(false),
      cornerRadius: Number(AgendaStashConfig.AgendaItemCornerRadius)
    };
    return (
      <Group key={Layout.key++} ref={this.ref}>
        <Label
          ref={this.shapeRef}
          x={this.x()}
          y={this.y()}
        >
          <Tag {...ShapeDefaultProps} {...tagProps} />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            ref={this.textRef}
            text={this.text}
            width={this.width()}
            height={this.height()}
          />
        </Label>
      </Group>
    );
  }

  animate() {
    // Fixed to the last stash component for now. TODO: have a more flexible way to specify targets.
    const target = Layout.stashComponent.stashItemComponents.at(-1);
    if (!target) {
      this.destroy();
      return;
    }
    target.ref.current?.hide();
    this.shapeRef.current.to({
      x: target.x(),
      y: target.y(),
      easing: Easings.StrongEaseInOut,
      duration: 0.3,
      onFinish: () => {
        target.ref.current?.show();
        this.destroy();
      },
    });
    this.textRef.current.to({
      width: target.width(),
      easing: Easings.StrongEaseInOut,
      duration: 0.3
    });
  }
}
