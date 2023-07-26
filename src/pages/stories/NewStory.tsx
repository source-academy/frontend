import 'js-slang/dist/editors/ace/theme/source';

import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import AceEditor, { IEditorProps } from 'react-ace';
import { useDispatch } from 'react-redux';
import ControlBar, { ControlBarProps } from 'src/commons/controlBar/ControlBar';
import { ControlButtonSaveButton } from 'src/commons/controlBar/ControlBarSaveButton';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { updateStoriesContent } from 'src/features/stories/StoriesActions';

import UserBlogContent from '../../features/stories/storiesComponents/UserBlogContent';

const NewStory: React.FC = () => {
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

  const content = useTypedSelector(store => store.stories.content);

  const onEditorValueChange = useCallback((val: string) => {
    setIsDirty(true);
    dispatch(updateStoriesContent(val));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controlBarProps: ControlBarProps = {
    editorButtons: [
      <ControlButtonSaveButton
        key="save_story"
        // TODO: implement save
        onClickSave={() => {}}
        hasUnsavedChanges={isDirty}
      />
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

export default NewStory;
