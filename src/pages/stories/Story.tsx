import 'js-slang/dist/editors/ace/theme/source';

import { Classes } from '@blueprintjs/core';
import { TextInput } from '@tremor/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
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
import { fetchStory, setCurrentStory } from 'src/features/stories/StoriesActions';
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
  const storyTitle = story?.title ?? '';
  const content = story?.content ?? '';

  const { id: storyId } = useParams<{ id: string }>();
  useEffect(() => {
    if (!storyId) {
      dispatch(setCurrentStory(null));
      return;
    }
    const id = parseInt(storyId);
    dispatch(fetchStory(id));
  }, [dispatch, storyId]);

  if (!story) {
    return <></>;
  }

  const onEditorValueChange = (val: string) => {
    setIsDirty(true);
    dispatch(setCurrentStory({ ...story, content: val }));
  };

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
            const newTitle = e.target.value;
            dispatch(setCurrentStory({ ...story, title: newTitle }));
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
