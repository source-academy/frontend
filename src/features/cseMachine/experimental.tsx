import { Factory } from 'konva/lib/Factory';
import { _registerNode } from 'konva/lib/Global';
import { Group, GroupConfig } from 'konva/lib/Group';
import { KonvaEventObject, Node } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { GetSet } from 'konva/lib/types';
import { getNumberValidator } from 'konva/lib/Validators';
import React from 'react';
import { KonvaNodeComponent } from 'react-konva';

// Custom Konva Component: Column
// - Subtype of Konva.Group, but functions quite differently
// - Can be used within React Konva JSX Element trees
// Example usage:
//    <Column gap={8} x={50} y={50}>
//      <Rect ... />
//      <Text ... />
//    </Column>
//
// - Note that the x and y values of column items are completely ignored, and instead controlled
//   by the column itself
// - Any changes in the heights of the column items will automatically propogate to the entire column,
//   and animations are also supported

type RemoveIndex<T> = { [K in keyof T as string extends K ? never : K]: T[K] };

export interface ColumnConfig extends Omit<RemoveIndex<GroupConfig>, 'height' | 'width'> {
  gap?: number;
  children: React.ReactElement[];
}

// Internal setter override for column items. Simply does nothing when the setter is called
// Could add error messages in the future
function setterOverride(this: Node) {
  return this;
}

class CustomColumn<T extends Group | Shape> extends Group {
  constructor(config?: ColumnConfig) {
    super(config);
    this.on('xChange', (event: KonvaEventObject<void>) => {
      const e = event as KonvaEventObject<void> & { newVal: number; oldVal: number };
      for (const child of this.getChildren()) {
        child._setAttr('x', e.newVal);
      }
    });
    this.on('yChange', (event: KonvaEventObject<void>) => {
      const e = event as KonvaEventObject<void> & { newVal: number; oldVal: number };
      const delta = e.newVal - (e.oldVal ?? 0);
      for (const child of this.getChildren()) {
        child._setAttr('y', child.y() + delta);
      }
    });
  }

  add(...children: T[]) {
    if (children.length > 1) {
      for (const child of children) {
        this.add(child);
      }
      return this;
    }
    const child = children[0];
    const x = this.x();
    const y = this.y() + this.height();
    const gap = this.gap();
    child.setPosition({ x, y });
    // Prevent x and y values for any child to be set directly
    // Any change in x and y should be from changes in height of other children
    child['setX'] = setterOverride.bind(child);
    child['setY'] = setterOverride.bind(child);
    super.add(child);
    child.on('heightChange', (event: KonvaEventObject<void>) => {
      const e = event as KonvaEventObject<void> & { newVal: number; oldVal: number };
      const children = this.getChildren();
      const delta = e.newVal - e.oldVal;
      for (let i = children.indexOf(child) + 1; i < children.length; i++) {
        children[i]._setAttr('y', children[i].y() + delta);
      }
    });
    child.on('widthChange', (event: KonvaEventObject<void>) => {
      const e = event as KonvaEventObject<void> & { newVal: number; oldVal: number };
      if (e.newVal > this.width()) this._setAttr('width', Math.max(this.width(), e.newVal));
    });
    this._setAttr('height', this.height() + gap + child.height());
    if (child.width() > this.width()) this._setAttr('width', child.width());
    return this;
  }

  destroy() {
    for (const child of this.getChildren()) {
      child.off('heightChange widthChange');
    }
    this.off('xChange yChange');
    return super.destroy();
  }
}

interface CustomColumn<T extends Group | Shape> extends Group {
  gap: GetSet<number, this>;
  add: (...children: T[]) => this; // This is just here prevent the warning where type T is unused
}

// Add the new gap getter/setter to the CustomColumn
Factory.addGetterSetter(CustomColumn, 'gap', 0, getNumberValidator());

// Ignores the new value by just returning the old value everytime this setter is called
function setterValidatorOverride(this: Node, _: any, attr: string) {
  return this.getAttr(attr);
}

// Ensure that setting width/height on the CustomColumn does nothing
// Could add error messages in the future
Factory.overWriteSetter(CustomColumn, 'width', setterValidatorOverride);
Factory.overWriteSetter(CustomColumn, 'height', setterValidatorOverride);

// Register the Column for use in React render trees
CustomColumn.prototype.className = 'Column';
_registerNode(CustomColumn);
export const Column: KonvaNodeComponent<CustomColumn<Group | Shape>, ColumnConfig> | string =
  'Column';
