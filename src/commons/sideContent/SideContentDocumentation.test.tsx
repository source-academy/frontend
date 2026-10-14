import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { Chapter, Variant } from 'js-slang/dist/langs';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { defaultWorkspaceManager } from '../application/ApplicationTypes';
import { mockInitialStore } from '../mocks/StoreMocks';
import { Links } from '../utils/Constants';
import SideContentDocumentation from './content/SideContentDocumentation';
import { SideContentType } from './SideContentTypes';

const pythonLanguage: ILanguageDefinition = {
  id: 'python1',
  name: 'Python §1',
  evaluators: [],
};

type StoreOptions = {
  isTabSelected?: boolean;
  conductorEnabled?: boolean;
  language?: ILanguageDefinition;
  chapter?: Chapter;
  variant?: Variant;
};

function renderDocumentation({
  isTabSelected = true,
  conductorEnabled = true,
  language = pythonLanguage,
  chapter = Chapter.SOURCE_1,
  variant = Variant.DEFAULT,
}: StoreOptions = {}) {
  const playgroundWorkspace = defaultWorkspaceManager.playground;
  const store = mockInitialStore({
    featureFlags: { modifiedFlags: { 'conductor.enable': conductorEnabled } },
    sideContent: {
      playground: {
        dynamicTabs: [],
        alerts: [],
        selectedTab: isTabSelected ? SideContentType.documentation : SideContentType.introduction,
      },
    },
    languageDirectory: {
      selectedLanguageId: language.id,
      languageMap: { [language.id]: language },
    },
    workspaces: {
      playground: {
        ...playgroundWorkspace,
        context: { ...playgroundWorkspace.context, chapter, variant },
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SideContentDocumentation workspaceLocation="playground" />
      </MemoryRouter>
    </Provider>,
  );
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

  test('falls back to the default documentation URLs', () => {
    renderDocumentation();
    expect(screen.getByTitle('Python §1').getAttribute('src')).toBe(Links.sourceDocs);
    expect(screen.queryByTitle('Modules')).toBeNull();

    fireEvent.click(screen.getByText('Modules'));
    expect(screen.getByTitle('Modules').getAttribute('src')).toBe(Links.moduleDocs);
  });

  test('links to the Source chapter documentation when Conductor is disabled', () => {
    renderDocumentation({ conductorEnabled: false, chapter: Chapter.SOURCE_2 });
    expect(screen.getByTitle('Source §2').getAttribute('src')).toBe(
      `${Links.javascriptDocs}javascript_2/`,
    );
  });

  test('falls back to the documentation root for non-Source languages when Conductor is disabled', () => {
    renderDocumentation({ conductorEnabled: false, chapter: Chapter.FULL_JS });
    expect(screen.getByTitle('full JavaScript').getAttribute('src')).toBe(Links.sourceDocs);
  });

  test('Home button reloads the active frame', () => {
    renderDocumentation();
    const frameBeforeReset = screen.getByTitle('Python §1');

    fireEvent.click(screen.getByLabelText('Reset documentation'));
    expect(screen.getByTitle('Python §1')).not.toBe(frameBeforeReset);
  });
});
