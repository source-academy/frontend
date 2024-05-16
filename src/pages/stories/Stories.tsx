import '@tremor/react/dist/esm/tremor.css';

import { Button as BpButton, Icon as BpIcon, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Card, Flex, TextInput, Title } from '@tremor/react';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import StoriesActions from 'src/features/stories/StoriesActions';
import { getYamlHeader } from 'src/features/stories/storiesComponents/UserBlogContent';

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

  const { userId: storiesUserId, role: storiesRole } = useTypedSelector(state => state.stories);
  const isStoriesDisabled = useTypedSelector(state => !state.stories.groupId);
  const isLoggedIn = !!storiesUserId;

  const handleNewStory = useCallback(() => navigate('./new'), [navigate]);
  const handleDeleteStory = useCallback(
    async (id: number) => {
      const confirm = await showSimpleConfirmDialog({
        contents: <p>Are you sure you want to delete this story?</p>,
        positiveIntent: 'danger',
        positiveLabel: 'Delete'
      });
      if (confirm) {
        dispatch(StoriesActions.deleteStory(id));
        // deleteStory will auto-refresh the list of stories after
      }
    },
    [dispatch]
  );

  const storyList = useTypedSelector(state => state.stories.storyList);

  const handleTogglePinStory = useCallback(
    (id: number) => {
      // Safe to use ! as the story ID comes a story in storyList
      const story = storyList.find(story => story.id === id)!;
      const pinnedLength = storyList.filter(story => story.isPinned).length;
      const newStory = {
        ...story,
        isPinned: !story.isPinned,
        // Pinning a story appends to the end of the pinned list
        pinOrder: story.isPinned ? null : pinnedLength
      };
      dispatch(StoriesActions.saveStory(newStory, id));
    },
    [dispatch, storyList]
  );

  const handleMovePinUp = useCallback(
    (id: number) => {
      // Safe to use ! as the story ID comes a story in storyList
      const oldIndex = storyList.findIndex(story => story.id === id)!;
      if (oldIndex === 0) {
        return;
      }

      const toMoveUp = storyList[oldIndex];
      const toMoveDown = storyList[oldIndex - 1];

      const storiesToUpdate = [
        { ...toMoveUp, pinOrder: oldIndex - 1 },
        { ...toMoveDown, pinOrder: oldIndex }
      ];
      storiesToUpdate.forEach(story => dispatch(StoriesActions.saveStory(story, story.id)));
    },
    [dispatch, storyList]
  );

  const handleMovePinDown = useCallback(
    (id: number) => {
      // Safe to use ! as the story ID comes a story in storyList
      const oldIndex = storyList.findIndex(story => story.id === id)!;
      const pinnedLength = storyList.filter(story => story.isPinned).length;
      if (oldIndex === pinnedLength - 1) {
        return;
      }
      const toMoveDown = storyList[oldIndex];
      const toMoveUp = storyList[oldIndex + 1];

      const storiesToUpdate = [
        { ...toMoveDown, pinOrder: oldIndex + 1 },
        { ...toMoveUp, pinOrder: oldIndex }
      ];
      storiesToUpdate.forEach(story => dispatch(StoriesActions.saveStory(story, story.id)));
    },
    [dispatch, storyList]
  );

  return isStoriesDisabled ? (
    <ContentDisplay
      display={
        <NonIdealState
          icon={IconNames.ERROR}
          title="Disabled"
          description="Stories has been disabled for this course."
        />
      }
    />
  ) : (
    <ContentDisplay
      loadContentDispatch={() => dispatch(StoriesActions.getStoriesList())}
      display={
        <Card>
          <Flex justifyContent="justify-between">
            <Flex justifyContent="justify-start" spaceX="space-x-6">
              <Title>All Stories</Title>
              {isLoggedIn && (
                <BpButton onClick={handleNewStory} icon={IconNames.PLUS}>
                  Add Story
                </BpButton>
              )}
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
            stories={storyList
              // Filter out the YAML header from the content
              .map(story => ({ ...story, content: getYamlHeader(story.content).content }))
              .filter(
                story =>
                  // Always show pinned stories
                  story.isPinned || story.authorName.toLowerCase().includes(query.toLowerCase())
              )}
            storyActions={story => {
              const isAuthor = storiesUserId === story.authorId;
              const hasWritePermissions =
                storiesRole === StoriesRole.Moderator || storiesRole === StoriesRole.Admin;
              return (
                <StoryActions
                  storyId={story.id}
                  handleDeleteStory={handleDeleteStory}
                  handleTogglePin={handleTogglePinStory}
                  handleMovePinUp={handleMovePinUp}
                  handleMovePinDown={handleMovePinDown}
                  canView // everyone has view permissions, even anonymous users
                  canEdit={isAuthor || hasWritePermissions}
                  canDelete={isAuthor || hasWritePermissions}
                  canPin={hasWritePermissions}
                  isPinned={story.isPinned}
                />
              );
            }}
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
