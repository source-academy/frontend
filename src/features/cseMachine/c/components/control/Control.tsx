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

      // TODO reference draw ltr?
      // const controlItemReference =
      //   control.isInstruction(controlItem) && controlItem.type === ECE.InstrType.ENV
      //     ? CseMachine.environment?.frames.find(f => f.frame === (controlItem as ECE.EnvInstr).env)
      //     : undefined;

      const controlItemTooltip = this.getControlItemTooltip(controlItem);
      this.getControlItemTooltip(controlItem);

      const node = !control.isInstruction(controlItem) ? controlItem : controlItem;
      const highlightOnHover = () => {
        let start = -1;
        let end = -1;
        console.log('HERE BRO: ', controlItem);
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
        // controlItemReference,
        controlItemTooltip,
        highlightOnHover,
        unhighlightOnHover
      );

      this._controlItems.push(currControlItem);
      console.log('SIZE HERE MF: ', this._controlItems, this._controlItems.length);
      controlItemY += currControlItem.height();
    });

    // Height and width.
    this._height = controlItemY - this._y;
    // TODO cal real width?
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
    // if (ECE.isNode(controlItem)) {
    //   return astToString(controlItem);
    // }

    switch (controlItem.type) {
      // case ECE.InstrType.RESET:
      //   return 'Skip control items until marker instruction is reached';
      // case ECE.InstrType.ASSIGNMENT:
      //   return 'Assign value on top of stash to location on top of stash';
      // case "BinaryExpression":
      //   const binOpInstr = controlItem.operator;
      //   return `Perform ${binOpInstr} on top 2 stash values`;
      // case "":
      //   return 'Pop most recently pushed value from stash';
      // case ECE.InstrType.INVOCATION:
      //   const appInstr = controlItem as ECE.InvInstr;
      //   return `Invoke method with ${appInstr.arity} argument${appInstr.arity === 1 ? '' : 's'}`;
      // case ECE.InstrType.ENV:
      //   return 'Set current environment to this environment';
      // case ECE.InstrType.MARKER:
      //   return 'Mark return address';
      // case ECE.InstrType.EVAL_VAR:
      //   const evalVarInstr = controlItem as ECE.EvalVarInstr;
      //   return `name ${evalVarInstr.symbol}`;
      // case ECE.InstrType.NEW:
      //   const newInstr = controlItem as ECE.NewInstr;
      //   return `Create new instance of class ${newInstr.c.frame.name}`;
      // case ECE.InstrType.RES_TYPE:
      //   const resTypeInstr = controlItem as ECE.ResTypeInstr;
      //   return `Resolve type of ${
      //     resTypeInstr.value.kind === 'Class'
      //       ? resTypeInstr.value.frame.name
      //       : astToString(resTypeInstr.value)
      //   }`;
      // case ECE.InstrType.RES_TYPE_CONT:
      //   const resTypeContInstr = controlItem as ECE.ResTypeContInstr;
      //   return `Resolve type of ${resTypeContInstr.name} in most recently pushed type from stash`;
      // case ECE.InstrType.RES_OVERLOAD:
      //   const resOverloadInstr = controlItem as ECE.ResOverloadInstr;
      //   return `Resolve overloading of method ${resOverloadInstr.name} with ${
      //     resOverloadInstr.arity
      //   } argument${resOverloadInstr.arity === 1 ? '' : 's'}`;
      // case ECE.InstrType.RES_OVERRIDE:
      //   return 'Resolve overriding of resolved method on top of stash';
      // case ECE.InstrType.RES_CON_OVERLOAD:
      //   const resConOverloadInstr = controlItem as ECE.ResConOverloadInstr;
      //   return `Resolve constructor overloading of class on stash with ${
      //     resConOverloadInstr.arity
      //   } argument${resConOverloadInstr.arity === 1 ? '' : 's'}`;
      // case ECE.InstrType.RES:
      //   const resInstr = controlItem as ECE.ResInstr;
      //   return `Resolve field ${resInstr.name} of most recently pushed value from stash`;
      // case ECE.InstrType.DEREF:
      //   return 'Dereference most recently pushed value from stash';
      default:
        return 'INSTRUCTION';
    }
  };
}
