import { Button, MenuItem, NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React from 'react';
import { EventMeta, EventType, GoalMeta } from 'src/features/achievement/AchievementTypes';

import EditableDate from '../EditableDate';
import EditableTime from '../EditableTime';

const EventSelect = Select.ofType<EventType>();
const eventRenderer: ItemRenderer<EventType> = (eventName, { handleClick }) => (
  <MenuItem key={eventName} onClick={handleClick} text={eventName} />
);

type Props = {
  changeMeta: (meta: GoalMeta) => void;
  eventMeta: EventMeta;
};

const EditableEventMeta: React.FC<Props> = ({ changeMeta, eventMeta }) => {
  const { eventNames, targetCount, release, deadline, observeFrom, observeTo } = eventMeta;

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...eventMeta, targetCount: targetCount });

  const changeEventName = (eventName: EventType, index: number) => {
    if (eventName === EventType.NONE) {
      changeMeta({ ...eventMeta, eventNames: eventNames.filter((_, idx) => idx !== index) });
    } else {
      eventNames[index] = eventName;
      changeMeta({ ...eventMeta, eventNames: eventNames });
    }
  };

  const changeRelease = (release?: Date) => {
    changeMeta({ ...eventMeta, release: release });
  };

  const changeDeadline = (deadline?: Date) => {
    changeMeta({ ...eventMeta, deadline: deadline });
  };

  const changeObserveFrom = (observeFrom?: Date) => {
    changeMeta({ ...eventMeta, observeFrom: observeFrom });
  };

  const changeObserveTo = (observeTo?: Date) => {
    changeMeta({ ...eventMeta, observeTo: observeTo });
  };

  const changeIndexEventName = (index: number) => (eventName: EventType) =>
    changeEventName(eventName, index);

  const generateEventNames = () => {
    return eventNames.map((eventName, index) => (
      <Tooltip content={'Change event type ' + index} key={index}>
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
    eventNames[eventNames.length] = EventType.RUN_CODE;
    changeMeta({ ...eventMeta, eventNames: eventNames });
  };

  return (
    <>
      {generateEventNames()}
      <Tooltip content="Add Event">
        <Button outlined={true} text={'Add Event'} onClick={addEvent} />
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
      <br />
      <EditableDate type="Release" date={release} changeDate={changeRelease} />
      <EditableDate type="Deadline" date={deadline} changeDate={changeDeadline} />
      <EditableTime type="Observe From" time={observeFrom} changeTime={changeObserveFrom} />
      <EditableTime type="Observe To" time={observeTo} changeTime={changeObserveTo} />
    </>
  );
};

export default EditableEventMeta;
