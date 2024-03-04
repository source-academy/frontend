import { Card, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import { useDispatch } from 'react-redux';
import { ResultOutput, styliseSublanguage } from 'src/commons/application/ApplicationTypes';
import { ControlBarRunButton } from 'src/commons/controlBar/ControlBarRunButton';
import ControlButton from 'src/commons/ControlButton';
import makeDataVisualizerTabFrom from 'src/commons/sideContent/content/SideContentDataVisualizer';
import makeHtmlDisplayTabFrom from 'src/commons/sideContent/content/SideContentHtmlDisplay';
import SideContent, { SideContentProps } from 'src/commons/sideContent/SideContent';
import { useSideContent } from 'src/commons/sideContent/SideContentHelper';
import { SideContentTab, SideContentType } from 'src/commons/sideContent/SideContentTypes';
import Constants from 'src/commons/utils/Constants';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { addHtmlConsoleError } from 'src/commons/workspace/WorkspaceActions';
import {
  clearStoryEnv,
  evalStory,
  toggleStoriesUsingSubst
} from 'src/features/stories/StoriesActions';
import { makeSubstVisualizerTabFrom } from 'src/pages/playground/PlaygroundTabs';

import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { Output } from '../../../commons/repl/Repl';
import { getModeString, selectMode } from '../../../commons/utils/AceHelper';
import { DEFAULT_ENV } from './UserBlogContent';

export type SourceBlockProps = {
  content: string;
  commands: string; // env is in commands
};

/**
 * Parses the metadata and provides arguments if it exists
 * metadata should be in the format of -key1-key2-key3:argifexists-key4
 * If multiple same key in the metadata, it will take the first arg
 * @param key key to look out for
 * @param metadata metadata
 * @returns string of args if key is found and args exists, '' if key is found without args, undefined if key is not found
 */
function parseMetadata(key: string, metadata: string): string | undefined {
  for (const keyValuePair of metadata.split('-')) {
    const keyArgs = keyValuePair.split(':');
    if (keyArgs[0] === key) {
      return keyArgs.length > 1 ? keyArgs[1] : '';
    }
  }
  return undefined;
}

const SourceBlock: React.FC<SourceBlockProps> = props => {
  const dispatch = useDispatch();
  const [code, setCode] = useState<string>(props.content);
  const [outputIndex, setOutputIndex] = useState(Infinity);

  const envList = useTypedSelector(store => Object.keys(store.stories.envs));

  // setting env
  const commandsEnv = parseMetadata('env', props.commands);
  const env =
    commandsEnv === undefined
      ? DEFAULT_ENV
      : envList.includes(commandsEnv)
      ? commandsEnv
      : DEFAULT_ENV;

  const chapter = useTypedSelector(
    store => store.stories.envs[env]?.context.chapter || Constants.defaultSourceChapter
  );
  const variant = useTypedSelector(
    store => store.stories.envs[env]?.context.variant || Constants.defaultSourceVariant
  );

  useEffect(() => {
    setCode(props.content);
  }, [props.content]);

  const output = useTypedSelector(store => store.stories.envs[env]?.output || []);
  const { selectedTab, setSelectedTab } = useSideContent(`stories.${env}`);

  const onChangeTabs = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      // TODO: Migrate relevant updated logic from Playground component
      // TODO: Use language config for source chapter.
      dispatch(toggleStoriesUsingSubst(newTabId === SideContentType.substVisualizer, env));

      setSelectedTab(newTabId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const envDisplayLabel =
    env === DEFAULT_ENV
      ? styliseSublanguage(chapter, variant)
      : env + ' | ' + styliseSublanguage(chapter, variant);

  // TODO: Add CSE machine tabs and shift to language config

  // const cseMachineTab: SideContentTab = {
  //   label: 'CSE Machine',
  //   iconName: IconNames.GLOBE,
  //   body: <SideContentCseMachine />,
  //   id: SideContentType.cseMachine
  // };

  const usingSubst = selectedTab === SideContentType.substVisualizer;
  const outputTab: SideContentTab = {
    label: 'Normal Output',
    iconName: IconNames.PLAY,
    body:
      output.length > outputIndex ? (
        <div className="Repl" style={{ margin: 0 }}>
          <div className="repl-output-parent">
            <p className={Classes.RUNNING_TEXT}>Output:</p>
            <Output output={output[outputIndex]} usingSubst={usingSubst} />
          </div>
        </div>
      ) : (
        <p className={Classes.RUNNING_TEXT}>Click "Run" in the top left to run some code!</p>
      ),
    id: SideContentType.storiesRun
  };

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [outputTab];

    // TODO: Restore logic post refactor

    // For HTML Chapter, HTML Display tab is added only after code is run
    if (chapter === Chapter.HTML) {
      if (output.length > outputIndex && output[outputIndex].type === 'result') {
        tabs.push(
          makeHtmlDisplayTabFrom(
            output[outputIndex] as ResultOutput,
            errorMsg => dispatch(addHtmlConsoleError(errorMsg, 'stories', env)),
            `stories.${env}`
          )
        );
      }
      return tabs;
    }

    // // (TEMP) Remove tabs for fullJS until support is integrated
    // if (chapter === Chapter.FULL_JS) {
    //   return [...tabs, dataVisualizerTab];
    // }

    if (chapter >= Chapter.SOURCE_2) {
      // Enable Data Visualizer for Source Chapter 2 and above
      tabs.push(makeDataVisualizerTabFrom(`stories.${env}`));
    }
    // if (chapter >= 3 && variant !== Variant.CONCURRENT && variant !== Variant.NON_DET) {
    //   // Enable CSE Machine for Source Chapter 3 and above
    //   tabs.push(cseMachineTab);
    // }

    if (
      chapter <= Chapter.SOURCE_2 &&
      (variant === Variant.DEFAULT || variant === Variant.NATIVE)
    ) {
      // Enable Subst Visualizer only for default Source 1 & 2
      tabs.push(makeSubstVisualizerTabFrom(`stories.${env}`, output.slice(outputIndex)));
    }

    return tabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, variant, output, dispatch, env]);

  const sideContentProps: SideContentProps = {
    selectedTabId: selectedTab,
    onChange: onChangeTabs,
    tabs: {
      beforeDynamicTabs: tabs,
      afterDynamicTabs: []
    },
    // storiesEnv: env,
    workspaceLocation: `stories.${env}`
    // getDebuggerContext: state => state.stories.envs[env].debuggerContext
  };

  const execEvaluate = () => {
    // We call onChangeTabs with the current tab when the run
    // button is clicked. This is a hotfix for incorrect execution
    // method because of the fact that execution logic is handled
    // by the environment setting, but the currently showing tab
    // is handled by the component setting.
    if (selectedTab) onChangeTabs(selectedTab, selectedTab, {} as any);

    dispatch(evalStory(env, code));
    setOutputIndex(output.length);
  };

  // needed so execeval will update on shift-enter
  const execRef = useRef(execEvaluate);
  execRef.current = execEvaluate;

  const execResetEnv = () => {
    dispatch(clearStoryEnv(env));
  };

  selectMode(chapter, variant, ExternalLibraryName.NONE);

  return (
    <div className={Classes.DARK}>
      <div className="workspace">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ControlBarRunButton
              key="runButton"
              handleEditorEval={execEvaluate}
              isEntrypointFileDefined
            />
            <span style={{ display: 'inline-block', fontSize: '0.9rem', textAlign: 'center' }}>
              {envDisplayLabel}
            </span>
            <ControlButton label="Reset Env" onClick={execResetEnv} icon={IconNames.RESET} />
          </div>
          <div>
            <div className="right-parent">
              <Card>
                <AceEditor
                  className="repl-react-ace react-ace"
                  mode={getModeString(chapter, variant, ExternalLibraryName.NONE)}
                  theme="source"
                  height="1px"
                  width="100%"
                  value={code}
                  onChange={code => setCode(code)}
                  commands={[
                    {
                      name: 'evaluate',
                      bindKey: {
                        win: 'Shift-Enter',
                        mac: 'Shift-Enter'
                      },
                      exec: () => execRef.current()
                    }
                  ]}
                  minLines={5}
                  maxLines={20}
                  fontSize={17}
                  highlightActiveLine={false}
                  showGutter={false}
                  showPrintMargin={false}
                  setOptions={{
                    fontFamily: "'Inconsolata', 'Consolas', monospace"
                  }}
                />
              </Card>
              <div>
                <SideContent {...sideContentProps} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SourceBlock;
