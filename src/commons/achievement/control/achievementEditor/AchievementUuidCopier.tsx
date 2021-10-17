import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { showSuccessMessage } from 'src/commons/utils/NotificationsHelper';

type AchievementUuidCopierProps = {
  uuid: string;
};

function AchievmenetUuidCopier(props: AchievementUuidCopierProps) {
  const { uuid } = props;

  const hoverText = 'Click to copy achievement UUID';
  const copy = () => {
    navigator.clipboard.writeText(uuid);
    showSuccessMessage('UUID copied to clipboard');
  };

  return (
    <>
      <Tooltip2 content={hoverText}>
        <Button icon={IconNames.CLIPBOARD} onClick={copy} />
      </Tooltip2>
    </>
  );
}

export default AchievmenetUuidCopier;
