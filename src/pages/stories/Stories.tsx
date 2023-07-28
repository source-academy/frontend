import '@tremor/react/dist/esm/tremor.css';

import { Button as BpButton, Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Card, Flex, TextInput, Title } from '@tremor/react';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ContentDisplay from 'src/commons/ContentDisplay';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { deleteStory, getStoriesList } from 'src/features/stories/StoriesActions';

import StoriesTable from './StoriesTable';
import StoryActions from './StoryActions';

const columns = [
  { id: 'author', header: 'Author' },
  { id: 'title', header: 'Title' },
  { id: 'content', header: 'Content' },
  { id: 'actions', header: 'Actions' }
];

const Stories: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    <ContentDisplay
      loadContentDispatch={() => dispatch(getStoriesList())}
      display={
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

          <StoriesTable
            headers={columns}
            stories={storyList.filter(
              story =>
                // Always show pinned stories
                story.isPinned || story.authorName.toLowerCase().includes(query.toLowerCase())
            )}
            storyActions={story => (
              <StoryActions
                storyId={story.id}
                handleDeleteStory={handleDeleteStory}
                canView
                canEdit
                canDelete
              />
            )}
          />
        </Card>
      }
    />
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Stories;
Component.displayName = 'Stories';

export default Stories;
