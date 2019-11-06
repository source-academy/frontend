import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { expectSaga } from 'redux-saga-test-plan';
import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { WorkspaceLocations } from '../../actions/workspaces';
import {
  ExternalLibraryName,
  ExternalLibraryNames
} from '../../components/assessment/assessmentShape';
import {
  createDefaultWorkspace,
  defaultState,
  defaultWorkspaceManager,
  IState
} from '../../reducers/states';
import playgroundSaga from '../playground';

describe('Playground saga tests', () => {
  test('puts changeQueryString action with undefined argument when passed the default value', () => {
    return expectSaga(playgroundSaga)
      .withState(defaultState)
      .put(actions.changeQueryString(''))
      .dispatch({
        type: actionTypes.GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts changeQueryString action with undefined argument when passed an empty string', () => {
    const dummyEditorValue: string = '';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    return expectSaga(playgroundSaga)
      .withState(dummyState)
      .put(actions.changeQueryString(''))
      .dispatch({
        type: actionTypes.GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts changeQueryString action with correct string argument when passed a dummy string', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const expectedString: string = createQueryString(dummyEditorValue, dummyState);
    return expectSaga(playgroundSaga)
      .withState(dummyState)
      .put(actions.changeQueryString(expectedString))
      .dispatch({
        type: actionTypes.GENERATE_LZ_STRING
      })
      .silentRun();
  });
});

function createQueryString(code: string, state: IState): string {
  const chapter: number = state.workspaces.playground.context.chapter;
  const external: ExternalLibraryName = state.workspaces.playground.externalLibrary;
  const execTime: number = state.workspaces.playground.execTime;
  const newQueryString: string = qs.stringify({
    prgrm: compressToEncodedURIComponent(code),
    chap: chapter,
    ext: external,
    exec: execTime
  });
  return newQueryString;
}
