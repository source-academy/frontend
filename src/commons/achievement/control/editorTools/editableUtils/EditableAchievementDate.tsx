import { Button, Dialog, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import { Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';

type EditableAchievementDateProps = {
  type: string;
  deadline?: Date;
  changeDeadline: any;
};

function EditableAchievementDate(props: EditableAchievementDateProps) {
  const { type, deadline, changeDeadline } = props;
  const [isOpen, setOpen] = useState<boolean>(false);

  const generateDeadlineString = () => {
    return deadline === undefined
      ? ''
      : `${deadline?.toLocaleDateString()} ${deadline?.toLocaleTimeString()}`;
  };

  return (
    <div className="deadline">
      <div className="deadline-details">
        <div>
          <Popover2 interactionKind={PopoverInteractionKind.HOVER} placement={Position.TOP}>
            <Button onClick={() => setOpen(!isOpen)}>{`Change ${type}`}</Button>
            {generateDeadlineString()}
          </Popover2>
        </div>
      </div>
      <Dialog onClose={() => setOpen(!isOpen)} isOpen={isOpen} title={`Edit Achievement ${type}`}>
        <DatePicker
          timePickerProps={{ showArrowButtons: true }}
          value={deadline}
          onChange={changeDeadline}
        />
        <Button text={`Remove ${type}`} onClick={() => changeDeadline(undefined)} />
      </Dialog>
    </div>
  );
}

export default EditableAchievementDate;
