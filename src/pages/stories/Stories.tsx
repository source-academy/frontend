import { Button, InputGroup, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
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
  const { t } = useTranslation('translation', { keyPrefix: 'stories' });
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
        contents: <p>{t('deleteConfirmation')}</p>,
        positiveIntent: 'danger',
        positiveLabel: t('delete')
      });
      if (confirm) {
        dispatch(StoriesActions.deleteStory(id));
        // deleteStory will auto-refresh the list of stories after
      }
    },
    [dispatch, t]
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
        <>
          <GradingFlex justifyContent="space-between">
            <GradingFlex justifyContent="flex-start" alignItems="center" style={{ columnGap: 16 }}>
              <GradingText style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                {t('allStories')}
              </GradingText>
              {isLoggedIn && (
                <Button onClick={handleNewStory} icon={IconNames.PLUS}>
                  Add Story
                </Button>
              )}
            </GradingFlex>
            <InputGroup
              className="grading-search-input"
              placeholder="Search for author..."
              leftIcon="search"
              large={true}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </GradingFlex>

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
        </>
      }
    />
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Stories;
Component.displayName = 'Stories';

export default Stories;
