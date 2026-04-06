import { IconNames } from '@blueprintjs/icons';
import { Context } from 'js-slang';
import { expectSaga } from 'redux-saga-test-plan';
import { getDynamicTabs } from 'src/commons/sideContent/SideContentHelper';
import { SideContentReducer } from 'src/commons/sideContent/SideContentReducer';
import {
  type SideContentManagerState,
  SideContentState,
  SideContentTab,
  SideContentType
} from 'src/commons/sideContent/SideContentTypes';
import { actions } from 'src/commons/utils/ActionsHelper';
import { Mock, vi } from 'vitest';

import SideContentSaga from '../SideContentSaga';

vi.mock('src/commons/sideContent/SideContentHelper', async () => ({
  ...(await vi.importActual('src/commons/sideContent/SideContentHelper')),
  getDynamicTabs: vi.fn()
}));

describe('Side Content Alerts for normal side content', () => {
  const mockedGetDynamicTabs = getDynamicTabs as Mock<typeof getDynamicTabs>;

  const expectSagaWrapper = (initialState: SideContentState, dynamicTabs: SideContentTab[]) => {
    mockedGetDynamicTabs.mockImplementationOnce(() => dynamicTabs);
    return expectSaga(SideContentSaga).withReducer(SideContentReducer, {
      playground: initialState
    } as unknown as SideContentManagerState);
  };
  const mockTab: SideContentTab = {
    id: SideContentType.module,
    label: 'tab2',
    iconName: IconNames.LAB_TEST,
    body: null
  };

  test('Check that alerts from existing tabs are processed after dynamic tabs are loaded', async () => {
    const { storeState } = await expectSagaWrapper({ dynamicTabs: [], alerts: [] }, [mockTab])
      .dispatch(actions.beginAlertSideContent(SideContentType.cseMachine, 'playground'))
      .dispatch(actions.beginAlertSideContent(SideContentType.dataVisualizer, 'playground'))
      .dispatch(actions.notifyProgramEvaluated({}, {}, '', {} as Context, 'playground'))
      .take(actions.notifyProgramEvaluated.type)
      .put(actions.endAlertSideContent(SideContentType.cseMachine, 'playground'))
      .put(actions.endAlertSideContent(SideContentType.dataVisualizer, 'playground'))
      .silentRun();

    expect(storeState).toMatchObject({
      playground: {
        dynamicTabs: [mockTab],
        alerts: ['tab2', SideContentType.dataVisualizer]
      }
    });
  });

  test('All alerts are reset upon new evaluation', async () => {
    const { storeState } = await expectSagaWrapper(
      { alerts: ['tab0', 'tab1', SideContentType.cseMachine], dynamicTabs: [] },
      []
    )
      .dispatch(actions.beginAlertSideContent(SideContentType.dataVisualizer, 'playground'))
      .dispatch(actions.notifyProgramEvaluated({}, {}, '', {} as Context, 'playground'))
      .take(actions.notifyProgramEvaluated.type)
      .silentRun();

    expect(storeState).toMatchObject({
      playground: {
        dynamicTabs: [],
        alerts: [SideContentType.dataVisualizer]
      }
    });
  });

  test('Selected tab is not included in alerts', async () => {
    const { storeState } = await expectSagaWrapper(
      {
        alerts: ['tab0', 'tab1', SideContentType.cseMachine],
        dynamicTabs: [],
        selectedTab: 'tab2' as any
      },
      [mockTab]
    )
      .dispatch(actions.beginAlertSideContent(SideContentType.dataVisualizer, 'playground'))
      .dispatch(actions.notifyProgramEvaluated({}, {}, '', {} as Context, 'playground'))
      .take(actions.notifyProgramEvaluated.type)
      .silentRun();

    expect(storeState).toMatchObject({
      playground: {
        dynamicTabs: [mockTab],
        alerts: [SideContentType.dataVisualizer],
        selectedTab: mockTab.label
      }
    });
  });
});
