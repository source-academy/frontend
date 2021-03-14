import { Button, MenuItem, NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import {
  EventConditions,
  EventMeta,
  EventType,
  GoalMeta
} from 'src/features/achievement/AchievementTypes';

type EditableEventMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  eventMeta: EventMeta;
};

const EventSelect = Select.ofType<EventType>();
const eventRenderer: ItemRenderer<EventType> = (eventName, { handleClick }) => (
  <MenuItem key={eventName} onClick={handleClick} text={eventName} />
);

const ConditionSelect = Select.ofType<EventConditions>();
const conditionRenderer: ItemRenderer<EventConditions> = (condition, { handleClick }) => (
  <MenuItem key={condition} onClick={handleClick} text={condition} />
);

function EditableEventMeta(props: EditableEventMetaProps) {
  const { changeMeta, eventMeta } = props;
  const { eventNames, targetCount, maxXp, condition } = eventMeta;

  const changeMaxXp = (maxXp: number) => changeMeta({ ...eventMeta, maxXp: maxXp });

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...eventMeta, targetCount: targetCount });

  const changeEventName = (eventName: EventType, index: number) => {
    eventNames[index] = eventName;
    changeMeta({ ...eventMeta, eventNames: eventNames });
  };

  const changeIndexEventName = (index: number) => (eventName: EventType) =>
    changeEventName(eventName, index);

  const changeCondition = (condition: EventConditions) =>
    changeMeta({ ...eventMeta, condition: { ...eventMeta.condition, type: condition } });

  const changeLeftBound = (leftBound: number) =>
    changeMeta({ ...eventMeta, condition: { ...eventMeta.condition, leftBound: leftBound } });

  const changeRightBound = (rightBound: number) =>
    changeMeta({ ...eventMeta, condition: { ...eventMeta.condition, rightBound: rightBound } });

  const generateEventNames = () => {
    return eventNames.map((eventName, index) => (
      <Tooltip content={'Change event type ' + index}>
        <EventSelect
          filterable={false}
          items={Object.values(EventType)}
          itemRenderer={eventRenderer}
          onItemSelect={changeIndexEventName(index)}
        >
          <Button outlined={true} text={eventName} />
        </EventSelect>
      </Tooltip>
    ));
  };

  const addEvent = () => {
    eventNames[eventNames.length] = EventType.NONE;
    changeMeta({ ...eventMeta, eventNames: eventNames });
  };

  return (
    <>
      {generateEventNames()}
      <Tooltip content="Add Event">
        <Button outlined={true} text={'Add Event'} onClick={addEvent} />
      </Tooltip>
      <Tooltip content="Max XP">
        <NumericInput
          allowNumericCharactersOnly={true}
          leftIcon={IconNames.BANK_ACCOUNT}
          min={0}
          onValueChange={changeMaxXp}
          placeholder="Enter max XP here"
          value={maxXp}
        />
      </Tooltip>
      <Tooltip content="Target Count">
        <NumericInput
          allowNumericCharactersOnly={true}
          leftIcon={IconNames.LOCATE}
          min={0}
          onValueChange={changeTargetCount}
          placeholder="Enter target count here"
          value={targetCount}
        />
      </Tooltip>
      <Tooltip content="Change event condition">
        <ConditionSelect
          filterable={false}
          items={Object.values(EventConditions)}
          itemRenderer={conditionRenderer}
          onItemSelect={changeCondition}
        >
          <Button outlined={true} text={condition.type} />
        </ConditionSelect>
      </Tooltip>
      {condition.type !== EventConditions.NONE && (
        <>
          <Tooltip content="Left Bound">
            <NumericInput
              allowNumericCharactersOnly={true}
              leftIcon={IconNames.GREATER_THAN_OR_EQUAL_TO}
              min={0}
              onValueChange={changeLeftBound}
              placeholder="Left Bound"
              value={condition.leftBound}
            />
          </Tooltip>
          <Tooltip content="Right Bound">
            <NumericInput
              allowNumericCharactersOnly={true}
              leftIcon={IconNames.LESS_THAN_OR_EQUAL_TO}
              min={0}
              onValueChange={changeRightBound}
              placeholder="Right Bound"
              value={condition.rightBound}
            />
          </Tooltip>
        </>
      )}
    </>
  );
}

export default EditableEventMeta;
