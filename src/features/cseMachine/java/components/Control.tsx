import { astToString } from "java-slang/dist/ast/utils/astToString";
import { Control as JavaControl } from "java-slang/dist/ec-evaluator/components"; 
import {
  BinOpInstr,
  ControlItem as JavaControlItem,
  EnvInstr,
  EvalVarInstr,
  InstrType,
  InvInstr,
  NewInstr,
  ResConOverloadInstr,
  ResInstr,
  ResOverloadInstr,
  ResTypeContInstr,
  ResTypeInstr,
} from "java-slang/dist/ec-evaluator/types";
import { isInstr, isNode } from "java-slang/dist/ec-evaluator/utils";
import { Group } from "react-konva";

import { Visible } from "../../components/Visible";
import { Config } from "../../CseMachineConfig";
import { ControlStashConfig } from "../../CseMachineControlStashConfig";
import { CseMachine } from "../CseMachine";
import { ControlItem } from "./ControlItem";

export class Control extends Visible {
  private readonly _controlItems: ControlItem[] = [];

  constructor(control: JavaControl) {
    super();

    // Position.
    this._x = ControlStashConfig.ControlPosX;
    this._y = ControlStashConfig.ControlPosY + ControlStashConfig.StashItemHeight + ControlStashConfig.StashItemTextPadding * 2;

    // Create each ControlItem.
    let controlItemY: number = this._y;
    control.getStack().forEach((controlItem, index) => {
      const controlItemText = this.getControlItemString(controlItem);
      
      const controlItemStroke =
        index === control.getStack().length - 1 
        ? Config.SA_CURRENT_ITEM
        : ControlStashConfig.SA_WHITE;
      
      // TODO reference draw ltr?
      const controlItemReference =
        isInstr(controlItem) && controlItem.instrType === InstrType.ENV
        ? CseMachine.environment?.frames.find(f => f.frame === (controlItem as EnvInstr).env)
        : undefined;

      const controlItemTooltip = this.getControlItemTooltip(controlItem);
      this.getControlItemTooltip(controlItem);
      
      const node = isNode(controlItem) ? controlItem : controlItem.srcNode;
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
        unhighlightOnHover,
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

  private getControlItemString = (controlItem: JavaControlItem): string => {
    if (isNode(controlItem)) {
      return astToString(controlItem);
    }

    switch (controlItem.instrType) {
      case InstrType.RESET:
        return "return";
      case InstrType.ASSIGNMENT:
        return "asgn";
      case InstrType.BINARY_OP:
        const binOpInstr = controlItem as BinOpInstr;
        return binOpInstr.symbol;
      case InstrType.POP:
        return "pop";
      case InstrType.INVOCATION:
        const appInstr = controlItem as InvInstr;
        return `invoke ${appInstr.arity}`;
      case InstrType.ENV:
        return "env";
      case InstrType.MARKER:
        return "mark";
      case InstrType.EVAL_VAR:
        const evalVarInstr = controlItem as EvalVarInstr;
        return `name ${evalVarInstr.symbol}`;
      case InstrType.NEW:
        const newInstr = controlItem as NewInstr;
        return `new ${newInstr.c.frame.name}`;
      case InstrType.RES_TYPE:
        const resTypeInstr = controlItem as ResTypeInstr;
        return `res_type ${resTypeInstr.value.kind === "Class" 
          ? resTypeInstr.value.frame.name :
          astToString(resTypeInstr.value)}`;
      case InstrType.RES_TYPE_CONT:
        const resTypeContInstr = controlItem as ResTypeContInstr;
        return `res_type_cont ${resTypeContInstr.name}`;
      case InstrType.RES_OVERLOAD:
        const resOverloadInstr = controlItem as ResOverloadInstr;
        return `res_overload ${resOverloadInstr.name} ${resOverloadInstr.arity}`;
      case InstrType.RES_OVERRIDE:
        return `res_override`;
      case InstrType.RES_CON_OVERLOAD:
        const resConOverloadInstr = controlItem as ResConOverloadInstr;
        return `res_con_overload ${resConOverloadInstr.arity}`;
      case InstrType.RES:
        const resInstr = controlItem as ResInstr;
        return `res ${resInstr.name}`;
      case InstrType.DEREF:
        return "deref";
      default:
        return "INSTRUCTION";
    }
  }

  private getControlItemTooltip = (controlItem: JavaControlItem): string => {
    if (isNode(controlItem)) {
      return astToString(controlItem);
    }

    switch (controlItem.instrType) {
      case InstrType.RESET:
        return "Skip control items until marker instruction is reached";
      case InstrType.ASSIGNMENT:
        return "Assign value on top of stash to location on top of stash";
      case InstrType.BINARY_OP:
        const binOpInstr = controlItem as BinOpInstr;
        return `Perform ${binOpInstr.symbol} on top 2 stash values`;
      case InstrType.POP:
        return "Pop most recently pushed value from stash";
      case InstrType.INVOCATION:
        const appInstr = controlItem as InvInstr;
        return `Invoke method with ${appInstr.arity} argument${appInstr.arity === 1 ? '' : 's'}`;
      case InstrType.ENV:
        return "Set current environment to this environment";
      case InstrType.MARKER:
        return "Mark return address";
      case InstrType.EVAL_VAR:
        const evalVarInstr = controlItem as EvalVarInstr;
        return `name ${evalVarInstr.symbol}`;
      case InstrType.NEW:
        const newInstr = controlItem as NewInstr;
        return `Create new instance of class ${newInstr.c.frame.name}`;
      case InstrType.RES_TYPE:
        const resTypeInstr = controlItem as ResTypeInstr;
        return `Resolve type of ${resTypeInstr.value.kind === "Class" 
          ? resTypeInstr.value.frame.name :
          astToString(resTypeInstr.value)}`;
      case InstrType.RES_TYPE_CONT:
        const resTypeContInstr = controlItem as ResTypeContInstr;
        return `Resolve type of ${resTypeContInstr.name} in most recently pushed type from stash`;
      case InstrType.RES_OVERLOAD:
        const resOverloadInstr = controlItem as ResOverloadInstr;
        return `Resolve overloading of method ${resOverloadInstr.name} with ${resOverloadInstr.arity} argument${resOverloadInstr.arity === 1 ? '' : 's'}`;
      case InstrType.RES_OVERRIDE:
        return "Resolve overriding of resolved method on top of stash";
      case InstrType.RES_CON_OVERLOAD:
        const resConOverloadInstr = controlItem as ResConOverloadInstr;
        return `Resolve constructor overloading of class on stash with ${resConOverloadInstr.arity} argument${resConOverloadInstr.arity === 1 ? '' : 's'}`;
      case InstrType.RES:
        const resInstr = controlItem as ResInstr;
        return `Resolve field ${resInstr.name} of most recently pushed value from stash`;
      case InstrType.DEREF:
        return "Dereference most recently pushed value from stash";
      default:
        return "INSTRUCTION";
    }
  }
}
