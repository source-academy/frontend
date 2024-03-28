import { FSModule } from 'browserfs/dist/node/core/FS';
import { Chapter, Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import qs from 'query-string';
import { SagaIterator } from 'redux-saga';
import { call, delay, put, race, select } from 'redux-saga/effects';
import CseMachine from 'src/features/cseMachine/CseMachine';

import {
  changeQueryString,
  shortenURL,
  updateShortURL
} from '../../features/playground/PlaygroundActions';
import { GENERATE_LZ_STRING, SHORTEN_URL } from '../../features/playground/PlaygroundTypes';
import { isSourceLanguage, OverallState } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { retrieveFilesInWorkspaceAsRecord } from '../fileSystem/utils';
import { visitSideContent } from '../sideContent/SideContentActions';
import { SideContentType, VISIT_SIDE_CONTENT } from '../sideContent/SideContentTypes';
import Constants from '../utils/Constants';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';
import {
  clearReplOutput,
  setEditorHighlightedLines,
  toggleUpdateCse,
  toggleUsingCse,
  toggleUsingSubst,
  updateCurrentStep,
  updateStepsTotal
} from '../workspace/WorkspaceActions';
import { EditorTabState, PlaygroundWorkspaceState } from '../workspace/WorkspaceTypes';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export default function* PlaygroundSaga(): SagaIterator {
  yield takeEvery(GENERATE_LZ_STRING, updateQueryString);

  yield takeEvery(SHORTEN_URL, function* (action: ReturnType<typeof shortenURL>): any {
    const queryString = yield select((state: OverallState) => state.playground.queryString);
    const keyword = action.payload;
    const errorMsg = 'ERROR';

    let resp, timeout;

    //we catch and move on if there are errors (plus have a timeout in case)
    try {
      const { result, hasTimedOut } = yield race({
        result: call(shortenURLRequest, queryString, keyword),
        hasTimedOut: delay(10000)
      });

      resp = result;
      timeout = hasTimedOut;
    } catch (_) {}

    if (!resp || timeout) {
      yield put(updateShortURL(errorMsg));
      return yield call(showWarningMessage, 'Something went wrong trying to create the link.');
    }

    if (resp.status !== 'success' && !resp.shorturl) {
      yield put(updateShortURL(errorMsg));
      return yield call(showWarningMessage, resp.message);
    }

    if (resp.status !== 'success') {
      yield call(showSuccessMessage, resp.message);
    }
    yield put(updateShortURL(Constants.urlShortenerBase + resp.url.keyword));
  });

  yield takeEvery(
    VISIT_SIDE_CONTENT,
    function* ({
      payload: { newId, prevId, workspaceLocation }
    }: ReturnType<typeof visitSideContent>) {
      if (workspaceLocation !== 'playground' || newId === prevId) return;

      // Do nothing when clicking the mobile 'Run' tab while on the stepper tab.
      if (prevId === SideContentType.substVisualizer && newId === SideContentType.mobileEditorRun) {
        return;
      }

      const {
        context: { chapter: playgroundSourceChapter },
        editorTabs
      }: PlaygroundWorkspaceState = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation]
      );

      if (prevId === SideContentType.substVisualizer) {
        if (newId === SideContentType.mobileEditorRun) return;
        const hasBreakpoints = editorTabs.find(({ breakpoints }) => breakpoints.find(x => !!x));

        if (!hasBreakpoints) {
          yield put(toggleUsingSubst(false, workspaceLocation));
          yield put(clearReplOutput(workspaceLocation));
        }
      }

      if (newId !== SideContentType.cseMachine) {
        yield put(toggleUsingCse(false, workspaceLocation));
        yield call([CseMachine, CseMachine.clearCse]);
        yield put(updateCurrentStep(-1, workspaceLocation));
        yield put(updateStepsTotal(0, workspaceLocation));
        yield put(toggleUpdateCse(true, workspaceLocation));
        yield put(setEditorHighlightedLines(workspaceLocation, 0, []));
      }

      if (
        isSourceLanguage(playgroundSourceChapter) &&
        (newId === SideContentType.substVisualizer || newId === SideContentType.cseMachine)
      ) {
        if (playgroundSourceChapter <= Chapter.SOURCE_2) {
          yield put(toggleUsingSubst(true, workspaceLocation));
        } else {
          yield put(toggleUsingCse(true, workspaceLocation));
        }
      }
    }
  );
}

function* updateQueryString() {
  const isFolderModeEnabled: boolean = yield select(
    (state: OverallState) => state.workspaces.playground.isFolderModeEnabled
  );
  const fileSystem: FSModule = yield select(
    (state: OverallState) => state.fileSystem.inBrowserFileSystem
  );
  const files: Record<string, string> = yield call(
    retrieveFilesInWorkspaceAsRecord,
    'playground',
    fileSystem
  );
  const editorTabs: EditorTabState[] = yield select(
    (state: OverallState) => state.workspaces.playground.editorTabs
  );
  const editorTabFilePaths = editorTabs
    .map((editorTab: EditorTabState) => editorTab.filePath)
    .filter((filePath): filePath is string => filePath !== undefined);
  const activeEditorTabIndex: number | null = yield select(
    (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
  );
  const chapter: Chapter = yield select(
    (state: OverallState) => state.workspaces.playground.context.chapter
  );
  const variant: Variant = yield select(
    (state: OverallState) => state.workspaces.playground.context.variant
  );
  const external: ExternalLibraryName = yield select(
    (state: OverallState) => state.workspaces.playground.externalLibrary
  );
  const execTime: number = yield select(
    (state: OverallState) => state.workspaces.playground.execTime
  );
  const newQueryString = qs.stringify({
    isFolder: isFolderModeEnabled,
    files: compressToEncodedURIComponent(qs.stringify(files)),
    tabs: editorTabFilePaths.map(compressToEncodedURIComponent),
    tabIdx: activeEditorTabIndex,
    chap: chapter,
    variant,
    ext: external,
    exec: execTime
  });
  yield put(changeQueryString(newQueryString));
}

/**
 * Gets short url from microservice
 * @returns {(Response|null)} Response if successful, otherwise null.
 */
export async function shortenURLRequest(
  queryString: string,
  keyword: string
): Promise<Response | null> {
  const url = `${window.location.protocol}//${window.location.host}/playground#${queryString}`;

  const params = {
    signature: Constants.urlShortenerSignature,
    action: 'shorturl',
    format: 'json',
    keyword,
    url
  };
  const fetchOpts: RequestInit = {
    method: 'POST',
    body: Object.entries(params).reduce((formData, [k, v]) => {
      formData.append(k, v!);
      return formData;
    }, new FormData())
  };

  const resp = await fetch(`${Constants.urlShortenerBase}yourls-api.php`, fetchOpts);
  if (!resp || !resp.ok) {
    return null;
  }

  const res = await resp.json();
  return res;
}
