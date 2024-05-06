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
  canPin?: boolean;
  isPinned?: boolean;
  handleTogglePin?: (id: number) => void;
  handleMovePinUp?: (id: number) => void;
  handleMovePinDown?: (id: number) => void;
  canModerate?: boolean;
  isPending?: boolean;
  handleRejectStory?: (id: number) => void;
  handlePublishStory?: (id: number) => void;
};

const StoryActions: React.FC<Props> = ({
  storyId,
  handleDeleteStory,
  canView = false,
  canEdit = false,
  canDelete = false,
  canPin = false,
  isPinned = false,
  handleTogglePin = () => {},
  handleMovePinUp = () => {},
  handleMovePinDown = () => {},
  canModerate = false,
  isPending = false,
  handleRejectStory = () => {},
  handlePublishStory = () => {}
}) => {
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      {canView && (
        <Link to={`./view/${storyId}`}>
          <Icon
            tooltip="View"
            icon={() => <BpIcon icon={IconNames.EyeOpen} />}
            variant="light"
            color="green"
          />
        </Link>
      )}
      {canEdit && (
        <Link to={`./edit/${storyId}`}>
          <Icon
            tooltip="Edit"
            icon={() => <BpIcon icon={IconNames.EDIT} />}
            variant="light"
            color="sky"
          />
        </Link>
      )}
      {canPin && isPinned && (
        <>
          <button style={{ padding: 0 }} onClick={() => handleMovePinUp(storyId)}>
            <Icon
              tooltip="Reorder up"
              icon={() => <BpIcon icon={IconNames.ARROW_UP} />}
              variant="light"
              color="pink"
            />
          </button>
          <button style={{ padding: 0 }} onClick={() => handleMovePinDown(storyId)}>
            <Icon
              tooltip="Reorder down"
              icon={() => <BpIcon icon={IconNames.ARROW_DOWN} />}
              variant="light"
              color="pink"
            />
          </button>
        </>
      )}
      {canPin && (
        <button style={{ padding: 0 }} onClick={() => handleTogglePin(storyId)}>
          <Icon
            tooltip={isPinned ? 'Unpin' : 'Pin'}
            icon={() => <BpIcon icon={isPinned ? IconNames.EXCLUDE_ROW : IconNames.PIN} />}
            variant="light"
            color="indigo"
          />
        </button>
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
      {isPending && canModerate && (
        <button style={{ padding: 0 }} onClick={() => handleRejectStory(storyId)}>
          <Icon
            tooltip="Reject"
            icon={() => <BpIcon icon={IconNames.CROSS} />}
            variant="light"
            color="red"
          />
        </button>
      )}
      {isPending && canModerate && (
        <button style={{ padding: 0 }} onClick={() => handlePublishStory(storyId)}>
          <Icon
            tooltip="Publish"
            icon={() => <BpIcon icon={IconNames.TICK} />}
            variant="light"
            color="red"
          />
        </button>
      )}
    </Flex>
  );
};

export default StoryActions;
