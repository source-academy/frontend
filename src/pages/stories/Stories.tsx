import '@tremor/react/dist/esm/tremor.css';

import { Button as BpButton, Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
  Card,
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  Title
} from '@tremor/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';
import { getStoriesList } from 'src/features/stories/StoriesActions';

import { deleteStory } from '../../features/stories/storiesComponents/BackendAccess';

const Stories: React.FC = () => {
  const [query, setQuery] = useState('');

  const navigate = useNavigate();

  const columns = [
    { id: 'author', header: 'Author' },
    { id: 'title', header: 'Title' },
    { id: 'content', header: 'Content' },
    { id: 'actions', header: 'Actions' }
  ];

  const dispatch = useDispatch();
  const data = useTypedSelector(state => state.stories.storyList);
  useEffect(() => {
    dispatch(getStoriesList());
  }, [dispatch]);

  // TODO: Refactor together with the rest of the state logic
  const handleDeleteStory = useCallback((id: number) => {
    const confirm = window.confirm('Are you sure you want to delete this story?');
    if (confirm) {
      deleteStory(id)
        .then(() => {
          showSuccessMessage('Story deleted successfully');
          // Get stories again to update the list
          // Blocked by getStories not being handled by Saga
        })
        .catch(() => {
          showWarningMessage('Something went wrong while deleting the story');
        });
    }
  }, []);

  return (
    <div className="storiesHome">
      <Card>
        <Flex justifyContent="justify-between">
          <Flex justifyContent="justify-start" spaceX="space-x-6">
            <Title>All Stories</Title>
            <BpButton onClick={() => navigate(`/stories/new`)} icon={IconNames.PLUS}>
              Add Story
            </BpButton>
          </Flex>
          <TextInput
            maxWidth="max-w-xl"
            icon={() => <BpIcon icon={IconNames.SEARCH} style={{ marginLeft: '0.75rem' }} />}
            placeholder="Search for author..."
            onChange={e => setQuery(e.target.value)}
          />
        </Flex>

        <Table marginTop="mt-10">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableHeaderCell key={column.id}>{column.header}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .filter(
                story =>
                  // Always show pinned stories
                  story.isPinned || story.authorName.toLowerCase().includes(query.toLowerCase())
              )
              .map(story => (
                <TableRow key={story.id}>
                  <TableCell>{story.authorName}</TableCell>
                  <TableCell>
                    <Flex justifyContent="justify-start">
                      {story.isPinned && <Icon icon={() => <BpIcon icon={IconNames.PIN} />} />}
                      <Text>{story.title}</Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Text>
                      {story.content.length > 35
                        ? `${story.content.substring(0, 35)} ...`
                        : story.content}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Flex justifyContent="justify-start" spaceX="space-x-2">
                      <Link to={`/stories/view/${story.id}`}>
                        <Icon
                          tooltip="View"
                          icon={() => <BpIcon icon={IconNames.EyeOpen} />}
                          variant="light"
                          color="green"
                        />
                      </Link>
                      <Link to={`/stories/edit/${story.id}`}>
                        <Icon
                          tooltip="Edit"
                          icon={() => <BpIcon icon={IconNames.EDIT} />}
                          variant="light"
                        />
                      </Link>
                      <button style={{ padding: 0 }} onClick={() => handleDeleteStory(story.id)}>
                        <Icon
                          tooltip="Delete"
                          icon={() => <BpIcon icon={IconNames.TRASH} />}
                          variant="light"
                          color="red"
                        />
                      </button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Stories;
Component.displayName = 'Stories';

export default Stories;
