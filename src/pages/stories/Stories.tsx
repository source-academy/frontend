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
import { useNavigate } from 'react-router-dom';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { deleteStory, getStoriesList } from 'src/features/stories/StoriesActions';

import StoryActions from './StoryActions';

const columns = [
  { id: 'author', header: 'Author' },
  { id: 'title', header: 'Title' },
  { id: 'content', header: 'Content' },
  { id: 'actions', header: 'Actions' }
];

const MAX_EXCERPT_LENGTH = 35;

const Stories: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getStoriesList());
  }, [dispatch]);

  const handleNewStory = useCallback(() => navigate('/stories/new'), [navigate]);
  const handleDeleteStory = useCallback(
    async (id: number) => {
      const confirm = await showSimpleConfirmDialog({
        contents: <p>Are you sure you want to delete this story?</p>,
        positiveIntent: 'danger',
        positiveLabel: 'Delete'
      });
      if (confirm) {
        dispatch(deleteStory(id));
        // deleteStory will auto-refresh the list of stories after
      }
    },
    [dispatch]
  );

  const storyList = useTypedSelector(state => state.stories.storyList);

  return (
    <div className="storiesHome">
      <Card>
        <Flex justifyContent="justify-between">
          <Flex justifyContent="justify-start" spaceX="space-x-6">
            <Title>All Stories</Title>
            <BpButton onClick={handleNewStory} icon={IconNames.PLUS}>
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
            {storyList
              .filter(
                story =>
                  // Always show pinned stories
                  story.isPinned || story.authorName.toLowerCase().includes(query.toLowerCase())
              )
              .map(({ id, authorName, isPinned, title, content }) => (
                <TableRow key={id}>
                  <TableCell>{authorName}</TableCell>
                  <TableCell>
                    <Flex justifyContent="justify-start">
                      {isPinned && <Icon icon={() => <BpIcon icon={IconNames.PIN} />} />}
                      <Text>{title}</Text>
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Text>
                      {content.replaceAll(/\s+/g, ' ').length <= MAX_EXCERPT_LENGTH
                        ? content.replaceAll(/\s+/g, ' ')
                        : content.split(/\s+/).reduce((acc, cur) => {
                            return acc.length + cur.length <= MAX_EXCERPT_LENGTH
                              ? acc + ' ' + cur
                              : acc;
                          }, '') + '…'}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <StoryActions
                      storyId={id}
                      handleDeleteStory={handleDeleteStory}
                      canView
                      canEdit
                      canDelete
                    />
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
