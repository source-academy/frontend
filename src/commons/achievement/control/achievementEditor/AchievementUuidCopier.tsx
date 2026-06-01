import { Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { showSuccessMessage } from 'src/commons/utils/notifications/NotificationsHelper';

type Props = {
  uuid: string;
};

function AchievmenetUuidCopier({ uuid }: Props) {
  const hoverText = 'Click to copy achievement UUID';
  const copy = () => {
    navigator.clipboard.writeText(uuid);
    showSuccessMessage('UUID copied to clipboard');
  };

  return (
    <Tooltip content={hoverText}>
      <Button icon={IconNames.CLIPBOARD} onClick={copy} />
    </Tooltip>
  );
}

export default AchievmenetUuidCopier;
