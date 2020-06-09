import React from 'react';
import { IconName, Button, Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementCardProps = {
  hasDropdown: boolean;
  icon: IconName;
  isDropdown: boolean;
  toggleDropdown: any;
  toggleModal: any;
};

function AchievementCard(props: AchievementCardProps) {
  const { hasDropdown, isDropdown, icon, toggleDropdown, toggleModal } = props;

  return (
    <Card className="achievement">
      {hasDropdown ? (
        <div className="dropdown">
          <Button
            icon={isDropdown ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
            minimal={true}
            onClick={toggleDropdown}
          />
        </div>
      ) : (
        <div className="dropdown"></div>
      )}
      <div className="icon">
        <Icon icon={icon} iconSize={28} onClick={toggleModal} />
      </div>
    </Card>
  );
}

export default AchievementCard;
