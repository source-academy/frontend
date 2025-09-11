import { Group } from 'react-konva';
import {
  Control as CControl,
  ControlItem as CControlItem,
  controlItemToString,
} from 'src/ctowasm/dist';

import { Visible } from '../../components/Visible';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { defaultActiveColor, defaultStrokeColor } from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';
import { ControlItem } from './ControlItem';

export class Control extends Visible {
  private readonly _controlItems: ControlItem[] = [];

  isEmpty(): boolean {
    return this._controlItems.length == 0;
  }

  constructor(control: CControl) {
    super();

    // Position.
    this._x = ControlStashConfig.ControlPosX;
    this._y =
      ControlStashConfig.ControlPosY +
      ControlStashConfig.StashItemHeight +
      ControlStashConfig.StashItemTextPadding * 2;

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
        console.log("HERE BRO: ", controlItem)
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
    this._width = ControlStashConfig.ControlItemWidth;
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++} ref={this.ref}>
        {this._controlItems.map(c => c.draw())}
      </Group>
    );
  }

  // private getControlItemString(controlItem: CControlItem): String {
  //   const res = controlItem.type;
  //   const extractedCode = controlItemToString(controlItem).trim();

  //   if(controlItem.type == CInstructionType.BINARY_OP) {
  //     return controlItem.operator;
  //   } else if(controlItem.type === CInstructionType.BRANCH) {
  //     return "Branch";
  //   } else if(controlItem.type === CInstructionType.BREAK_MARK) {
  //     return "Break Mark";
  //   } else if(controlItem.type === CInstructionType.CALLINSTRUCTION) {
  //     return "Call instruction: " + extractedCode;
  //   } else if(controlItem.type === CInstructionType.CASE_JUMP) {
  //     return "Case Jump";
  //   } else if(controlItem.type === CInstructionType.CASE_MARK) {
  //     return "Case Mark";
  //   } else if(controlItem.type === CInstructionType.CONTINUE_MARK) {
  //     return "Continue Mark";
  //   }

  //   // if (controlItem.type === CInstructionType.BINARY_OP) {
  //   //   return controlItem.operator;
  //   // } else if (controlItem.type === CInstructionType.BRANCH) {
  //   //   return 'Branch Instruction';
  //   // } else if (controlItem.type === CInstructionType.BREAK_MARK) {
  //   //   return 'Break Mark';
  //   // } else if (controlItem.type === CInstructionType.CALLINSTRUCTION) {
  //   //   return 'Call Instruction';
  //   // } else if (controlItem.type === CInstructionType.CASE_JUMP) {
  //   //   return 'Case Jump';
  //   // } else if (controlItem.type === CInstructionType.CASE_MARK) {
  //   //   return 'Case Mark';
  //   // } else if (controlItem.type === CInstructionType.CONTINUE_MARK) {
  //   //   return 'Continue Mark';
  //   // } else if (controlItem.type === CInstructionType.FORLOOP) {
  //   //   return 'For Loop: ' + extractedCode;
  //   // } else if (controlItem.type === CInstructionType.FUNCTIONINDEXWRAPPER) {
  //   //   return 'Function Index Wrapper';
  //   // } else if (controlItem.type === CInstructionType.MEMORY_LOAD) {
  //   //   return 'Memory Load: ' + extractedCode;
  //   // } else if (controlItem.type === CInstructionType.MEMORY_STORE) {
  //   //   return 'Memory Store: ' + controlItem.dataType;
  //   // } else if (controlItem.type === CInstructionType.POP) {
  //   //   return 'Pop';
  //   // } else if (controlItem.type === CInstructionType.STACKFRAMETEARDOWNINSTRUCTION) {
  //   //   return 'Stack Frame Tear Down';
  //   // } else if (controlItem.type === CInstructionType.UNARY_OP) {
  //   //   return 'Unary operation: ' + controlItem.operator;
  //   // } else if (controlItem.type === CInstructionType.WHILE) {
  //   //   return 'While: ' + extractedCode;
  //   // } else if (controlItem.type === 'FunctionDefinition') {
  //   //   return 'Function Definition: ' + extractedCode;
  //   // } else if (controlItem.type === 'MemoryStore') {
  //   //   return 'Memory Store: ' + extractedCode;
  //   // } else if (controlItem.type === 'SelectionStatement') {
  //   //   return 'Selection Statement: ' + extractedCode;
  //   // } else if (controlItem.type === 'DoWhileLoop') {
  //   //   return 'Do While Loop: ' + extractedCode;
  //   // } else if (controlItem.type === 'WhileLoop') {
  //   //   return 'While Loop: ' + extractedCode;
  //   // } else if (controlItem.type === 'ForLoop') {
  //   //   return 'For Loop: ' + extractedCode;
  //   // } else if (controlItem.type === 'FunctionCall') {
  //   //   if (controlItem.calledFunction.type == 'DirectlyCalledFunction') {
  //   //     if (controlItem.calledFunction.functionName == "main") {
  //   //       return "main()";
  //   //     } else {
  //   //       return extractedCode;
  //   //     }
  //   //   } else {
  //   //     return "Indirect Function call\n" + extractedCode;
  //   //   }
  //   // } else if (controlItem.type === 'ReturnStatement') {
  //   //   return 'Return Statement: ' + extractedCode;
  //   // } else if (controlItem.type === 'BreakStatement') {
  //   //   return 'Break Statement';
  //   // } else if (controlItem.type === 'ContinueStatement') {
  //   //   return 'Continue Statement';
  //   // } else if (controlItem.type === 'SwitchStatement') {
  //   //   return 'Switch Statement';
  //   // } else if (controlItem.type === 'ExpressionStatement') {
  //   //   return 'Expression Statement: ' + extractedCode;
  //   // } else if (controlItem.type === 'BinaryExpression') {
  //   //   return 'Binary Expression: ' + extractedCode;
  //   // } else if (controlItem.type === 'IntegerConstant') {
  //   //   return 'Integer Constant: ' + controlItem.value.toString();
  //   // } else if (controlItem.type === 'FloatConstant') {
  //   //   return 'Float Constant: ' + controlItem.value.toString();
  //   // } else if (controlItem.type === 'PreStatementExpression') {
  //   //   return "PreStatementExpresion: " + extractedCode;
  //   // } else if (controlItem.type === 'PostStatementExpression') {
  //   //   return 'Post Statement Expression: ' + extractedCode;
  //   // } else if (controlItem.type === 'UnaryExpression') {
  //   //   return 'Unary Expression: ' + extractedCode;
  //   // } else if (controlItem.type === 'LocalAddress') {
  //   //   return 'Local Address: ' + controlItem.offset.value;
  //   // } else if (controlItem.type === 'DataSegmentAddress') {
  //   //   return 'Data Segment Address: ' + controlItem.offset;
  //   // } else if (controlItem.type === 'DynamicAddress') {
  //   //   return 'Dynamic Address: ' + controlItem.address;
  //   // } else if (controlItem.type === 'ReturnObjectAddress') {
  //   //   return 'Return Object Address: ' + controlItem.offset;
  //   // } else if (controlItem.type === 'FunctionTableIndex') {
  //   //   const funcIndex = controlItem.index.value;

  //   //   if (funcIndex < 0 || funcIndex >= CseMachine.functions.length) {
  //   //     throw new Error('Index of desired function is out of bounds');
  //   //   }
  //   //   const func = CseMachine.functions[Number(funcIndex)];
  //   //   return func.functionName;
  //   // } else if (controlItem.type === 'MemoryLoad') {
  //   //   console.log("LONMEMAY: ", controlItem.address.type)
  //   //   const res = 'Memory Load: ' + controlItem.address.type;
  //   //   return res;
  //   // } else if (controlItem.type === 'ConditionalExpression') {
  //   //   return 'Conditional Expression: ' + extractedCode;
  //   // } else {
  //   //   throw new Error('Unknown instruction type');
  //   // }

  //   return res;
  // }

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
