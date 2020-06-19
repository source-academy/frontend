import React, { useState } from 'react';
import { Button, Dialog } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import AchievementDeadline from 'src/pages/academy/achievements/subcomponents/utils/AchievementDeadline';

type EditableAchievementDeadlineProps = {
  deadline?: Date;
  changeDeadline: any;
};

function EditableAchievementDeadline(props: EditableAchievementDeadlineProps) {
  const { deadline, changeDeadline } = props;
  const [isOpen, setOpen] = useState<boolean>(false);

  // TODO: show result of date picker (e.g. 1st January 2020, 23:59)

  return (
    <div className="deadline">
      <div>
        <Button onClick={() => setOpen(!isOpen)}>
          <AchievementDeadline deadline={deadline} />
        </Button>
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
