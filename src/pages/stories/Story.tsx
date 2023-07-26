import 'js-slang/dist/editors/ace/theme/source';

import { Classes } from '@blueprintjs/core';
import { TextInput } from '@tremor/react';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import AceEditor, { IEditorProps } from 'react-ace';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import ControlBar, { ControlBarProps } from 'src/commons/controlBar/ControlBar';
import { ControlButtonSaveButton } from 'src/commons/controlBar/ControlBarSaveButton';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';
import {
  fetchStory,
  setCurrentStory,
  updateStoriesContent
} from 'src/features/stories/StoriesActions';
import { updateStory } from 'src/features/stories/storiesComponents/BackendAccess';

import UserBlogContent from '../../features/stories/storiesComponents/UserBlogContent';

type Props = {
  isViewOnly?: boolean;
};

const Story: React.FC<Props> = ({ isViewOnly = false }) => {
  const dispatch = useDispatch();
  const [isDirty, setIsDirty] = useState(false);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [editorScrollHeight, setEditorScrollHeight] = useState(1);

  const onScroll = (e: IEditorProps) => {
    setEditorScrollTop(e.session.getScrollTop());
    setEditorScrollHeight(e.renderer.layerConfig.maxHeight);
  };

  const [storyTitle, setStoryTitle] = useState('');

  useEffect(() => {
    const userblogContainer = document.getElementById('userblogContainer');
    const previewScrollHeight = Math.max(userblogContainer?.scrollHeight ?? 1, 1);
    const previewVisibleHeight = Math.max(userblogContainer?.offsetHeight ?? 1, 1);
    const relativeHeight =
      (editorScrollTop / (editorScrollHeight - previewVisibleHeight)) *
      (previewScrollHeight - previewVisibleHeight);
    userblogContainer?.scrollTo(0, relativeHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorScrollTop]);

  const story = useTypedSelector(store => store.stories.currentStory);
  const content = useTypedSelector(store => store.stories.content);

  const { id: storyId } = useParams<{ id: string }>();
  useEffect(() => {
    if (!storyId) {
      dispatch(setCurrentStory(null));
      return;
    }
    const id = parseInt(storyId);
    dispatch(fetchStory(id));
  }, [dispatch, storyId]);

  useEffect(() => {
    if (!story) {
      return;
    }
    // TODO: Refactor to store current story, not just the content,
    //       in the state.
    setStoryTitle(story.title);
    dispatch(updateStoriesContent(story.content));
  }, [dispatch, story]);

  const onEditorValueChange = useCallback((val: string) => {
    setIsDirty(true);
    dispatch(updateStoriesContent(val));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Currently, creating a new story would result in an initially
  // null state, thus, we can't early return.
  // TODO: Enable this once state refactoring is finished.
  // if (story === null) {
  //   return <></>;
  // }

  const controlBarProps: ControlBarProps = {
    editorButtons: [
      isViewOnly ? (
        <>{storyTitle}</>
      ) : (
        <TextInput
          maxWidth="max-w-xl"
          placeholder="Enter story title"
          value={storyTitle}
          onChange={e => {
            setStoryTitle(e.target.value);
            setIsDirty(true);
          }}
        />
      ),
      isViewOnly ? null : (
        <ControlButtonSaveButton
          key="save_story"
          // TODO: implement save
          onClickSave={() => {
            // TODO: Remove if in favour of early return above
            //       once state refactoring is complete.
            if (!story) {
              return;
            }
            updateStory(story.id, storyTitle, content)
              .then(() => {
                showSuccessMessage('Story saved');
                setIsDirty(false);
              })
              .catch(() => {
                showWarningMessage('Failed to save story');
              });
          }}
          hasUnsavedChanges={isDirty}
        />
      )
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} className={classNames(Classes.DARK)}>
      <ControlBar {...controlBarProps} />
      <div
        style={{
          width: '100vw',
          height: '100%',
          display: 'flex'
        }}
      >
        {!isViewOnly && (
          <AceEditor
            className="repl-react-ace react-ace"
            width="100%"
            height="100%"
            theme="source"
            value={content}
            onChange={onEditorValueChange}
            onScroll={onScroll}
            fontSize={17}
            highlightActiveLine={false}
            showPrintMargin={false}
            wrapEnabled={true}
            setOptions={{
              fontFamily: "'Inconsolata', 'Consolas', monospace"
            }}
          />
        )}
        <div className="newUserblog" id="userblogContainer">
          <UserBlogContent fileContent={content} />
        </div>
      </div>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const EditStoryComponent = () => <Story isViewOnly={false} />;
EditStoryComponent.displayName = 'EditStory';

export const ViewStoryComponent = () => <Story isViewOnly />;
ViewStoryComponent.displayName = 'ViewStory';

export default Story;
