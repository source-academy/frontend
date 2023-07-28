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
import { scrollSync } from 'src/commons/utils/StoriesHelper';
import {
  fetchStory,
  setCurrentStory,
  setCurrentStoryId
} from 'src/features/stories/StoriesActions';
import { updateStory } from 'src/features/stories/storiesComponents/BackendAccess';

import UserBlogContent from '../../features/stories/storiesComponents/UserBlogContent';

type Props = {
  isViewOnly?: boolean;
};

const Story: React.FC<Props> = ({ isViewOnly = false }) => {
  const dispatch = useDispatch();
  const [isDirty, setIsDirty] = useState(false);

  const { currentStory: story, currentStoryId: storyId } = useTypedSelector(store => store.stories);
  const { id: idToSet } = useParams<{ id: string }>();
  useEffect(() => {
    // Clear screen on first load
    dispatch(setCurrentStory(null));
    // Either a new story (idToSet is null) or an existing story
    dispatch(setCurrentStoryId(idToSet ? parseInt(idToSet) : null));
  }, [dispatch, idToSet]);

  useEffect(() => {
    // If existing story, fetch it
    if (storyId) {
      dispatch(fetchStory(storyId));
    }
  }, [dispatch, storyId]);

  // Loading state, show empty screen
  if (!story) {
    return <></>;
  }

  const onEditorScroll = (e: IEditorProps) => {
    const userblogContainer = document.getElementById('userblogContainer');
    if (userblogContainer) {
      scrollSync(e, userblogContainer);
    }
  };

  const onEditorValueChange = (val: string) => {
    setIsDirty(true);
    dispatch(setCurrentStory({ ...story, content: val }));
  };

  const { title, content } = story;

  const controlBarProps: ControlBarProps = {
    editorButtons: [
      isViewOnly ? (
        <>{title}</>
      ) : (
        <TextInput
          maxWidth="max-w-xl"
          placeholder="Enter story title"
          value={title}
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
          onClickSave={() => {
            if (!storyId) {
              // TODO: Create story
              return;
            }
            updateStory(storyId, title, content)
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
      <div style={{ width: '100vw', height: '100%', display: 'flex' }}>
        {!isViewOnly && (
          <AceEditor
            className="repl-react-ace react-ace"
            width="100%"
            height="100%"
            theme="source"
            value={content}
            onChange={onEditorValueChange}
            onScroll={onEditorScroll}
            fontSize={17}
            highlightActiveLine={false}
            showPrintMargin={false}
            wrapEnabled={true}
            setOptions={{ fontFamily: "'Inconsolata', 'Consolas', monospace" }}
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
