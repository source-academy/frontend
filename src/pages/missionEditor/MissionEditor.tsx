import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import { Variant } from 'js-slang/dist/types';
import { decompressFromEncodedURIComponent } from 'lz-string';
import React, { useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import { RouteComponentProps } from 'react-router';
import { InterpreterOutput, sourceLanguages } from 'src/commons/application/ApplicationTypes';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from 'src/commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from 'src/commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from 'src/commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from 'src/commons/controlBar/ControlBarEvalButton';
import { ControlBarGitHubLoginButton } from 'src/commons/controlBar/ControlBarGitHubLoginButton';
import { HighlightedLines, Position } from 'src/commons/editor/EditorTypes';
import MobileWorkspace, { MobileWorkspaceProps } from 'src/commons/mobileWorkspace/MobileWorkspace';
import { SideContentMarkdownEditor } from 'src/commons/sideContent/SideContentMarkdownEditor';
import { SideContentTaskEditor } from 'src/commons/sideContent/SideContentTaskEditor';
import { SideContentTab, SideContentType } from 'src/commons/sideContent/SideContentTypes';
import Constants from 'src/commons/utils/Constants';
import { stringParamToInt } from 'src/commons/utils/ParamParseHelper';
import { parseQuery } from 'src/commons/utils/QueryHelper';
import Workspace, { WorkspaceProps } from 'src/commons/workspace/Workspace';

import { ControlBarMyMissionsButton } from '../../commons/controlBar/ControlBarMyMissionsButton';
import MissionData from '../../commons/missionEditor/MissionData';
import MissionMetadata from '../../commons/missionEditor/MissionMetadata';

export type MissionEditorProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: number, variant: Variant) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
  handleFetchSublanguage: () => void;
  handleGenerateLz: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
  handleSendReplInputToOutput: (code: string) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleUsingSubst: (usingSubst: boolean) => void;
  handleToggleEditorAutorun: () => void;
  handleFetchChapter: () => void;
};

export type StateProps = {
  editorValue: string;
  editorHeight?: number;
  editorWidth: string;
  execTime: number;
  breakpoints: string[];
  highlightedLines: HighlightedLines[];
  isEditorAutorun: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  newCursorPosition?: Position;
  output: InterpreterOutput[];
  queryString?: string;
  shortURL?: string;
  replValue: string;
  sideContentHeight?: number;
  sourceChapter: number;
  sourceVariant: Variant;
  stepLimit: number;
  externalLibraryName: ExternalLibraryName;
  usingSubst: boolean;
  githubOctokitInstance: Octokit | undefined;
  githubSaveInfo: { repoName: string; filePath: string };
};

function handleHash(hash: string, props: MissionEditorProps) {
  const qs = parseQuery(hash);

  const programLz = qs.lz ?? qs.prgrm;
  const program = programLz && decompressFromEncodedURIComponent(programLz);
  if (program) {
    props.handleEditorValueChange(program);
  }

  const chapter = stringParamToInt(qs.chap) || undefined;
  const variant: Variant =
    sourceLanguages.find(
      language => language.chapter === chapter && language.variant === qs.variant
    )?.variant ?? 'default';
  if (chapter) {
    props.handleChapterSelect(chapter, variant);
  }
}

const MissionEditor: React.FC<MissionEditorProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.missionTask);

  /**
   * Handles re-rendering the webpage + tracking states relating to the loaded mission
   */
  const [loadedMission, setLoadedMission] = React.useState(
    new MissionData('SAMPLE TEXT', new MissionMetadata(), [])
  );
  const [selectedSourceChapter, selectSourceChapter] = React.useState(props.sourceChapter);
  const [briefingContent, setBriefingContent] = React.useState('');
  const [currentTaskNumber, setCurrentTaskNumber] = React.useState(1);

  const loadMission = useCallback(
    (missionData: MissionData) => {
      setLoadedMission(missionData);
      selectSourceChapter(missionData.missionMetadata.sourceVersion);
      setBriefingContent(missionData.missionBriefing);
      setCurrentTaskNumber(1);
    }, []
  );

  /*
  // You can use these functions or write your own lol. Also delet this comment kthx
  const advanceCurrentTaskNumber = useCallback(
    () => {
      setCurrentTaskNumber(currentTaskNumber + 1);
    }, [currentTaskNumber, setCurrentTaskNumber]
  );

  const reducedCurrentTaskNumber = useCallback(
    () => {
      setCurrentTaskNumber(currentTaskNumber - 1);
    }, [currentTaskNumber, setCurrentTaskNumber]
  );
  */

  /**
   * Handles toggling of relevant SideContentTabs when exiting the mobile breakpoint
   */
  React.useEffect(() => {
    if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.missionTask);
      props.handleActiveTabChange(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const propsRef = React.useRef(props);
  propsRef.current = props;

  const [hasBreakpoints, setHasBreakpoints] = React.useState(false);

  React.useEffect(() => {
    propsRef.current.handleFetchSublanguage();
  }, []);

  const hash = props.location.hash;
  React.useEffect(() => {
    if (!hash) {
      return;
    }
    handleHash(hash, propsRef.current);
  }, [hash]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  React.useEffect(() => {
    if (
      isMobileBreakpoint &&
      (selectedTab === SideContentType.introduction ||
        selectedTab === SideContentType.remoteExecution)
    ) {
      props.handleActiveTabChange(SideContentType.mobileEditor);
      setSelectedTab(SideContentType.mobileEditor);
    } else if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.introduction);
      props.handleActiveTabChange(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const onEditorValueChange = React.useCallback(val => {
    propsRef.current.handleEditorValueChange(val);
  }, []);

  const onChangeTabs = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }

      const { handleUsingSubst, handleReplOutputClear, sourceChapter } = propsRef.current;

      /**
       * Do nothing when clicking the mobile 'Run' tab while on the stepper tab.
       */
      if (
        !(
          prevTabId === SideContentType.substVisualizer &&
          newTabId === SideContentType.mobileEditorRun
        )
      ) {
        if (sourceChapter <= 2 && newTabId === SideContentType.substVisualizer) {
          handleUsingSubst(true);
        }

        if (prevTabId === SideContentType.substVisualizer && !hasBreakpoints) {
          handleReplOutputClear();
          handleUsingSubst(false);
        }

        setSelectedTab(newTabId);
      }
    },
    [hasBreakpoints]
  );

  const autorunButtons = React.useMemo(
    () => (
      <ControlBarAutorunButtons
        handleDebuggerPause={props.handleDebuggerPause}
        handleDebuggerReset={props.handleDebuggerReset}
        handleDebuggerResume={props.handleDebuggerResume}
        handleEditorEval={props.handleEditorEval}
        handleInterruptEval={props.handleInterruptEval}
        handleToggleEditorAutorun={props.handleToggleEditorAutorun}
        isDebugging={props.isDebugging}
        isEditorAutorun={props.isEditorAutorun}
        isRunning={props.isRunning}
        key="autorun"
      />
    ),
    [
      props.handleDebuggerPause,
      props.handleDebuggerReset,
      props.handleDebuggerResume,
      props.handleEditorEval,
      props.handleInterruptEval,
      props.handleToggleEditorAutorun,
      props.isDebugging,
      props.isEditorAutorun,
      props.isRunning
    ]
  );

  const chapterSelectHandler = React.useCallback(
    ({ chapter, variant }: { chapter: number; variant: Variant }, e: any) => {
      const { handleUsingSubst, handleReplOutputClear, handleChapterSelect } = propsRef.current;
      if ((chapter <= 2 && hasBreakpoints) || selectedTab === SideContentType.substVisualizer) {
        handleUsingSubst(true);
      }
      if (chapter > 2) {
        handleReplOutputClear();
        handleUsingSubst(false);
      }

      handleChapterSelect(chapter, variant);
    },
    [hasBreakpoints, selectedTab]
  );

  const chapterSelect = React.useMemo(
    () => (
      <ControlBarChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={selectedSourceChapter}
        sourceVariant={props.sourceVariant}
        disabled={true}
        key="chapter"
      />
    ),
    [chapterSelectHandler, selectedSourceChapter, props.sourceVariant]
  );

  const clearButton = React.useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarClearButton
          handleReplOutputClear={props.handleReplOutputClear}
          key="clear_repl"
        />
      ),
    [props.handleReplOutputClear, selectedTab]
  );

  const evalButton = React.useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarEvalButton
          handleReplEval={props.handleReplEval}
          isRunning={props.isRunning}
          key="eval_repl"
        />
      ),
    [props.handleReplEval, props.isRunning, selectedTab]
  );

  const { githubOctokitInstance } = props;
  const githubButtons = React.useMemo(() => {
    return (
      <ControlBarGitHubLoginButton
        loggedInAs={githubOctokitInstance}
        key="github"
        onClickLogIn={props.handleGitHubLogIn}
        onClickLogOut={props.handleGitHubLogOut}
      />
    );
  }, [githubOctokitInstance, props.handleGitHubLogIn, props.handleGitHubLogOut]);

  const myMissionsButton = React.useMemo(() => {
    return <ControlBarMyMissionsButton key="my_missions" loadMission={loadMission} />;
  }, [loadMission]);

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [];

    tabs.push({
      label: 'Task',
      iconName: IconNames.NINJA,
      body: (
        <SideContentTaskEditor
          currentTaskNumber={currentTaskNumber}
          tasks={loadedMission.tasksData}
        />
      ),
      id: SideContentType.missionTask,
      toSpawn: () => true
    });

    tabs.push({
      label: 'Briefing',
      iconName: IconNames.BRIEFCASE,
      body: <SideContentMarkdownEditor content={briefingContent} />,
      id: SideContentType.missionBriefing,
      toSpawn: () => true
    });

    // Remove this for Phase 2-1.
    // It will be added once we get into Phase 2-2.
    /*
    tabs.push({
      label: 'Editor',
      iconName: IconNames.AIRPLANE,
      body: <SideContentMissionEditor {...props} />,
      id: SideContentType.missionEditor,
      toSpawn: () => true
    });
    */

    return tabs;
  }, [briefingContent, currentTaskNumber, loadedMission]);

  // Remove Intro and Remote Execution tabs for mobile
  const mobileTabs = [...tabs];
  mobileTabs.shift();
  mobileTabs.pop();

  const handleEditorUpdateBreakpoints = React.useCallback(
    (breakpoints: string[]) => {
      // get rid of holes in array
      const numberOfBreakpoints = breakpoints.filter(arrayItem => !!arrayItem).length;
      if (numberOfBreakpoints > 0) {
        setHasBreakpoints(true);
        if (propsRef.current.sourceChapter <= 2) {
          /**
           * There are breakpoints set on Source Chapter 2, so we set the
           * Redux state for the editor to evaluate to the substituter
           */

          propsRef.current.handleUsingSubst(true);
        }
      }
      if (numberOfBreakpoints === 0) {
        setHasBreakpoints(false);

        if (selectedTab !== SideContentType.substVisualizer) {
          propsRef.current.handleReplOutputClear();
          propsRef.current.handleUsingSubst(false);
        }
      }
      propsRef.current.handleEditorUpdateBreakpoints(breakpoints);
    },
    [selectedTab]
  );

  const replDisabled = props.sourceVariant === 'concurrent' || props.sourceVariant === 'wasm';

  const editorProps = {
    sourceChapter: props.sourceChapter,
    externalLibraryName: props.externalLibraryName,
    sourceVariant: props.sourceVariant,
    editorValue: props.editorValue,
    editorSessionId: '',
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: onEditorValueChange,
    handleSendReplInputToOutput: props.handleSendReplInputToOutput,
    handlePromptAutocomplete: props.handlePromptAutocomplete,
    isEditorAutorun: props.isEditorAutorun,
    breakpoints: props.breakpoints,
    highlightedLines: props.highlightedLines,
    newCursorPosition: props.newCursorPosition,
    handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints
  };

  const replProps = {
    sourceChapter: props.sourceChapter,
    sourceVariant: props.sourceVariant,
    externalLibrary: props.externalLibraryName,
    output: props.output,
    replValue: props.replValue,
    handleBrowseHistoryDown: props.handleBrowseHistoryDown,
    handleBrowseHistoryUp: props.handleBrowseHistoryUp,
    handleReplEval: props.handleReplEval,
    handleReplValueChange: props.handleReplValueChange,
    hidden: selectedTab === SideContentType.substVisualizer,
    inputHidden: replDisabled,
    usingSubst: props.usingSubst,
    replButtons: [replDisabled ? null : evalButton, clearButton]
  };

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, chapterSelect, githubButtons, myMissionsButton]
    },
    editorProps: editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    replProps: replProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: {
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      handleActiveTabChange: props.handleActiveTabChange,
      onChange: onChangeTabs,
      tabs,
      workspaceLocation: 'missionEditor'
    },
    sideContentIsResizeable: selectedTab !== SideContentType.substVisualizer
  };

  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    replProps: replProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [autorunButtons, chapterSelect, githubButtons, myMissionsButton]
      },
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      handleActiveTabChange: props.handleActiveTabChange,
      onChange: onChangeTabs,
      tabs: mobileTabs,
      workspaceLocation: 'missionEditor',
      handleEditorEval: props.handleEditorEval
    }
  };

  return (
    <div className={classNames('Mission', Classes.DARK)}>
      {isMobileBreakpoint ? (
        <MobileWorkspace {...mobileWorkspaceProps} />
      ) : (
        <Workspace {...workspaceProps} />
      )}
    </div>
  );
};

export default MissionEditor;
