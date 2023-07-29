import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Flex, Icon } from '@tremor/react';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  storyId: number;
  handleDeleteStory: (id: number) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

const StoryActions: React.FC<Props> = ({
  storyId,
  handleDeleteStory,
  canView = false,
  canEdit = false,
  canDelete = false
}) => {
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      {canView && (
        <Link to={`/stories/view/${storyId}`}>
          <Icon
            tooltip="View"
            icon={() => <BpIcon icon={IconNames.EyeOpen} />}
            variant="light"
            color="green"
          />
        </Link>
      )}
      {canEdit && (
        <Link to={`/stories/edit/${storyId}`}>
          <Icon tooltip="Edit" icon={() => <BpIcon icon={IconNames.EDIT} />} variant="light" />
        </Link>
      )}
      {canDelete && (
        <button style={{ padding: 0 }} onClick={() => handleDeleteStory(storyId)}>
          <Icon
            tooltip="Delete"
            icon={() => <BpIcon icon={IconNames.TRASH} />}
            variant="light"
            color="red"
          />
        </button>
      )}
    </Flex>
  );
};

export default StoryActions;
