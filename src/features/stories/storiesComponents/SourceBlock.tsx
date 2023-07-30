import { Card, Classes } from '@blueprintjs/core';
import React, { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import { useDispatch } from 'react-redux';
import { styliseSublanguage } from 'src/commons/application/ApplicationTypes';
import { SideContentTab, SideContentType } from 'src/commons/sideContent/SideContentTypes';
import Constants from 'src/commons/utils/Constants';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import {
  clearStoryEnv,
  evalStory,
  toggleStoriesUsingSubst
} from 'src/features/stories/StoriesActions';

import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { Output } from '../../../commons/repl/Repl';
import { getModeString, selectMode } from '../../../commons/utils/AceHelper';
import StoriesSideContent, { StoriesSideContentProps } from './StoriesSideContent';
import { DEFAULT_ENV } from './UserBlogContent';

type SourceBlockProps = {
  children: string;
  commands: string; // env is in commands
};

/**
 * Parses the commandsString and provides arguments if it exists
 * commandsString should be in the format of -key1-key2-key3:argifexists-key4
 * If multiple same key in the commandsString, it will take the first arg
 * @param key key to look out for
 * @param commandsString commandsString
 * @returns string of args if key is found and args exists, '' if key is found without args, undefined if key is not found
 */
function parseCommands(key: string, commandsString: string): string | undefined {
  for (const command of commandsString.split('-')) {
    const keyArgs = command.split(':');
    if (keyArgs[0] === key) {
      return keyArgs.length > 1 ? keyArgs[1] : '';
    }
  }
  return undefined;
}

const SourceBlock: React.FC<SourceBlockProps> = props => {
  const dispatch = useDispatch();
  const [code, setCode] = useState<string>(props.children);
  const [outputIndex, setOutputIndex] = useState<number>(Infinity);
  const [sideContentHidden, setSideContentHidden] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState(SideContentType.introduction);

  const envList = useTypedSelector(store => Object.keys(store.stories.envs));

  // setting env
  const commandsEnv = parseCommands('env', props.commands);
  let env = DEFAULT_ENV;
  if (commandsEnv !== undefined) {
    env = envList.includes(commandsEnv) ? commandsEnv : DEFAULT_ENV;
  }

  const chapter = useTypedSelector(
    store => store.stories.envs[env]?.context.chapter || Constants.defaultSourceChapter
  );
  const variant = useTypedSelector(
    store => store.stories.envs[env]?.context.variant || Constants.defaultSourceVariant
  );

  const output = useTypedSelector(store => store.stories.envs[env]?.output || []);

  const usingSubst = useTypedSelector(store => store.stories.envs[env]?.usingSubst || false);

  const onChangeTabs = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }

      /**
       * Do nothing when clicking the mobile 'Run' tab while on the stepper tab.
       */
      if (
        !(
          prevTabId === SideContentType.substVisualizer &&
          newTabId === SideContentType.mobileEditorRun
        )
      ) {
        if (chapter <= 2 && newTabId === SideContentType.substVisualizer) {
          toggleStoriesUsingSubst(true, env);
        }

        if (prevTabId === SideContentType.substVisualizer) {
          toggleStoriesUsingSubst(false, env);
        }

        setSelectedTab(newTabId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const chapterVariantDisplay = chapter ? styliseSublanguage(chapter, variant) : '';

  // TODO: Add data visualiser and env visualiser tabs

  // const dataVisualizerTab: SideContentTab = {
  //   label: 'Data Visualizer',
  //   iconName: IconNames.EYE_OPEN,
  //   body: <SideContentDataVisualizer />,
  //   id: SideContentType.dataVisualizer
  // };

  // const envVisualizerTab: SideContentTab = {
  //   label: 'Env Visualizer',
  //   iconName: IconNames.GLOBE,
  //   body: <SideContentEnvVisualizer />,
  //   id: SideContentType.envVisualizer
  // };

  // const processStepperOutput = (output: InterpreterOutput[]) => {
  //   const editorOutput = output[0];
  //   if (
  //     editorOutput &&
  //     editorOutput.type === 'result' &&
  //     editorOutput.value instanceof Array &&
  //     editorOutput.value[0] === Object(editorOutput.value[0]) &&
  //     isStepperOutput(editorOutput.value[0])
  //   ) {
  //     return editorOutput.value;
  //   } else {
  //     return [];
  //   }
  // };

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [];

    // TODO: Restore logic post refactor

    // // For HTML Chapter, HTML Display tab is added only after code is run
    // if (chapter === Chapter.HTML) {
    //   if (output.length > outputIndex && output[outputIndex].type === 'result') {
    //     tabs.push({
    //       label: 'HTML Display',
    //       iconName: IconNames.MODAL,
    //       body: (
    //         <SideContentHtmlDisplay
    //           content={(output[outputIndex] as ResultOutput).value}
    //           handleAddHtmlConsoleError={errorMsg =>
    //             dispatch(addHtmlConsoleError(errorMsg, 'stories', true))
    //           }
    //         />
    //       ),
    //       id: SideContentType.htmlDisplay
    //     });
    //   }
    //   return tabs;
    // }

    // // (TEMP) Remove tabs for fullJS until support is integrated
    // if (chapter === Chapter.FULL_JS) {
    //   return [...tabs, dataVisualizerTab];
    // }

    // if (chapter >= 2) {
    //   // Enable Data Visualizer for Source Chapter 2 and above
    //   tabs.push(dataVisualizerTab);
    // }
    // if (chapter >= 3 && variant !== Variant.CONCURRENT && variant !== Variant.NON_DET) {
    //   // Enable Env Visualizer for Source Chapter 3 and above
    //   tabs.push(envVisualizerTab);
    // }

    // if (chapter <= 2 && (variant === Variant.DEFAULT || variant === Variant.NATIVE)) {
    //   // Enable Subst Visualizer only for default Source 1 & 2
    //   tabs.push({
    //     label: 'Stepper',
    //     iconName: IconNames.FLOW_REVIEW,
    //     body: <SideContentSubstVisualizer content={processStepperOutput(output)} />,
    //     id: SideContentType.substVisualizer
    //   });
    // }

    return tabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, variant, output, dispatch, env]);

  const sideContentProps: StoriesSideContentProps = {
    selectedTabId: selectedTab,
    onChange: onChangeTabs,
    tabs: {
      beforeDynamicTabs: tabs,
      afterDynamicTabs: []
    },
    workspaceLocation: 'stories',
    storyEnv: env,
    getDebuggerContext: state => state.stories.envs[env].debuggerContext
  };

  const execEvaluate = () => {
    dispatch(evalStory(env, code));
    setOutputIndex(output.length);
  };

  // needed so execeval will update on shift-enter
  const execRef = useRef(execEvaluate);
  execRef.current = execEvaluate;

  const execResetEnv = () => {
    dispatch(clearStoryEnv(env));
  };

  // to handle environment reset
  useEffect(() => {
    if (output.length === 0) {
      setOutputIndex(Infinity);
    }
  }, [output]);

  selectMode(chapter, variant, ExternalLibraryName.NONE);

  return (
    <div className={Classes.DARK}>
      <div className="workspace">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={execEvaluate}>Run</button>
            <button onClick={execResetEnv}>Reset Env</button>
          </div>
          <p>{env === DEFAULT_ENV ? chapterVariantDisplay : env + ' | ' + chapterVariantDisplay}</p>
          <div className="row workspace-parent" style={{ maxWidth: '800px' }}>
            <div className="right-parent">
              <Card>
                <AceEditor
                  className="repl-react-ace react-ace"
                  mode={getModeString(chapter, variant, ExternalLibraryName.NONE)}
                  theme="source"
                  height="1px"
                  width="100%"
                  value={code}
                  onChange={code => {
                    setCode(code);
                  }}
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
              <div className="Repl">
                <div className="repl-output-parent">
                  {output.length > outputIndex ? (
                    <Output output={output[outputIndex]} usingSubst={usingSubst || false} />
                  ) : null}
                </div>
              </div>
              <button onClick={() => setSideContentHidden(!sideContentHidden)}>Show/Hide</button>
              <div
                style={{
                  display: sideContentHidden ? 'none' : undefined
                }}
              >
                <StoriesSideContent {...sideContentProps} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SourceBlock;
