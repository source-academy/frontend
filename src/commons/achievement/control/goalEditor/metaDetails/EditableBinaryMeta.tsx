import { Button, EditableText, MenuItem, NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { BinaryMeta, GoalMeta } from 'src/features/achievement/AchievementTypes';
import { AND, BooleanExpression, OR } from 'src/features/achievement/ExpressionTypes';

/**
 * Possible extension: event should be a select of type EventTypes (import from ExpressionTypes)
 * This is very much possible, but the possible false value in BooleanExpression really prevents it
 * Why is this even a possible boolean expression? why would anyone ever use false?
 */

type EditableBinaryMetaProps = {
  binaryMeta: BinaryMeta;
  changeMeta: (meta: GoalMeta) => void;
};

type Joiner = 'AND' | 'OR';
const JoinerSelect = Select.ofType<Joiner>();
const joinerRenderer: ItemRenderer<Joiner> = (joiner, { handleClick }) => (
  <MenuItem key={joiner} onClick={handleClick} text={joiner} />
);

// Takes the current condition, splits it into an array of strings
const conditionSplitter = (condition: BooleanExpression): string[] => {
  // only OR or AND Expressions have type property
  if (typeof condition === 'object' && 'type' in condition) {
    const { type, operands } = condition;
    const len = operands.length;
    const conditions = [];
    // make conditions [cond1, joiner, cond2, joiner, ..., condn]
    for (let i = 0; i < len; i++) {
      conditions.push(conditionSplitter(operands[i]));
      if (i !== len - 1) {
        conditions.push(type);
      }
    }
    // each recursive call flattens itself, so max depth is always 1
    return conditions.flat();
  } else {
    return [JSON.stringify(condition)];
  }
};

function EditableBinaryMeta(props: EditableBinaryMetaProps) {
  const { binaryMeta, changeMeta } = props;
  const { condition, targetCount } = binaryMeta;

  const joiners: string[] = [];
  const conditions: string[] = [];
  const condArray: string[] = conditionSplitter(condition);
  for (let i = 0; i < condArray.length; i++) {
    if (i % 2 === 0) {
      conditions[conditions.length] = condArray[i];
    } else {
      joiners[joiners.length] = condArray[i];
    }
  }

  // Joins the conditions array, and changes the goalMeta
  const changeCondition = () => {
    // find the first joiner, join the left and right
    // repeat until no more joiners left
    let condition = JSON.parse(conditions[0]);
    for (let i = 1; i < conditions.length; i++) {
      if (joiners[i - 1] === 'AND') {
        condition = AND(condition, JSON.parse(conditions[i]));
      } else {
        condition = OR(condition, JSON.parse(conditions[i]));
      }
    }
    changeMeta({ ...binaryMeta, condition: condition });
  };

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...binaryMeta, targetCount: targetCount });

  // Adds the and/or, adds the condition to be edited
  const addCondition = () => {
    joiners.push('AND');
    conditions.push('{"event":"", "restriction":""}');
    changeCondition();
  };

  const changeConditionArray = (cond: string, idx: number) => {
    conditions[idx] = cond;
    changeCondition();
  };

  const changeJoinerArray = (joiner: Joiner, idx: number) => {
    joiners[idx] = joiner;
    changeCondition();
  };

  const deleteCondition = (idx: number) => {
    for (let i = idx; i < conditions.length - 1; i++) {
      // bring everything forward
      conditions[i] = conditions[i + 1];
      joiners[i] = joiners[i + 1];
    }
    conditions.length = conditions.length - 1;
    joiners.length = joiners.length - 1;
    changeCondition();
  };

  // Generates the components for editing conditions
  const generateConditions = () => {
    return condArray.map((op: string, idx: number) => (
      <div key={idx}>
        {
          // even idx is condition, odd is joiner
          idx % 2 === 0 ? (
            // the text to change the condition
            <>
              <Tooltip2 content="Condition">
                <EditableText
                  onChange={value => changeConditionArray(value, idx / 2)}
                  multiline={true}
                  placeholder="Enter condition here"
                  value={op}
                />
              </Tooltip2>
              {
                // should only be deleteable if not the only condition
                conditions.length > 1 && (
                  <Tooltip2 content="Delete Condition">
                    <Button intent="danger" icon="trash" onClick={() => deleteCondition(idx)} />
                  </Tooltip2>
                )
              }
            </>
          ) : (
            // the button to choose the joiner to use
            <Tooltip2 content="And/Or">
              <JoinerSelect
                filterable={false}
                itemRenderer={joinerRenderer}
                items={['AND', 'OR']}
                onItemSelect={value => changeJoinerArray(value, (idx - 1) / 2)}
              >
                <Button minimal={true} outlined={true} text={op} />
              </JoinerSelect>
            </Tooltip2>
          )
        }
      </div>
    ));
  };

  return (
    <>
      <Tooltip2 content="Target Count">
        <NumericInput
          allowNumericCharactersOnly={true}
          leftIcon={IconNames.BANK_ACCOUNT}
          min={0}
          onValueChange={changeTargetCount}
          placeholder="Enter target count here"
          value={targetCount}
        />
      </Tooltip2>
      {generateConditions()}
      <br />
      <Button minimal={true} outlined={true} text="Add Condition" onClick={addCondition} />
    </>
  );
}

export default EditableBinaryMeta;
