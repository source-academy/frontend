import { Button, MenuItem, NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { EventMeta, EventType, GoalMeta } from 'src/features/achievement/AchievementTypes';

type EditableEventMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  eventMeta: EventMeta;
};

const EventSelect = Select.ofType<EventType>();
const eventRenderer: ItemRenderer<EventType> = (goal, { handleClick }) => (
  <MenuItem key={goal} onClick={handleClick} text={goal} />
);

function EditableEventMeta(props: EditableEventMetaProps) {
  const { changeMeta, eventMeta } = props;
  const { eventName, targetCount, maxXp } = eventMeta;

  const changeMaxXp = (maxXp: number) => changeMeta({ ...eventMeta, maxXp: maxXp });

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...eventMeta, targetCount: targetCount });

  const changeEventName = (eventName: EventType) =>
    changeMeta({ ...eventMeta, eventName: eventName });

  return (
    <>
      <EventSelect
        filterable={false}
        items={Object.values(EventType)}
        itemRenderer={eventRenderer}
        onItemSelect={changeEventName}
      >
        <Button outlined={true} text={eventName} />
      </EventSelect>
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
          leftIcon={IconNames.GREATER_THAN_OR_EQUAL_TO}
          min={0}
          onValueChange={changeTargetCount}
          placeholder="Enter target count here"
          value={targetCount}
        />
      </Tooltip>
    </>
  );
}

export default EditableEventMeta;
