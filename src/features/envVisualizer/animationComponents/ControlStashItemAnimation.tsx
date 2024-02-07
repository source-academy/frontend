import React from 'react';
import { Group } from 'react-konva';

import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';
import { ControlStashConfig } from '../EnvVisualizerControlStash';
import { Layout } from '../EnvVisualizerLayout';
import { currentItemSAColor, truncateText } from '../EnvVisualizerUtils';
import { Animatable, AnimatedRectComponent, AnimatedTextComponent } from './AnimationComponents';

export class ControlStashItemAnimation extends Animatable {
  readonly textComponent: AnimatedTextComponent;
  readonly rectComponent: AnimatedRectComponent;

  constructor(
    initialItem: ControlItemComponent | StashItemComponent,
    private targetItem: ControlItemComponent | StashItemComponent
  ) {
    super();
    const from = ControlStashItemAnimation.getNodeValuesFromItem(initialItem);
    const to = ControlStashItemAnimation.getNodeValuesFromItem(targetItem);
    const text = truncateText(
      String(initialItem.text),
      ControlStashConfig.ControlMaxTextWidth,
      ControlStashConfig.ControlMaxTextHeight
    );
    const textProps = {
      text,
      fill: ControlStashConfig.SA_WHITE.toString(),
      padding: Number(ControlStashConfig.ControlItemTextPadding),
      fontFamily: ControlStashConfig.FontFamily.toString(),
      fontSize: Number(ControlStashConfig.FontSize),
      fontStyle: ControlStashConfig.FontStyle.toString(),
      fontVariant: ControlStashConfig.FontVariant.toString()
    };
    const rectProps = {
      stroke: currentItemSAColor(false),
      cornerRadius: Number(ControlStashConfig.ControlItemCornerRadius)
    };
    this.textComponent = new AnimatedTextComponent(from, to, textProps);
    this.rectComponent = new AnimatedRectComponent(from, to, rectProps);
  }

  private static getNodeValuesFromItem(item: ControlItemComponent | StashItemComponent) {
    return {
      x: item.x(),
      y: item.y(),
      height: item.height(),
      width: item.width()
    };
  }

  draw(): React.ReactNode {
    Animatable.key++;
    return (
      <Group key={Layout.key + Animatable.key} ref={this.ref}>
        {this.rectComponent.draw()}
        {this.textComponent.draw()}
      </Group>
    );
  }

  async animate() {
    this.targetItem.ref.current.hide();
    await Promise.all([this.rectComponent.animate(), this.textComponent.animate()]);
    this.ref.current?.hide();
    this.targetItem.ref.current?.show();
  }

  destroy() {
    this.rectComponent.destroy();
    this.textComponent.destroy();
  }
}
