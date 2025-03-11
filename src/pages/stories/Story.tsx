import 'js-slang/dist/editors/ace/theme/source';

import { Classes } from '@blueprintjs/core';
import { TextInput } from '@tremor/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import ControlBar, { ControlBarProps } from 'src/commons/controlBar/ControlBar';
import { ControlButtonSaveButton } from 'src/commons/controlBar/ControlBarSaveButton';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import StoriesActions from 'src/features/stories/StoriesActions';

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
    dispatch(StoriesActions.setCurrentStory(null));
    // Either a new story (idToSet is null) or an existing story
    // If existing story, setting it will automatically fetch the new story
    dispatch(StoriesActions.setCurrentStoryId(idToSet ? parseInt(idToSet) : null));
  }, [dispatch, idToSet]);

  // Loading state, show empty screen
  if (!story) {
    return <></>;
  }

  const { title: title } = story;

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
            dispatch(StoriesActions.setCurrentStory({ ...story, title: newTitle }));
            setIsDirty(true);
          }}
        />
      ),
      isViewOnly ? null : (
        <ControlButtonSaveButton
          key="save_story"
          onClickSave={() => {
            if (storyId) {
              // Update story
              dispatch(StoriesActions.saveStory(story, storyId));
            } else {
              // Create story
              dispatch(StoriesActions.createStory(story));
            }
            // TODO: Set isDirty to false
            setIsDirty(false);
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
          <div className="newUserblog" id="userblogContainer">
            <UserBlogContent 
              isViewOnly={isViewOnly} 
            />
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
