import { useCallback, useEffect, useMemo, useState } from 'react';
import AceEditor, { IEditorProps } from 'react-ace';
import { useDispatch } from 'react-redux';
import { loginGitHub, logoutGitHub } from 'src/commons/application/actions/SessionActions';
import { ControlBarGitHubButtons } from 'src/commons/controlBar/github/ControlBarGitHubButtons';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import {
  githubOpenFile,
  githubSaveFile,
  githubSaveFileAs
} from 'src/features/github/GitHubActions';
import { updateStoriesContent } from 'src/features/stories/StoriesActions';

import ControlBar, { ControlBarProps } from '../../commons/controlBar/ControlBar';
import UserBlogContent from '../../features/stories/storiesComponents/UserBlogContent';

const Stories = () => {
  const dispatch = useDispatch();
  const [lastEdit, setLastEdit] = useState(new Date());
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

  const content = useTypedSelector(store => store.stories.content);

  const onEditorValueChange = useCallback(val => {
    setLastEdit(new Date());
    dispatch(updateStoriesContent(val));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const githubOctokitObject = useTypedSelector(store => store.session.githubOctokitObject);
  const githubSaveInfo = useTypedSelector(store => store.stories.githubSaveInfo);
  const githubPersistenceIsDirty =
    githubSaveInfo && (!githubSaveInfo.lastSaved || githubSaveInfo.lastSaved < lastEdit);
  const githubButtons = useMemo(() => {
    return (
      <ControlBarGitHubButtons
        key="github"
        loggedInAs={githubOctokitObject.octokit}
        githubSaveInfo={githubSaveInfo}
        isDirty={githubPersistenceIsDirty}
        onClickOpen={() => dispatch(githubOpenFile(true))}
        onClickSaveAs={() => dispatch(githubSaveFileAs(true))}
        onClickSave={() => dispatch(githubSaveFile(true))}
        onClickLogIn={() => dispatch(loginGitHub())}
        onClickLogOut={() => dispatch(logoutGitHub())}
        isFolderModeEnabled={false}
      />
    );
  }, [dispatch, githubOctokitObject, githubPersistenceIsDirty, githubSaveInfo]);

  const controlBarProps: ControlBarProps = {
    editorButtons: [githubButtons]
  };

  return (
    <div>
      <ControlBar {...controlBarProps} />
      <div
        style={{
          height: 'calc(100vh - 90px)',
          width: '100vw',
          display: 'flex',
          flexDirection: 'row',
          paddingBottom: 10,
          justifyContent: 'center'
        }}
      >
        <AceEditor
          className="repl-react-ace react-ace"
          width="40%"
          height="100%"
          theme="source"
          value={content}
          onChange={c => {
            onEditorValueChange(c);
          }}
          onScroll={onScroll}
          fontSize={17}
          highlightActiveLine={false}
          showPrintMargin={false}
          wrapEnabled={true}
          setOptions={{
            fontFamily: "'Inconsolata', 'Consolas', monospace"
          }}
        />
        <div className="newUserblog" id="userblogContainer">
          <UserBlogContent fileContent={content} />
        </div>
      </div>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = NewStory;
Component.displayName = 'NewStory';

export default Stories;
