import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';


type AchievementUuidCopierProps = {
  uuid: string
};

function AchievmenetUuidCopier(props: AchievementUuidCopierProps) {
  const { uuid } = props;

  const hoverText = 'Click to copy achievement uuid';
  const copy = () => navigator.clipboard.writeText(uuid);

  return (
    <>
      <Tooltip2 content={hoverText}>
        <Button icon={IconNames.CLIPBOARD} onClick={copy} />
      </Tooltip2>
    </>
  );
}

export default AchievmenetUuidCopier;
