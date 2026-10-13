import { Button, ButtonGroup, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useState } from 'react';

import { useLanguageDocumentation } from '../../../features/directory/useLanguageDocumentation';
import { useResponsive } from '../../utils/Hooks';
import { useSideContent } from '../SideContentHelper';
import { type SideContentLocation, SideContentType } from '../SideContentTypes';

type DocumentationPage = 'language' | 'modules';

const SIDE_CONTENT_CHROME_HEIGHT = 70;

const buttonClass = 'px-4 py-1.5 text-[15px]';

function getContainerHeight(isMobile: boolean, sideContentHeight?: number): string {
  if (isMobile) {
    return '100%';
  }
  if (sideContentHeight === undefined) {
    return '60vh';
  }
  return `${sideContentHeight - SIDE_CONTENT_CHROME_HEIGHT}px`;
}

type Props = {
  workspaceLocation: SideContentLocation;
  sideContentHeight?: number;
};

function SideContentDocumentation({ workspaceLocation, sideContentHeight }: Props) {
  const { languageName, languageDocsUrl, modulesDocsUrl } =
    useLanguageDocumentation(workspaceLocation);
  const { selectedTab } = useSideContent(workspaceLocation);
  const { isMobileBreakpoint } = useResponsive();

  const [activePage, setActivePage] = useState<DocumentationPage>('language');
  const [shownPages, setShownPages] = useState<DocumentationPage[]>([]);
  const [resetCounts, setResetCounts] = useState({ language: 0, modules: 0 });

  // Frames load only once first shown, then stay mounted so each keeps its current page
  const isTabSelected = selectedTab === SideContentType.documentation;
  if (isTabSelected && !shownPages.includes(activePage)) {
    setShownPages([...shownPages, activePage]);
  }

  // Remounting returns the frame to its start page without adding a browser history entry
  const resetActivePage = () => {
    setResetCounts(counts => ({ ...counts, [activePage]: counts[activePage] + 1 }));
  };

  const frameClassName = (page: DocumentationPage) =>
    classNames('w-full flex-1 border-none bg-white', { hidden: page !== activePage });

  return (
    <div
      className="flex w-full flex-col"
      style={{ height: getContainerHeight(!!isMobileBreakpoint, sideContentHeight) }}
    >
      <div className="mb-2 flex justify-between">
        <ButtonGroup>
          <Button
            className={buttonClass}
            active={activePage === 'language'}
            onClick={() => setActivePage('language')}
            text={languageName}
          />
          <Button
            className={buttonClass}
            active={activePage === 'modules'}
            onClick={() => setActivePage('modules')}
            text="Modules"
          />
        </ButtonGroup>
        <Tooltip content="Reset documentation">
          <Button
            icon={IconNames.HOME}
            aria-label="Reset documentation"
            onClick={resetActivePage}
          />
        </Tooltip>
      </div>
      {shownPages.includes('language') && (
        <iframe
          key={`${languageDocsUrl}-${resetCounts.language}`}
          title={languageName}
          src={languageDocsUrl}
          className={frameClassName('language')}
        />
      )}
      {shownPages.includes('modules') && (
        <iframe
          key={`${modulesDocsUrl}-${resetCounts.modules}`}
          title="Modules"
          src={modulesDocsUrl}
          className={frameClassName('modules')}
        />
      )}
    </div>
  );
}

export default SideContentDocumentation;
