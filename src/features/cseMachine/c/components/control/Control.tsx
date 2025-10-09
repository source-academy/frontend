import { Group } from 'react-konva';
import {
  Control as CControl,
  ControlItem as CControlItem,
  controlItemToString
} from 'src/ctowasm/dist';

import { Visible } from '../../../components/Visible';
import { defaultActiveColor, defaultStrokeColor } from '../../../CseMachineUtils';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { CseMachine } from '../../CseMachine';
import { ControlItem } from './ControlItem';

export class Control extends Visible {
  private readonly _controlItems: ControlItem[] = [];

  isEmpty(): boolean {
    return this._controlItems.length == 0;
  }

  constructor(control: CControl) {
    super();

    console.log('PASSED', control);

    // Position.
    this._x = CControlStashMemoryConfig.ControlPosX;
    this._y =
      CControlStashMemoryConfig.ControlPosY +
      CControlStashMemoryConfig.StashItemHeight +
      CControlStashMemoryConfig.StashItemTextPadding * 2;

    // Create each ControlItem.
    let controlItemY: number = this._y;
    control.getStack().forEach((controlItem: CControlItem, index: number) => {
      let controlItemText = '';

      controlItemText = controlItemToString(controlItem);

      const controlItemStroke =
        index === control.getStack().length - 1 ? defaultActiveColor() : defaultStrokeColor();

      const controlItemTooltip = this.getControlItemTooltip(controlItem);
      this.getControlItemTooltip(controlItem);

      const node = !control.isInstruction(controlItem) ? controlItem : controlItem;
      const highlightOnHover = () => {
        let start = -1;
        let end = -1;
        if (node.position) {
          start = node.position.start.line - 1;
          end = node.position.end.line - 1;
        }
        CseMachine.setEditorHighlightedLines([[start, end]]);
      };
      const unhighlightOnHover = () => CseMachine.setEditorHighlightedLines([]);

      const currControlItem = new ControlItem(
        controlItemY,
        controlItemText,
        controlItemStroke,
        controlItemTooltip,
        highlightOnHover,
        unhighlightOnHover
      );

      this._controlItems.push(currControlItem);
      controlItemY += currControlItem.height();
    });

    this._height = controlItemY - this._y;
    this._width = CControlStashMemoryConfig.ControlItemWidth;
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++} ref={this.ref}>
        {this._controlItems.map(c => c.draw())}
      </Group>
    );
  }

  private getControlItemTooltip = (controlItem: CControlItem): string => {
    switch (controlItem.type) {
      default:
        return 'INSTRUCTION';
    }
  };
}
