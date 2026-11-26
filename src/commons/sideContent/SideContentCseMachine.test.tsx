import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { visitSideContent } from 'src/commons/sideContent/SideContentActions';
import { SideContentType } from 'src/commons/sideContent/SideContentTypes';
import { renderTreeJson } from 'src/commons/utils/TestUtils';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import type { CseSnapshot } from 'src/features/conductor/CseMachineHostPlugin';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { createStore } from 'src/pages/createStore';
import { describe, expect, test, vi } from 'vitest';

import { SideContentCseMachine } from './content/SideContentCseMachine';

// Mock BlueprintJS Slider due to a bug in initial state causing invalid CSS
// to be generated: `style="left: calc(-0px + (% * nan));"`
vi.mock('@blueprintjs/core', async importOriginal => ({
  ...(await importOriginal()),
  Slider: (props: any) => <div data-testid="mock-slider">{props.children}</div>,
}));

const mockStore = mockInitialStore();
const element = (
  <Provider store={mockStore}>
    <SideContentCseMachine workspaceLocation="playground" />
  </Provider>
);

test('CSE Machine component renders correctly', async () => {
  const tree = await renderTreeJson(element);
  expect(tree).toMatchSnapshot();
});

test('CSE Machine sets visualization state and renders', async () => {
  await act(() => render(element));
  expect(screen.queryAllByTestId('cse-machine-default-text')).toHaveLength(1);
  expect(screen.queryAllByTestId('sa-cse-machine')).toHaveLength(0);

  act(() =>
    CseMachine.renderSnapshot({
      stepIndex: 0,
      control: [],
      stash: [],
      environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
    }),
  );

  expect(screen.queryAllByTestId('cse-machine-default-text')).toHaveLength(0);
  expect(screen.queryAllByTestId('sa-cse-machine')).toHaveLength(1);
});

describe('snapshots that arrive in batches', () => {
  const snapshot = (stepIndex: number): CseSnapshot => ({
    stepIndex,
    control: [],
    stash: [],
    environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
  });
  const run = (n: number) => Array.from({ length: n }, (_, i) => snapshot(i));

  async function setUp() {
    const store = createStore();
    store.dispatch(visitSideContent(SideContentType.cseMachine, undefined, 'playground'));
    await act(() =>
      render(
        <Provider store={store}>
          <SideContentCseMachine workspaceLocation="playground" />
        </Provider>,
      ),
    );
    const currentStep = () => store.getState().workspaces.playground.currentStep;
    const send = (snapshots: CseSnapshot[]) =>
      act(() => {
        store.dispatch(WorkspaceActions.updateStepsTotal(snapshots.length - 1, 'playground'));
        store.dispatch(WorkspaceActions.updateCseSnapshots(snapshots, 'playground'));
      });
    /** The user moves to a step: what the slider does, as far as the workspace can tell. */
    const moveTo = (step: number) =>
      act(() => store.dispatch(WorkspaceActions.updateCurrentStep(step, 'playground')));
    return { store, currentStep, send, moveTo };
  }

  test('the first snapshots of a run start at the first step', async () => {
    const { currentStep, send } = await setUp();
    await send(run(10));
    expect(currentStep()).toBe(0);
  });

  test('more snapshots of the same run keep the step that the user is at', async () => {
    const { currentStep, send, moveTo } = await setUp();
    const first = run(10);
    await send(first);
    await moveTo(6);
    await send([...first, ...run(35).slice(10)]);
    expect(currentStep()).toBe(6);
  });

  test('a new run, even of the same program, starts over at the first step', async () => {
    const { currentStep, send, moveTo } = await setUp();
    await send(run(10));
    await moveTo(6);
    await send(run(10));
    expect(currentStep()).toBe(0);
  });

  test('the layouts are laid out again when the run has more snapshots, as the frames are laid out with all of them', async () => {
    const { send } = await setUp();
    const first = run(10);
    await send(first);
    const clear = vi.spyOn(CseMachine, 'clearCachedLayouts');
    await send([...first, ...run(20).slice(10)]);
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });
});
