import { Chapter } from 'js-slang/dist/types';
import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { CseMachine as JavaCseMachine } from 'src/features/cseMachine/java/CseMachine';

import { isSchemeLanguage, isSourceLanguage, OverallState } from '../application/ApplicationTypes';
import { visitSideContent } from '../sideContent/SideContentActions';
import { SideContentType } from '../sideContent/SideContentTypes';
import Constants from '../utils/Constants';
import WorkspaceActions from '../workspace/WorkspaceActions';
import { PlaygroundWorkspaceState } from '../workspace/WorkspaceTypes';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export default function* PlaygroundSaga(): SagaIterator {
  yield takeEvery(
    visitSideContent.type,
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
          yield put(WorkspaceActions.toggleUsingSubst(false, workspaceLocation));
          yield put(WorkspaceActions.clearReplOutput(workspaceLocation));
        }
      }

      if (newId !== SideContentType.cseMachine) {
        yield put(WorkspaceActions.toggleUsingCse(false, workspaceLocation));
        yield call([CseMachine, CseMachine.clearCse]);
        yield call([JavaCseMachine, JavaCseMachine.clearCse]);
        yield put(WorkspaceActions.updateCurrentStep(-1, workspaceLocation));
        yield put(WorkspaceActions.updateStepsTotal(0, workspaceLocation));
        yield put(WorkspaceActions.toggleUpdateCse(true, workspaceLocation));
        yield put(WorkspaceActions.setEditorHighlightedLines(workspaceLocation, 0, []));
      }

      if (playgroundSourceChapter === Chapter.FULL_JAVA && newId === SideContentType.cseMachine) {
        yield put(WorkspaceActions.toggleUsingCse(true, workspaceLocation));
      }

      if (
        isSourceLanguage(playgroundSourceChapter) &&
        (newId === SideContentType.substVisualizer || newId === SideContentType.cseMachine)
      ) {
        if (playgroundSourceChapter <= Chapter.SOURCE_2) {
          yield put(WorkspaceActions.toggleUsingSubst(true, workspaceLocation));
        } else {
          yield put(WorkspaceActions.toggleUsingCse(true, workspaceLocation));
        }
      }

      if (newId === SideContentType.upload) {
        yield put(WorkspaceActions.toggleUsingUpload(true, workspaceLocation));
      } else {
        yield put(WorkspaceActions.toggleUsingUpload(false, workspaceLocation));
      }

      if (isSchemeLanguage(playgroundSourceChapter) && newId === SideContentType.cseMachine) {
        yield put(WorkspaceActions.toggleUsingCse(true, workspaceLocation));
      }
    }
  );
}

type UrlShortenerResponse = {
  status: string;
  code: string;
  url: {
    keyword: string;
    url: string;
    title: string;
    date: string;
    ip: string;
    clicks: string;
  };
  message: string;
  title: string;
  shorturl: string;
  statusCode: number;
};

/**
 * Gets short url from microservice
 * @returns {(Response|null)} Response if successful, otherwise null.
 */
export async function externalUrlShortenerRequest(
  queryString: string,
  keyword: string
): Promise<{ shortenedUrl: string; message: string }> {
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
    throw new Error('Something went wrong trying to create the link.');
  }

  const res: UrlShortenerResponse = await resp.json();
  if (res.status !== 'success' && !res.shorturl) {
    throw new Error(res.message);
  }

  const message = res.status !== 'success' ? res.message : '';
  const shortenedUrl = Constants.urlShortenerBase + res.url.keyword;
  return { shortenedUrl, message };
}
