import { Button, Icon, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { Link } from 'react-router-dom';
import GradingFlex from 'src/commons/grading/GradingFlex';

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
  handleMovePinDown = () => {}
}) => {
  return (
    <GradingFlex style={{ height: '100%' }}>
      {canView && (
        <Link to={`./view/${storyId}`}>
          <Tooltip position={Position.TOP} content="View">
            <Icon icon={IconNames.EyeOpen} />
          </Tooltip>
        </Link>
      )}
      {canEdit && (
        <Link to={`./edit/${storyId}`}>
          <Tooltip position={Position.TOP} content="Edit">
            <Icon icon={IconNames.EDIT} />
          </Tooltip>
        </Link>
      )}
      {canPin && isPinned && (
        <>
          <Tooltip
            targetProps={{ style: { display: 'flex' } }}
            placement={Position.TOP}
            content="Reorder up"
          >
            <Button icon={IconNames.ARROW_UP} minimal onClick={() => handleMovePinUp(storyId)} />
          </Tooltip>
          <Tooltip
            targetProps={{ style: { display: 'flex' } }}
            placement={Position.TOP}
            content="Reorder down"
          >
            <Button
              icon={IconNames.ARROW_DOWN}
              minimal
              onClick={() => handleMovePinDown(storyId)}
            />
          </Tooltip>
        </>
      )}
      {canPin && (
        <Tooltip
          targetProps={{ style: { display: 'flex' } }}
          placement={Position.TOP}
          content={isPinned ? 'Unpin' : 'Pin'}
        >
          <Button
            icon={isPinned ? IconNames.EXCLUDE_ROW : IconNames.PIN}
            minimal
            onClick={() => handleTogglePin(storyId)}
          />
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip
          targetProps={{ style: { display: 'flex' } }}
          placement={Position.TOP}
          content="Delete"
        >
          <Button icon={IconNames.TRASH} minimal onClick={() => handleDeleteStory(storyId)} />
        </Tooltip>
      )}
    </GradingFlex>
  );
};

export default StoryActions;
