import { astToString, ECE } from 'java-slang';
import { Group } from 'react-konva';

import { Visible } from '../../components/Visible';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { defaultActiveColor, defaultStrokeColor } from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';
import { ControlItem } from './ControlItem';

export class Control extends Visible {
  private readonly _controlItems: ControlItem[] = [];

  constructor(control: ECE.Control) {
    super();

    // Position.
    this._x = ControlStashConfig.ControlPosX;
    this._y =
      ControlStashConfig.ControlPosY +
      ControlStashConfig.StashItemHeight +
      ControlStashConfig.StashItemTextPadding * 2;

    // Create each ControlItem.
    let controlItemY: number = this._y;
    control.getStack().forEach((controlItem, index) => {
      const controlItemText = this.getControlItemString(controlItem);

      const controlItemStroke =
        index === control.getStack().length - 1 ? defaultActiveColor() : defaultStrokeColor();

      // TODO reference draw ltr?
      const controlItemReference =
        ECE.isInstr(controlItem) && controlItem.instrType === ECE.InstrType.ENV
          ? CseMachine.environment?.frames.find(f => f.frame === (controlItem as ECE.EnvInstr).env)
          : undefined;

      const controlItemTooltip = this.getControlItemTooltip(controlItem);
      this.getControlItemTooltip(controlItem);

      const node = ECE.isNode(controlItem) ? controlItem : controlItem.srcNode;
      const highlightOnHover = () => {
        let start = -1;
        let end = -1;
        if (node.location) {
          start = node.location.startLine - 1;
          end = node.location.endLine ? node.location.endLine - 1 : start;
        }
        CseMachine.setEditorHighlightedLines([[start, end]]);
      };
      const unhighlightOnHover = () => CseMachine.setEditorHighlightedLines([]);

      const currControlItem = new ControlItem(
        controlItemY,
        controlItemText,
        controlItemStroke,
        controlItemReference,
        controlItemTooltip,
        highlightOnHover,
        unhighlightOnHover
      );

      this._controlItems.push(currControlItem);
      controlItemY += currControlItem.height();
    });

    // Height and width.
    this._height = controlItemY - this._y;
    // TODO cal real width?
    this._width = ControlStashConfig.ControlItemWidth;
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++} ref={this.ref}>
        {this._controlItems.map(c => c.draw())}
      </Group>
    );
  }

  private getControlItemString = (controlItem: ECE.ControlItem): string => {
    if (ECE.isNode(controlItem)) {
      return astToString(controlItem);
    }

    switch (controlItem.instrType) {
      case ECE.InstrType.RESET:
        return 'return';
      case ECE.InstrType.ASSIGNMENT:
        return 'asgn';
      case ECE.InstrType.BINARY_OP:
        const binOpInstr = controlItem as ECE.BinOpInstr;
        return binOpInstr.symbol;
      case ECE.InstrType.POP:
        return 'pop';
      case ECE.InstrType.INVOCATION:
        const appInstr = controlItem as ECE.InvInstr;
        return `invoke ${appInstr.arity}`;
      case ECE.InstrType.ENV:
        return 'env';
      case ECE.InstrType.MARKER:
        return 'mark';
      case ECE.InstrType.EVAL_VAR:
        const evalVarInstr = controlItem as ECE.EvalVarInstr;
        return `name ${evalVarInstr.symbol}`;
      case ECE.InstrType.NEW:
        const newInstr = controlItem as ECE.NewInstr;
        return `new ${newInstr.c.frame.name}`;
      case ECE.InstrType.RES_TYPE:
        const resTypeInstr = controlItem as ECE.ResTypeInstr;
        return `res_type ${
          resTypeInstr.value.kind === 'Class'
            ? resTypeInstr.value.frame.name
            : astToString(resTypeInstr.value)
        }`;
      case ECE.InstrType.RES_TYPE_CONT:
        const resTypeContInstr = controlItem as ECE.ResTypeContInstr;
        return `res_type_cont ${resTypeContInstr.name}`;
      case ECE.InstrType.RES_OVERLOAD:
        const resOverloadInstr = controlItem as ECE.ResOverloadInstr;
        return `res_overload ${resOverloadInstr.name} ${resOverloadInstr.arity}`;
      case ECE.InstrType.RES_OVERRIDE:
        return `res_override`;
      case ECE.InstrType.RES_CON_OVERLOAD:
        const resConOverloadInstr = controlItem as ECE.ResConOverloadInstr;
        return `res_con_overload ${resConOverloadInstr.arity}`;
      case ECE.InstrType.RES:
        const resInstr = controlItem as ECE.ResInstr;
        return `res ${resInstr.name}`;
      case ECE.InstrType.DEREF:
        return 'deref';
      default:
        return 'INSTRUCTION';
    }
  };

  private getControlItemTooltip = (controlItem: ECE.ControlItem): string => {
    if (ECE.isNode(controlItem)) {
      return astToString(controlItem);
    }

    switch (controlItem.instrType) {
      case ECE.InstrType.RESET:
        return 'Skip control items until marker instruction is reached';
      case ECE.InstrType.ASSIGNMENT:
        return 'Assign value on top of stash to location on top of stash';
      case ECE.InstrType.BINARY_OP:
        const binOpInstr = controlItem as ECE.BinOpInstr;
        return `Perform ${binOpInstr.symbol} on top 2 stash values`;
      case ECE.InstrType.POP:
        return 'Pop most recently pushed value from stash';
      case ECE.InstrType.INVOCATION:
        const appInstr = controlItem as ECE.InvInstr;
        return `Invoke method with ${appInstr.arity} argument${appInstr.arity === 1 ? '' : 's'}`;
      case ECE.InstrType.ENV:
        return 'Set current environment to this environment';
      case ECE.InstrType.MARKER:
        return 'Mark return address';
      case ECE.InstrType.EVAL_VAR:
        const evalVarInstr = controlItem as ECE.EvalVarInstr;
        return `name ${evalVarInstr.symbol}`;
      case ECE.InstrType.NEW:
        const newInstr = controlItem as ECE.NewInstr;
        return `Create new instance of class ${newInstr.c.frame.name}`;
      case ECE.InstrType.RES_TYPE:
        const resTypeInstr = controlItem as ECE.ResTypeInstr;
        return `Resolve type of ${
          resTypeInstr.value.kind === 'Class'
            ? resTypeInstr.value.frame.name
            : astToString(resTypeInstr.value)
        }`;
      case ECE.InstrType.RES_TYPE_CONT:
        const resTypeContInstr = controlItem as ECE.ResTypeContInstr;
        return `Resolve type of ${resTypeContInstr.name} in most recently pushed type from stash`;
      case ECE.InstrType.RES_OVERLOAD:
        const resOverloadInstr = controlItem as ECE.ResOverloadInstr;
        return `Resolve overloading of method ${resOverloadInstr.name} with ${
          resOverloadInstr.arity
        } argument${resOverloadInstr.arity === 1 ? '' : 's'}`;
      case ECE.InstrType.RES_OVERRIDE:
        return 'Resolve overriding of resolved method on top of stash';
      case ECE.InstrType.RES_CON_OVERLOAD:
        const resConOverloadInstr = controlItem as ECE.ResConOverloadInstr;
        return `Resolve constructor overloading of class on stash with ${
          resConOverloadInstr.arity
        } argument${resConOverloadInstr.arity === 1 ? '' : 's'}`;
      case ECE.InstrType.RES:
        const resInstr = controlItem as ECE.ResInstr;
        return `Resolve field ${resInstr.name} of most recently pushed value from stash`;
      case ECE.InstrType.DEREF:
        return 'Dereference most recently pushed value from stash';
      default:
        return 'INSTRUCTION';
    }
  };
}
