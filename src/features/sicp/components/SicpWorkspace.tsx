import { IconNames } from '@blueprintjs/icons';
import { isStepperOutput } from 'js-slang/dist/stepper/stepper';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { InterpreterOutput } from 'src/commons/application/ApplicationTypes';
import { ControlBarAutorunButtons } from 'src/commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from 'src/commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from 'src/commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from 'src/commons/controlBar/ControlBarEvalButton';
import { ControlBarExecutionTime } from 'src/commons/controlBar/ControlBarExecutionTime';
import { ControlBarStepLimit } from 'src/commons/controlBar/ControlBarStepLimit';
import controlButton from 'src/commons/ControlButton';
import Repl from 'src/commons/repl/Repl';
import SideContentDataVisualizer from 'src/commons/sideContent/SideContentDataVisualizer';
import SideContentEnvVisualizer from 'src/commons/sideContent/SideContentEnvVisualizer';
import SideContentInspector from 'src/commons/sideContent/SideContentInspector';
import SideContentSubstVisualizer from 'src/commons/sideContent/SideContentSubstVisualizer';
import { WorkspaceManagerState } from 'src/commons/workspace/WorkspaceTypes';

import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { SideContentTab, SideContentType } from '../../../commons/sideContent/SideContentTypes';
import Constants from '../../../commons/utils/Constants';
import Workspace, { WorkspaceProps } from '../../../commons/workspace/Workspace';
import { DispatchProps, StateProps } from '../../../pages/playground/Playground';

export type SicpWorkspaceProps = OwnProps & DispatchProps & StateProps & RouteComponentProps<{}>;

export type OwnProps = {
  initialEditorValue: string;

  handleCloseEditor: () => void;
};

// function handleHash(hash: string, props: PlaygroundProps) {
//   const qs = parseQuery(hash);

//   const programLz = qs.lz ?? qs.prgrm;
//   const program = programLz && decompressFromEncodedURIComponent(programLz);
//   if (program) {
//     props.handleEditorValueChange(program);
//   }

//   const chapter = stringParamToInt(qs.chap) || undefined;
//   const variant: Variant =
//     sourceLanguages.find(
//       language => language.chapter === chapter && language.variant === qs.variant
//     )?.variant ?? 'default';
//   if (chapter) {
//     props.handleChapterSelect(chapter, variant);
//   }

//   const ext =
//     Object.values(ExternalLibraryName).find(v => v === qs.ext) || ExternalLibraryName.NONE;
//   if (ext) {
//     props.handleExternalSelect(ext, true);
//   }

//   const execTime = Math.max(stringParamToInt(qs.exec || '1000') || 1000, 1000);
//   if (execTime) {
//     props.handleChangeExecTime(execTime);
//   }
// }

const SicpWorkspace: React.FC<SicpWorkspaceProps> = props => {
  // const location = 'playground';
  const { initialEditorValue, handleEditorValueChange } = props;
  const propsRef = React.useRef(props);
  propsRef.current = props;

  // tslint:disable-next-line
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.editorRun);
  const [hasBreakpoints, setHasBreakpoints] = React.useState(false);

  // const [sessionId, setSessionId] = React.useState(() =>
  //   initSession('playground', {
  //     editorValue: propsRef.current.editorValue,
  //     externalLibrary: propsRef.current.externalLibraryName,
  //     chapter: propsRef.current.sourceChapter
  //   })
  // );

  const usingRemoteExecution = false;

  React.useEffect(() => {
    handleEditorValueChange(initialEditorValue);
  }, [initialEditorValue, handleEditorValueChange]);

  // React.useEffect(() => {
  //   // Fixes some errors with runes and curves (see PR #1420)
  //   propsRef.current.handleExternalSelect(propsRef.current.externalLibraryName, true);

  //   // Only fetch default Playground sublanguage when not loaded via a share link
  //   if (!propsRef.current.location.hash) {
  //     propsRef.current.handleFetchSublanguage();
  //   }
  // }, []);

  // React.useEffect(() => {
  //   // When the editor session Id changes, then treat it as a new session.
  //   setSessionId(
  //     initSession('playground', {
  //       editorValue: propsRef.current.editorValue,
  //       externalLibrary: propsRef.current.externalLibraryName,
  //       chapter: propsRef.current.sourceChapter
  //     })
  //   );
  // }, [props.editorSessionId]);
  // React.useEffect(() => {
  //   if (!usingRemoteExecution && !externalLibraries.has(props.externalLibraryName)) {
  //     propsRef.current.handleExternalSelect(ExternalLibraryName.NONE, true);
  //   }
  // }, [usingRemoteExecution, props.externalLibraryName]);

  // const hash = props.location.hash;
  // React.useEffect(() => {
  //   if (!hash) {
  //     return;
  //   }
  //   handleHash(hash, propsRef.current);
  // }, [hash]);

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

      if (sourceChapter <= 2 && newTabId === SideContentType.substVisualizer) {
        handleUsingSubst(true);
      }

      if (prevTabId === SideContentType.substVisualizer && !hasBreakpoints) {
        handleReplOutputClear();
        handleUsingSubst(false);
      }

      setSelectedTab(newTabId);
    },
    [hasBreakpoints]
  );

  const processStepperOutput = (output: InterpreterOutput[]) => {
    const editorOutput = output[0];
    if (
      editorOutput &&
      editorOutput.type === 'result' &&
      editorOutput.value instanceof Array &&
      editorOutput.value[0] === Object(editorOutput.value[0]) &&
      isStepperOutput(editorOutput.value[0])
    ) {
      return editorOutput.value;
    } else {
      return [];
    }
  };

  const closeButton = controlButton('', IconNames.CROSS, props.handleCloseEditor);

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
        autorunDisabled={usingRemoteExecution}
        pauseDisabled={usingRemoteExecution}
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
      props.isRunning,
      usingRemoteExecution
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
        sourceChapter={props.sourceChapter}
        sourceVariant={props.sourceVariant}
        key="chapter"
        disabled={usingRemoteExecution}
      />
    ),
    [chapterSelectHandler, props.sourceChapter, props.sourceVariant, usingRemoteExecution]
  );

  const clearButton = React.useMemo(
    () => (
      <ControlBarClearButton handleReplOutputClear={props.handleReplOutputClear} key="clear_repl" />
    ),
    [props.handleReplOutputClear]
  );

  const evalButton = React.useMemo(
    () => (
      <ControlBarEvalButton
        handleReplEval={props.handleReplEval}
        isRunning={props.isRunning}
        key="eval_repl"
      />
    ),
    [props.handleReplEval, props.isRunning]
  );

  const executionTime = React.useMemo(
    () => (
      <ControlBarExecutionTime
        execTime={props.execTime}
        handleChangeExecTime={props.handleChangeExecTime}
        key="execution_time"
      />
    ),
    [props.execTime, props.handleChangeExecTime]
  );

  const stepperStepLimit = React.useMemo(
    () => (
      <ControlBarStepLimit
        stepLimit={props.stepLimit}
        handleChangeStepLimit={props.handleChangeStepLimit}
        key="step_limit"
      />
    ),
    [props.handleChangeStepLimit, props.stepLimit]
  );

  const replTab: SideContentTab = React.useMemo(() => {
    const replTabProps = {
      sourceChapter: props.sourceChapter,
      sourceVariant: props.sourceVariant,
      externalLibrary: props.externalLibraryName,
      output: props.output,
      replValue: props.replValue,
      handleBrowseHistoryDown: props.handleBrowseHistoryDown,
      handleBrowseHistoryUp: props.handleBrowseHistoryUp,
      handleReplEval: props.handleReplEval,
      handleReplValueChange: props.handleReplValueChange,
      hidden: false,
      inputHidden: false,
      usingSubst: props.usingSubst,
      replButtons: [evalButton, clearButton],
      disableScrolling: true
    };

    return {
      label: 'REPL',
      iconName: IconNames.PLAY,
      body: <Repl {...replTabProps} />,
      id: SideContentType.editorRun,
      toSpawn: () => true
    };
  }, [
    clearButton,
    evalButton,
    props.externalLibraryName,
    props.handleBrowseHistoryDown,
    props.handleBrowseHistoryUp,
    props.handleReplEval,
    props.handleReplValueChange,
    props.output,
    props.replValue,
    props.sourceChapter,
    props.sourceVariant,
    props.usingSubst
  ]);

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [replTab];

    if (props.sourceChapter >= 2 && !usingRemoteExecution) {
      // Enable Data Visualizer for Source Chapter 2 and above
      tabs.push(dataVisualizerTab);
    }
    if (
      props.sourceChapter >= 3 &&
      props.sourceVariant !== 'concurrent' &&
      props.sourceVariant !== 'non-det' &&
      !usingRemoteExecution
    ) {
      // Enable Inspector, Env Visualizer for Source Chapter 3 and above
      tabs.push(inspectorTab);
      tabs.push(envVisualizerTab);
    }

    if (props.sourceChapter <= 2 && props.sourceVariant === 'default') {
      // Enable Subst Visualizer only for default Source 1 & 2
      tabs.push({
        label: 'Stepper',
        iconName: IconNames.FLOW_REVIEW,
        body: <SideContentSubstVisualizer content={processStepperOutput(props.output)} />,
        id: SideContentType.substVisualizer,
        toSpawn: () => true
      });
    }

    return tabs;
  }, [props.output, props.sourceChapter, props.sourceVariant, replTab, usingRemoteExecution]);

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

  // const replDisabled =
  //   props.sourceVariant === 'concurrent' || props.sourceVariant === 'wasm' || usingRemoteExecution;

  const editorProps = {
    onChange: props.handleEditorValueChange,
    // onCursorChange: onCursorChangeMethod,
    // onSelectionChange: onSelectionChangeMethod,
    sourceChapter: props.sourceChapter,
    externalLibraryName: props.externalLibraryName,
    sourceVariant: props.sourceVariant,
    editorValue: props.editorValue,
    editorSessionId: props.editorSessionId,
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: props.handleEditorValueChange,
    handleSendReplInputToOutput: props.handleSendReplInputToOutput,
    handlePromptAutocomplete: props.handlePromptAutocomplete,
    isEditorAutorun: props.isEditorAutorun,
    breakpoints: props.breakpoints,
    highlightedLines: props.highlightedLines,
    newCursorPosition: props.newCursorPosition,
    handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints,
    handleSetSharedbConnected: props.handleSetSharedbConnected
  };

  const dummyReplProps = {
    output: [],
    replValue: '',
    sourceChapter: 1,
    sourceVariant: Constants.defaultSourceVariant as Variant,
    externalLibrary: ExternalLibraryName.NONE,
    handleBrowseHistoryDown: () => {},
    handleBrowseHistoryUp: () => {},
    handleReplEval: () => {},
    handleReplValueChange: (newCode: string) => {},
    replButtons: [],
    hidden: true
  };

  const controlBarProps = {
    editorButtons: [
      autorunButtons,
      // shareButton,
      chapterSelect,
      // props.sourceVariant !== 'concurrent' ? externalLibrarySelect : null,
      // sessionButtons,
      // persistenceButtons,
      // githubButtons,
      props.usingSubst ? stepperStepLimit : executionTime
    ],
    editingWorkspaceButtons: [closeButton]
  };

  const sideContentProps = {
    defaultSelectedTabId: selectedTab,
    selectedTabId: selectedTab,
    handleActiveTabChange: props.handleActiveTabChange,
    onChange: onChangeTabs,
    tabs,
    workspaceLocation: 'sicp' as keyof WorkspaceManagerState
  };

  const workspaceProps: WorkspaceProps = {
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    // Either editorProps or mcqProps must be provided
    controlBarProps: controlBarProps,
    // customEditor?: JSX.Element,
    editorProps: editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    replProps: dummyReplProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps,
    sideContentIsResizeable: false
  };

  return <Workspace {...workspaceProps} />;
};

const dataVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <SideContentDataVisualizer />,
  id: SideContentType.dataVisualizer,
  toSpawn: () => true
};

const inspectorTab: SideContentTab = {
  label: 'Inspector',
  iconName: IconNames.SEARCH,
  body: <SideContentInspector />,
  id: SideContentType.inspector,
  toSpawn: () => true
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <SideContentEnvVisualizer />,
  id: SideContentType.envVisualizer,
  toSpawn: () => true
};

export default SicpWorkspace;
