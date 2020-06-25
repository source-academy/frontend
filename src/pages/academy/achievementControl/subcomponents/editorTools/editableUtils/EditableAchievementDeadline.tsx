import React, { useState } from 'react';
import { Button, Dialog } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import AchievementDeadline from '../../../../achievements/subcomponents/utils/AchievementDeadline';

type EditableAchievementDeadlineProps = {
  deadline?: Date;
  changeDeadline: any;
};

function EditableAchievementDeadline(props: EditableAchievementDeadlineProps) {
  const { deadline, changeDeadline } = props;
  const [isOpen, setOpen] = useState<boolean>(false);

  const generateDeadlineString = () => {
    return deadline === undefined
      ? ''
      : `${deadline?.toLocaleDateString()} ${deadline?.toLocaleTimeString()}`;
  };

  return (
    <div className="deadline">
      <div className="deadline-details">
        <div>{generateDeadlineString()}</div>
        <div>
          <Button onClick={() => setOpen(!isOpen)}>
            <AchievementDeadline deadline={deadline} />
          </Button>
        </div>
      </div>
      <Dialog onClose={() => setOpen(!isOpen)} isOpen={isOpen} title="Edit Achievement Deadline">
        <DatePicker
          timePickerProps={{ showArrowButtons: true }}
          value={deadline}
          onChange={changeDeadline}
        />
        <Button text="Remove Deadline" onClick={() => changeDeadline(undefined)} />
      </Dialog>
    </div>
  );
}

export default EditableAchievementDeadline;
