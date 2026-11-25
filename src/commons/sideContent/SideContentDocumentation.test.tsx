import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { mockInitialStore } from '../mocks/StoreMocks';
import SideContentDocumentation from './content/SideContentDocumentation';
import { SideContentType } from './SideContentTypes';

const pythonLanguage: ILanguageDefinition = {
  id: 'python1',
  name: 'Python §1',
  evaluators: [],
  documentation: { languageUrl: 'https://example.com/python_1/' },
};

type StoreOptions = {
  isTabSelected?: boolean;
  language?: ILanguageDefinition;
};

function createDocumentation({
  isTabSelected = true,
  language = pythonLanguage,
}: StoreOptions = {}) {
  const store = mockInitialStore({
    sideContent: {
      playground: {
        alerts: [],
        selectedTab: isTabSelected ? SideContentType.documentation : SideContentType.introduction,
      },
    },
    languageDirectory: {
      selectedLanguageId: language.id,
      languageMap: { [language.id]: language },
    },
  });

  return (
    <Provider store={store}>
      <MemoryRouter>
        <SideContentDocumentation workspaceLocation="playground" />
      </MemoryRouter>
    </Provider>
  );
}

function renderDocumentation(options?: StoreOptions) {
  return render(createDocumentation(options));
}

describe('SideContentDocumentation', () => {
  test('loads nothing until the tab is selected', () => {
    renderDocumentation({ isTabSelected: false });
    expect(screen.queryByTitle('Python §1')).toBeNull();
  });

  test('uses the documentation URLs from the language directory', () => {
    renderDocumentation({
      language: {
        ...pythonLanguage,
        documentation: {
          languageUrl: 'https://example.com/python_1/',
          modulesUrl: 'https://example.com/modules/',
        },
      },
    });
    expect(screen.getByTitle('Python §1').getAttribute('src')).toBe(
      'https://example.com/python_1/',
    );

    fireEvent.click(screen.getByText('Modules'));
    expect(screen.getByTitle('Modules').getAttribute('src')).toBe('https://example.com/modules/');
    expect(screen.getByTitle('Python §1').classList).toContain('hidden');
  });

  test('follows language changes while mounted', () => {
    const { rerender } = renderDocumentation();
    rerender(
      createDocumentation({
        language: {
          id: 'source1',
          name: 'Source §1',
          evaluators: [],
          documentation: { languageUrl: 'https://example.com/javascript_1/' },
        },
      }),
    );

    expect(screen.queryByTitle('Python §1')).toBeNull();
    expect(screen.getByTitle('Source §1').getAttribute('src')).toBe(
      'https://example.com/javascript_1/',
    );
  });

  test('has no Modules page when the language defines no modules documentation', () => {
    renderDocumentation();
    expect(screen.getByTitle('Python §1').getAttribute('src')).toBe(
      'https://example.com/python_1/',
    );
    expect(screen.queryByText('Modules')).toBeNull();
  });

  test('shows the language page after switching from Modules to a language without them', () => {
    const { rerender } = renderDocumentation({
      language: {
        ...pythonLanguage,
        documentation: {
          languageUrl: 'https://example.com/python_1/',
          modulesUrl: 'https://example.com/modules/',
        },
      },
    });
    fireEvent.click(screen.getByText('Modules'));

    rerender(
      createDocumentation({
        language: {
          id: 'source1',
          name: 'Source §1',
          evaluators: [],
          documentation: { languageUrl: 'https://example.com/javascript_1/' },
        },
      }),
    );

    expect(screen.queryByTitle('Modules')).toBeNull();
    expect(screen.getByTitle('Source §1').classList).not.toContain('hidden');
  });

  test('renders nothing for a language without documentation', () => {
    const { container } = renderDocumentation({
      language: { id: 'python1', name: 'Python §1', evaluators: [] },
    });
    expect(container.innerHTML).toBe('');
  });

  test('Home button reloads the active frame', () => {
    renderDocumentation();
    const frameBeforeReset = screen.getByTitle('Python §1');

    fireEvent.click(screen.getByLabelText('Reset documentation'));
    expect(screen.getByTitle('Python §1')).not.toBe(frameBeforeReset);
  });
});
