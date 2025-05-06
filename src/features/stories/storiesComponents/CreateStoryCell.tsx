import { Menu, MenuItem } from '@blueprintjs/core';
import { useState } from 'react';
import AceEditor from 'react-ace';
import { useDispatch } from 'react-redux';
import { ControlButtonSaveButton } from 'src/commons/controlBar/ControlBarSaveButton';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

import StoriesActions from '../StoriesActions';
import { StoryCell } from '../StoriesTypes';
import { getEnvironments } from './UserBlogContent';

type Props = {
  index: number;
};

const NewStoryCell: React.FC<Props> = ({ index }) => {
  const dispatch = useDispatch();
  const { currentStory: story, currentStoryId: storyId } = useTypedSelector(store => store.stories);
  const envs = getEnvironments(story!.header);
  const [isCode, setIsCode] = useState<boolean>(false);
  const [env, setEnv] = useState<string>(envs[0]);
  const [code, setCode] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  if (!story) {
    return <div></div>;
  }

  const editorOnChange = (code: string) => {
    setCode(code);
    setIsDirty(code.trim() !== '');
  };

  const reset = () => {
    setCode('');
    setEnv(envs[0]);
    setIsCode(false);
    setIsDirty(false);
  };

  const saveNewStoryCell = () => {
    const contents = story.content;
    for (let i = index; i < contents.length; i++) {
      contents[i].index += 1;
    }
    const newContent: StoryCell = {
      index: index,
      isCode: isCode,
      env: isCode ? env : '',
      content: code
    };
    contents.push(newContent);
    contents.sort((a, b) => a.index - b.index);
    const newStory = { ...story, content: [...contents] };
    console.log('a new cell is saved');
    console.log(newStory);
    dispatch(StoriesActions.setCurrentStory({ ...newStory }));
    dispatch(StoriesActions.saveStory(newStory, storyId!));
  };

  const saveButClicked = () => {
    if (!isDirty) {
      showWarningMessage('Cannot save empty story cell!');
      return;
    }
    saveNewStoryCell();
    reset();
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '5px',
          padding: '5px',
          backgroundColor: '#2c3e50'
        }}
      >
        <ControlButtonSaveButton
          key="save_story"
          onClickSave={saveButClicked}
          hasUnsavedChanges={isDirty}
        />
        <Menu>
          <MenuItem text={isCode ? 'Source' : 'Markdown'}>
            <MenuItem onClick={() => setIsCode(false)} text="Markdown" />
            <MenuItem onClick={() => setIsCode(true)} text="Source" />
          </MenuItem>
        </Menu>
        {isCode && (
          <div>
            <Menu>
              <MenuItem text={env}>
                {envs.map((env: string, index: number) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      setEnv(env);
                    }}
                    text={env}
                  />
                ))}
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>
      <AceEditor
        className="repl-react-ace react-ace"
        width="100%"
        height="100%"
        theme="source"
        value={code}
        onChange={editorOnChange}
        minLines={5}
        maxLines={20}
        fontSize={17}
        highlightActiveLine={false}
        showPrintMargin={false}
        wrapEnabled={true}
        setOptions={{ fontFamily: "'Inconsolata', 'Consolas', monospace" }}
        style={{ marginTop: '0px' }}
      />
    </div>
  );
};

export default NewStoryCell;
