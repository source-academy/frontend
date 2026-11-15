import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import LanguageDirectoryActions from '../../../features/directory/LanguageDirectoryActions';
import { mockInitialStore } from '../../mocks/StoreMocks';
import ControlBarRuntimeSelect from './ControlBarRuntimeSelect';
import ControlBarVariantSelect from './ControlBarVariantSelect';

const evaluator = (id: string, name: string, capabilities: string[] = []) => ({
  id,
  name,
  path: '',
  capabilities,
});

// `family` isn't in the pinned directory types yet.
const languages = [
  {
    id: 'python1',
    name: 'Python §1',
    family: 'Python',
    evaluators: [evaluator('python1Py2js', 'py2js'), evaluator('python1Stepper', 'S', ['stepper'])],
  },
  {
    id: 'python3',
    name: 'Python §3',
    family: 'Python',
    evaluators: [evaluator('python3Py2js', 'py2js'), evaluator('python3Pynter', 'Pynter')],
  },
  { id: 'pythonFull', name: 'Python', family: 'Python', evaluators: [] },
  { id: 'scheme', name: 'Scheme', family: 'Scheme', evaluators: [] },
] as unknown as ILanguageDefinition[];

function renderWithSelection(ui: React.ReactElement, selectedLanguageId: string) {
  const store = mockInitialStore({
    languageDirectory: {
      languages,
      languageMap: Object.fromEntries(languages.map(l => [l.id, l])),
      selectedLanguageId,
      selectedEvaluatorId: languages.find(l => l.id === selectedLanguageId)?.evaluators[0]?.id,
    },
  });
  const dispatch = vi.spyOn(store, 'dispatch');
  const container = render(<Provider store={store}>{ui}</Provider>);
  return { container, dispatch };
}

describe('ControlBarVariantSelect', () => {
  it("lists the family's variants and selects one", async () => {
    const { container, dispatch } = renderWithSelection(<ControlBarVariantSelect />, 'python1');

    const button = await container.findByTestId('ControlBarVariantSelect');
    expect(button.textContent).toBe('Python §1');
    await userEvent.click(button);

    const items = await container.findAllByRole('menuitem');
    expect(items.map(item => item.textContent)).toEqual([
      'Python §1',
      'Python §3',
      'Python (Full)',
    ]);
    await userEvent.click(items[1]);

    expect(dispatch).toHaveBeenCalledWith(LanguageDirectoryActions.setSelectedLanguage('python3'));
  });

  it('shows the given language instead of the selected one', async () => {
    const { container } = renderWithSelection(
      <ControlBarVariantSelect languageId="python3" disabled />,
      'python1',
    );

    const button = await container.findByTestId('ControlBarVariantSelect');
    expect(button.textContent).toBe('Python §3');
    expect(button).toBeDisabled();
  });

  it('is disabled for a single-variant family', async () => {
    const { container } = renderWithSelection(<ControlBarVariantSelect />, 'scheme');

    const button = await container.findByTestId('ControlBarVariantSelect');
    expect(button.textContent).toBe('Scheme');
    expect(button).toBeDisabled();
  });
});

describe('ControlBarRuntimeSelect', () => {
  it('lists the selectable runtimes and selects one', async () => {
    const { container, dispatch } = renderWithSelection(<ControlBarRuntimeSelect />, 'python3');

    const button = await container.findByTestId('ControlBarRuntimeSelect');
    expect(button.textContent).toBe('py2js');
    await userEvent.click(button);

    const items = await container.findAllByRole('menuitem');
    expect(items.map(item => item.textContent)).toEqual(['py2js', 'Pynter']);
    await userEvent.click(items[1]);

    expect(dispatch).toHaveBeenCalledWith(
      LanguageDirectoryActions.setSelectedEvaluator('python3Pynter'),
    );
  });

  it('is disabled when only one runtime is selectable', async () => {
    const { container } = renderWithSelection(<ControlBarRuntimeSelect />, 'python1');

    const button = await container.findByTestId('ControlBarRuntimeSelect');
    expect(button.textContent).toBe('py2js');
    expect(button).toBeDisabled();
  });
});
